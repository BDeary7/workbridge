# workbridge_api.py — WorkBridge v3.0
# Coach Ray + Live Search + Document Generation + Two-Way SMS
# Deploy: uvicorn workbridge_api:app --host 0.0.0.0 --port $PORT

import os, sqlite3, hashlib, json, asyncio, httpx, re
from datetime import datetime, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from twilio.rest import Client as TwilioClient
from twilio.twiml.messaging_response import MessagingResponse
import stripe

TWILIO_SID     = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM    = os.getenv("TWILIO_FROM_NUMBER", "")
GOOGLE_KEY     = os.getenv("GOOGLE_PLACES_KEY", "")
STRIPE_SECRET  = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK = os.getenv("STRIPE_WEBHOOK_SECRET", "")
ANTHROPIC_KEY  = os.getenv("ANTHROPIC_API_KEY", "")
SECRET_KEY     = os.getenv("SECRET_KEY", "workbridge-secret-2026")

stripe.api_key = STRIPE_SECRET
twilio_client  = TwilioClient(TWILIO_SID, TWILIO_TOKEN) if TWILIO_SID else None
DB_PATH        = "/tmp/workbridge.db"

class ConnectionManager:
    def __init__(self): self.active: dict[str, WebSocket] = {}
    async def connect(self, token, ws):
        await ws.accept(); self.active[token] = ws
    def disconnect(self, token): self.active.pop(token, None)
    async def send(self, token, data):
        ws = self.active.get(token)
        if ws:
            try: await ws.send_json(data)
            except: self.disconnect(token)

manager = ConnectionManager()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL DEFAULT '',
        last_name TEXT NOT NULL DEFAULT '',
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        zip_code TEXT,
        state TEXT,
        language TEXT DEFAULT 'en',
        credits INTEGER DEFAULT 5,
        token TEXT UNIQUE,
        skills TEXT DEFAULT '',
        target_job TEXT DEFAULT '',
        availability TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        contact_company TEXT,
        status TEXT DEFAULT 'active',
        last_message TEXT,
        last_message_at TEXT,
        unread_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, contact_phone)
    );
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        direction TEXT NOT NULL,
        body TEXT NOT NULL,
        from_number TEXT,
        to_number TEXT,
        twilio_sid TEXT,
        status TEXT DEFAULT 'sent',
        sent_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS coach_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        session_json TEXT DEFAULT '[]',
        mission TEXT DEFAULT 'intake',
        updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS generated_docs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        doc_type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        business_name TEXT,
        business_phone TEXT,
        appt_datetime TEXT,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS credits_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount INTEGER,
        reason TEXT,
        stripe_session TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)
    conn.commit(); conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db(); yield

app = FastAPI(title="WorkBridge API v3.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def hash_pw(p): return hashlib.sha256(f"{SECRET_KEY}{p}".encode()).hexdigest()
def make_token(email): return hashlib.sha256(
    f"{SECRET_KEY}{email}{datetime.utcnow().isoformat()}".encode()).hexdigest()

def get_user(request: Request):
    token = request.headers.get("Authorization","").replace("Bearer ","")
    if not token: raise HTTPException(401,"No token")
    conn = get_db()
    u = conn.execute("SELECT * FROM users WHERE token=?", (token,)).fetchone()
    conn.close()
    if not u: raise HTTPException(401,"Invalid token")
    return dict(u)

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone: Optional[str] = None
    zip_code: Optional[str] = None
    state: Optional[str] = None
    language: str = "en"

class LoginRequest(BaseModel):
    email: str
    password: str

class BusinessSearchRequest(BaseModel):
    zip_code: str
    category: str
    radius: int = 5000
    max_results: int = 20

class BlastRequest(BaseModel):
    businesses: List[dict]
    message: str
    category: str
    position: str
    zip_code: str
    message_language: str = "en"

class ReplyRequest(BaseModel):
    conversation_id: int
    body: str

class CoachRequest(BaseModel):
    message: str
    mission: Optional[str] = "intake"

class ProfileUpdateRequest(BaseModel):
    phone: Optional[str] = None
    language: Optional[str] = None
    skills: Optional[str] = None
    target_job: Optional[str] = None
    availability: Optional[str] = None
    zip_code: Optional[str] = None
    state: Optional[str] = None

class AppointmentRequest(BaseModel):
    business_name: str
    business_phone: str
    appt_datetime: str
    notes: Optional[str] = ""

async def web_search(query: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get("https://api.duckduckgo.com/",
                params={"q":query,"format":"json","no_html":"1","skip_disambig":"1"})
            data = r.json()
            results = []
            if data.get("AbstractText"): results.append(data["AbstractText"][:300])
            for item in data.get("RelatedTopics",[])[:4]:
                if isinstance(item,dict) and item.get("Text"):
                    results.append(item["Text"][:200])
            return "\n".join(results) if results else "No results found."
    except Exception as e: return f"Search unavailable: {str(e)}"

def build_user_context(user: dict) -> str:
    return f"""
=== USER PROFILE (PRE-LOADED — NEVER ASK FOR THIS) ===
Full Name: {user.get('first_name','')} {user.get('last_name','')}
Phone: {user.get('phone','')}
Location: {user.get('zip_code','')}, {user.get('state','')}
Language: {user.get('language','en')}
Skills: {user.get('skills','')}
Target Job: {user.get('target_job','')}
Availability: {user.get('availability','')}
=== END PROFILE ==="""

COACH_SYSTEM = """You are Coach Ray — WorkBridge's AI career coach.
You are warm, direct, and genuinely invested in every person you help.
You have seen people go from homeless to employed in 48 hours.

CRITICAL RULES:
- NEVER ask for name, phone, ZIP code, or state — you already have them in the user profile above
- Always respond in the user's language from their profile
- When drafting SMS to businesses, write in ENGLISH (US businesses) unless told otherwise
- Keep responses under 200 words unless generating a document
- Ask ONE question at a time
- End every response with a clear next step

10 MISSIONS: intake > job_search > message_craft > blast_ready > follow_up > interview_prep > credential > negotiation > retention > advance

DOCUMENTS YOU CAN GENERATE:
- Interview Prep Sheet, Salary Negotiation Script, Credential Roadmap, 90-Day Advance Plan, Follow-Up Templates

SMS DRAFTING: Label outgoing SMS as [SMS TO SEND - ENGLISH] so user knows exactly what gets sent."""

async def call_coach_ray(user: dict, message: str, mission: str = "intake") -> dict:
    conn = get_db()
    session = conn.execute("SELECT * FROM coach_sessions WHERE user_id=?",(user["id"],)).fetchone()
    history = json.loads(session["session_json"]) if session else []
    if not session:
        conn.execute("INSERT INTO coach_sessions (user_id,session_json,mission) VALUES (?,?,?)",
            (user["id"],"[]",mission))
        conn.commit()

    history = history[-24:]
    search_ctx = ""
    msg_lower = message.lower()
    if any(k in msg_lower for k in ["salary","pay","wage","earn"]):
        search_ctx = f"\n[LIVE DATA]: {await web_search(f'average salary {user.get(\"target_job\",\"\")} {user.get(\"state\",\"\")} 2025')}\n"
    elif any(k in msg_lower for k in ["certif","license","course","train","program"]):
        search_ctx = f"\n[LIVE DATA]: {await web_search(f'{user.get(\"target_job\",\"\")} certification near {user.get(\"zip_code\",\"\")} {user.get(\"state\",\"\")}')}\n"
    elif any(k in msg_lower for k in ["interview","question","prep"]):
        search_ctx = f"\n[LIVE DATA]: {await web_search(f'common interview questions {user.get(\"target_job\",\"\")} 2025')}\n"
    elif any(k in msg_lower for k in ["ged","diploma","hse"]):
        search_ctx = f"\n[LIVE DATA]: {await web_search(f'free GED resources {user.get(\"state\",\"\")} 2025')}\n"
    elif any(k in msg_lower for k in ["find","job","hiring","work","near"]):
        search_ctx = f"\n[LIVE DATA]: {await web_search(f'jobs hiring {user.get(\"target_job\",\"\")} near {user.get(\"zip_code\",\"\")} {user.get(\"state\",\"\")}')}\n"

    full_msg = message + search_ctx if search_ctx else message
    history.append({"role":"user","content":full_msg})

    system = COACH_SYSTEM + "\n\n" + build_user_context(user) + f"\n\nCURRENT MISSION: {mission}"

    reply = ""
    if not ANTHROPIC_KEY:
        name = user.get("first_name","there")
        reply = f"Hey {name}! Coach Ray here. What kind of work are you looking for?" if user.get("language","en")=="en" else f"¡Hola {name}! Soy Coach Ray. ¿Qué tipo de trabajo buscas?"
    else:
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                res = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","content-type":"application/json"},
                    json={"model":"claude-sonnet-4-20250514","max_tokens":1000,"system":system,"messages":history}
                )
                reply = res.json()["content"][0]["text"]
        except Exception as e:
            reply = f"Coach Ray is momentarily unavailable. ({str(e)[:60]})"

    history.append({"role":"assistant","content":reply})
    conn.execute("UPDATE coach_sessions SET session_json=?,mission=?,updated_at=? WHERE user_id=?",
        (json.dumps(history),mission,datetime.utcnow().isoformat(),user["id"]))

    doc = None
    doc_keywords = ["interview prep sheet","negotiation script","credential roadmap","90-day","follow-up template"]
    if any(k in reply.lower() for k in doc_keywords):
        doc_type = "interview_prep" if "interview prep" in reply.lower() else \
                   "negotiation_script" if "negotiation" in reply.lower() else \
                   "credential_roadmap" if "credential" in reply.lower() else \
                   "advance_plan" if "90-day" in reply.lower() else "followup_templates"
        doc_content = await generate_document(doc_type, user)
        if doc_content:
            cur = conn.execute("INSERT INTO generated_docs (user_id,doc_type,title,content) VALUES (?,?,?,?)",
                (user["id"],doc_type,doc_content["title"],doc_content["content"]))
            doc = {"id":cur.lastrowid,"type":doc_type,"title":doc_content["title"]}

    conn.commit(); conn.close()
    return {"reply":reply,"mission":mission,"doc":doc}

async def generate_document(doc_type: str, user: dict) -> Optional[dict]:
    if not ANTHROPIC_KEY: return None
    first = user.get("first_name","")
    job   = user.get("target_job","your target job")
    state = user.get("state","")
    prompts = {
        "interview_prep": f"Generate a complete Interview Prep Sheet for {first} applying for {job} in {state}. Include: what to wear, what to bring, 10 likely questions with coached answers, 3 smart questions to ask employer, day-of checklist.",
        "negotiation_script": f"Generate a Salary Negotiation Script for {first} for {job} in {state}. Include word-for-word scripts, how to counter, what to say if they can't go higher, benefits negotiation.",
        "credential_roadmap": f"Generate a Credential Roadmap for {first} pursuing {job} in {state}. Include fastest path, step-by-step timeline, estimated costs, free resources.",
        "advance_plan": f"Generate a 90-Day Career Advance Plan for {first} in {job}. Days 1-30 foundation, 31-60 growth, 61-90 advance. Specific daily actions.",
        "followup_templates": f"Generate 3 Follow-Up SMS Templates for {first} following up about {job}. Each under 160 chars. Soft, value-add, and final follow-up.",
    }
    titles = {
        "interview_prep": f"Interview Prep Sheet — {job}",
        "negotiation_script": f"Salary Negotiation Script — {job}",
        "credential_roadmap": f"Credential Roadmap — {job}",
        "advance_plan": "90-Day Career Advance Plan",
        "followup_templates": "Follow-Up Message Templates",
    }
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={"x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","content-type":"application/json"},
                json={"model":"claude-sonnet-4-20250514","max_tokens":1500,
                      "messages":[{"role":"user","content":prompts[doc_type]}]}
            )
            return {"title":titles[doc_type],"content":res.json()["content"][0]["text"]}
    except: return None

async def send_sms(to: str, body: str) -> Optional[str]:
    if not twilio_client or not TWILIO_FROM: return "mock-sid"
    try:
        msg = twilio_client.messages.create(body=body, from_=TWILIO_FROM, to=to)
        return msg.sid
    except Exception as e: print(f"SMS error: {e}"); return None

def normalize_phone(phone: str) -> str:
    digits = "".join(c for c in phone if c.isdigit())
    if len(digits)==10: return f"+1{digits}"
    elif len(digits)==11 and digits.startswith("1"): return f"+{digits}"
    return f"+{digits}"

@app.post("/auth/register")
async def register(req: RegisterRequest):
    conn = get_db()
    if conn.execute("SELECT id FROM users WHERE email=?",(req.email,)).fetchone():
        conn.close(); raise HTTPException(400,"Email already registered")
    token = make_token(req.email)
    conn.execute("""INSERT INTO users
        (first_name,last_name,email,password_hash,phone,zip_code,state,language,credits,token)
        VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (req.first_name,req.last_name,req.email,hash_pw(req.password),
         req.phone,req.zip_code,req.state,req.language,5,token))
    conn.commit(); conn.close()
    return {"token":token,"credits":5,"name":req.first_name,
            "message":f"Welcome to WorkBridge, {req.first_name}!"}

@app.post("/auth/login")
async def login(req: LoginRequest):
    conn = get_db()
    u = conn.execute("SELECT * FROM users WHERE email=? AND password_hash=?",
        (req.email,hash_pw(req.password))).fetchone()
    if not u: conn.close(); raise HTTPException(401,"Invalid credentials")
    token = make_token(req.email)
    conn.execute("UPDATE users SET token=? WHERE id=?",(token,u["id"]))
    conn.commit(); conn.close()
    return {"token":token,"name":u["first_name"],"credits":u["credits"],
            "language":u["language"],"zip_code":u["zip_code"],"state":u["state"]}

@app.get("/auth/me")
async def me(user=Depends(get_user)):
    return {k:v for k,v in user.items() if k!="password_hash"}

@app.post("/profile/update")
async def update_profile(req: ProfileUpdateRequest, user=Depends(get_user)):
    conn = get_db()
    for f in ["phone","language","skills","target_job","availability","zip_code","state"]:
        v = getattr(req,f,None)
        if v is not None: conn.execute(f"UPDATE users SET {f}=? WHERE id=?",(v,user["id"]))
    conn.commit(); conn.close()
    return {"status":"updated"}

@app.post("/search/businesses")
async def search_businesses(req: BusinessSearchRequest, user=Depends(get_user)):
    if not GOOGLE_KEY:
        return {"businesses":[
            {"name":f"Sample Business {i}","phone":f"94955500{10+i:02d}",
             "address":f"{i*100} Main St, {req.zip_code}","rating":round(3.5+(i%3)*0.5,1),"place_id":f"mock_{i}"}
            for i in range(1,6)],"total":5}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            geo = await client.get("https://maps.googleapis.com/maps/api/geocode/json",
                params={"address":req.zip_code,"key":GOOGLE_KEY})
            loc = geo.json()["results"][0]["geometry"]["location"]
            places = await client.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                params={"location":f"{loc['lat']},{loc['lng']}","radius":req.radius,
                        "keyword":req.category,"type":"establishment","key":GOOGLE_KEY})
            results = places.json().get("results",[])
            businesses = []
            for r in results[:req.max_results]:
                phone = ""
                if r.get("place_id"):
                    detail = await client.get("https://maps.googleapis.com/maps/api/place/details/json",
                        params={"place_id":r["place_id"],"fields":"formatted_phone_number","key":GOOGLE_KEY})
                    phone = detail.json().get("result",{}).get("formatted_phone_number","")
                businesses.append({"name":r.get("name",""),"phone":phone,
                    "address":r.get("vicinity",""),"rating":r.get("rating",0),"place_id":r.get("place_id","")})
        return {"businesses":[b for b in businesses if b["phone"]],"total":len(businesses)}
    except Exception as e: raise HTTPException(500,str(e))

@app.post("/sms/blast")
async def sms_blast(req: BlastRequest, user=Depends(get_user)):
    conn = get_db()
    u = conn.execute("SELECT * FROM users WHERE id=?",(user["id"],)).fetchone()
    if u["credits"] < len(req.businesses):
        conn.close(); raise HTTPException(402,f"Need {len(req.businesses)} credits, have {u['credits']}")
    sent,failed,conv_ids = 0,[],[]
    for biz in req.businesses:
        phone_raw = biz.get("phone","")
        if not phone_raw: failed.append(biz.get("name","Unknown")); continue
        phone = normalize_phone(phone_raw)
        biz_name = biz.get("name","Business")
        existing = conn.execute("SELECT id FROM conversations WHERE user_id=? AND contact_phone=?",
            (user["id"],phone)).fetchone()
        if existing:
            conv_id = existing["id"]
            conn.execute("UPDATE conversations SET status='active',last_message=?,last_message_at=? WHERE id=?",
                (req.message,datetime.utcnow().isoformat(),conv_id))
        else:
            cur = conn.execute("""INSERT INTO conversations
                (user_id,contact_phone,contact_name,contact_company,last_message,last_message_at)
                VALUES (?,?,?,?,?,?)""",(user["id"],phone,biz_name,biz_name,req.message,datetime.utcnow().isoformat()))
            conv_id = cur.lastrowid
        sid = await send_sms(phone, req.message)
        conn.execute("""INSERT INTO messages
            (conversation_id,user_id,direction,body,from_number,to_number,twilio_sid)
            VALUES (?,?,?,?,?,?,?)""",(conv_id,user["id"],"outbound",req.message,TWILIO_FROM or "WorkBridge",phone,sid or ""))
        if sid: sent+=1; conv_ids.append(conv_id)
        else: failed.append(biz_name)
    if sent>0: conn.execute("UPDATE users SET credits=credits-? WHERE id=?",(sent,user["id"]))
    new_bal = conn.execute("SELECT credits FROM users WHERE id=?",(user["id"],)).fetchone()["credits"]
    conn.commit(); conn.close()
    await manager.send(u["token"],{"type":"blast_complete","sent":sent,"failed":failed,
        "credits_remaining":new_bal,"conversation_ids":conv_ids})
    return {"sent":sent,"failed":len(failed),"credits_remaining":new_bal}

@app.get("/sms/inbox")
async def get_inbox(user=Depends(get_user)):
    conn = get_db()
    convs = conn.execute("SELECT * FROM conversations WHERE user_id=? ORDER BY last_message_at DESC",(user["id"],)).fetchall()
    conn.close()
    return {"conversations":[dict(c) for c in convs]}

@app.get("/sms/thread/{conversation_id}")
async def get_thread(conversation_id: int, user=Depends(get_user)):
    conn = get_db()
    conv = conn.execute("SELECT * FROM conversations WHERE id=? AND user_id=?",(conversation_id,user["id"])).fetchone()
    if not conv: conn.close(); raise HTTPException(404,"Not found")
    msgs = conn.execute("SELECT * FROM messages WHERE conversation_id=? ORDER BY sent_at ASC",(conversation_id,)).fetchall()
    conn.execute("UPDATE conversations SET unread_count=0 WHERE id=?",(conversation_id,))
    conn.commit(); conn.close()
    return {"conversation":dict(conv),"messages":[dict(m) for m in msgs]}

@app.post("/sms/reply")
async def send_reply(req: ReplyRequest, user=Depends(get_user)):
    conn = get_db()
    conv = conn.execute("SELECT * FROM conversations WHERE id=? AND user_id=?",(req.conversation_id,user["id"])).fetchone()
    if not conv: conn.close(); raise HTTPException(404,"Not found")
    u = conn.execute("SELECT credits FROM users WHERE id=?",(user["id"],)).fetchone()
    if u["credits"]<1: conn.close(); raise HTTPException(402,"No credits")
    sid = await send_sms(conv["contact_phone"],req.body)
    conn.execute("""INSERT INTO messages
        (conversation_id,user_id,direction,body,from_number,to_number,twilio_sid)
        VALUES (?,?,?,?,?,?,?)""",(req.conversation_id,user["id"],"outbound",req.body,TWILIO_FROM or "WorkBridge",conv["contact_phone"],sid or ""))
    conn.execute("UPDATE conversations SET last_message=?,last_message_at=? WHERE id=?",
        (req.body,datetime.utcnow().isoformat(),req.conversation_id))
    conn.execute("UPDATE users SET credits=credits-1 WHERE id=?",(user["id"],))
    new_bal = conn.execute("SELECT credits FROM users WHERE id=?",(user["id"],)).fetchone()["credits"]
    conn.commit(); conn.close()
    return {"status":"sent","credits_remaining":new_bal}

@app.post("/sms/reply/webhook")
async def inbound_webhook(request: Request):
    form = await request.form()
    from_number = form.get("From","")
    body = form.get("Body","").strip()
    conn = get_db()
    conv = conn.execute("SELECT * FROM conversations WHERE contact_phone=? ORDER BY last_message_at DESC LIMIT 1",(from_number,)).fetchone()
    if conv:
        conn.execute("""INSERT INTO messages
            (conversation_id,user_id,direction,body,from_number,to_number,status)
            VALUES (?,?,?,?,?,?,?)""",(conv["id"],conv["user_id"],"inbound",body,from_number,TWILIO_FROM or "WorkBridge","received"))
        conn.execute("""UPDATE conversations SET last_message=?,last_message_at=?,
            unread_count=unread_count+1,status='replied' WHERE id=?""",(body,datetime.utcnow().isoformat(),conv["id"]))
        conn.commit()
        u = conn.execute("SELECT * FROM users WHERE id=?",(conv["user_id"],)).fetchone()
        if u:
            await manager.send(u["token"],{"type":"new_message","conversation_id":conv["id"],
                "from":conv["contact_name"],"body":body,"alert":f"🎉 {conv['contact_name']} replied!"})
            if u["phone"]:
                await send_sms(u["phone"],f"WorkBridge: {conv['contact_name']} replied!\n\"{body[:80]}\"\nLog in: workbridgesms.com")
    conn.close()
    return PlainTextResponse(str(MessagingResponse()),media_type="application/xml")

@app.get("/sms/history")
async def sms_history(limit: int=50, user=Depends(get_user)):
    conn = get_db()
    msgs = conn.execute("""SELECT m.*,c.contact_name,c.contact_phone FROM messages m
        JOIN conversations c ON m.conversation_id=c.id
        WHERE m.user_id=? ORDER BY m.sent_at DESC LIMIT ?""",(user["id"],limit)).fetchall()
    conn.close()
    return {"history":[dict(m) for m in msgs]}

@app.post("/coach/chat")
async def coach_chat(req: CoachRequest, user=Depends(get_user)):
    return await call_coach_ray(user, req.message, req.mission or "intake")

@app.get("/coach/session")
async def get_session(user=Depends(get_user)):
    conn = get_db()
    s = conn.execute("SELECT * FROM coach_sessions WHERE user_id=?",(user["id"],)).fetchone()
    conn.close()
    if not s: return {"history":[],"mission":"intake"}
    return {"history":json.loads(s["session_json"]),"mission":s["mission"]}

@app.post("/coach/reset")
async def reset_session(user=Depends(get_user)):
    conn = get_db()
    conn.execute("DELETE FROM coach_sessions WHERE user_id=?",(user["id"],))
    conn.commit(); conn.close()
    return {"status":"reset"}

@app.post("/coach/draft-message")
async def draft_message(request: Request, user=Depends(get_user)):
    body = await request.json()
    ctx = body.get("context",{})
    msg_lang = body.get("message_language","en")
    lang_note = "Write the SMS in English for a US business." if msg_lang=="en" else f"Write the SMS in {msg_lang}."
    prompt = f"""Draft a professional SMS for a job seeker. {lang_note}
Name: {ctx.get('name',user.get('first_name',''))} {user.get('last_name','')}
Skills: {ctx.get('skills',user.get('skills','relevant experience'))}
Position: {ctx.get('position',user.get('target_job','employment'))}
Rules: Max 160 chars. Include first name. Mention key skill. Ask if hiring. End with WorkBridge. Sound human.
Return ONLY the message text."""
    if not ANTHROPIC_KEY:
        return {"message":f"Hi, I'm {user.get('first_name','')}. I have experience in {user.get('target_job','this field')} and am seeking work. Are you hiring? — WorkBridge"}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.post("https://api.anthropic.com/v1/messages",
                headers={"x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","content-type":"application/json"},
                json={"model":"claude-sonnet-4-20250514","max_tokens":200,"messages":[{"role":"user","content":prompt}]})
            return {"message":res.json()["content"][0]["text"].strip().strip('"')}
    except:
        return {"message":f"Hi, I'm {user.get('first_name','')} and I'm looking for {user.get('target_job','work')}. Are you hiring? — WorkBridge"}

@app.get("/coach/docs")
async def get_docs(user=Depends(get_user)):
    conn = get_db()
    docs = conn.execute("SELECT id,doc_type,title,created_at FROM generated_docs WHERE user_id=? ORDER BY created_at DESC",(user["id"],)).fetchall()
    conn.close()
    return {"docs":[dict(d) for d in docs]}

@app.get("/coach/docs/{doc_id}")
async def get_doc(doc_id: int, user=Depends(get_user)):
    conn = get_db()
    doc = conn.execute("SELECT * FROM generated_docs WHERE id=? AND user_id=?",(doc_id,user["id"])).fetchone()
    conn.close()
    if not doc: raise HTTPException(404,"Not found")
    return dict(doc)

@app.post("/appointments/create")
async def create_appt(req: AppointmentRequest, background_tasks: BackgroundTasks, user=Depends(get_user)):
    conn = get_db()
    appt_dt = datetime.fromisoformat(req.appt_datetime)
    cur = conn.execute("INSERT INTO appointments (user_id,business_name,business_phone,appt_datetime,notes) VALUES (?,?,?,?,?)",
        (user["id"],req.business_name,req.business_phone,req.appt_datetime,req.notes))
    appt_id = cur.lastrowid; conn.commit(); conn.close()
    background_tasks.add_task(schedule_reminders,appt_id,user,req,appt_dt)
    return {"appt_id":appt_id,"status":"scheduled","message":f"Interview with {req.business_name} scheduled!"}

async def schedule_reminders(appt_id,user,req,appt_dt):
    now = datetime.utcnow()
    for hours,msg in [(24,f"WorkBridge: Interview tomorrow at {appt_dt.strftime('%I:%M %p')} with {req.business_name}. You've got this! 💪"),
                      (2,f"WorkBridge: Interview in 2 hours at {req.business_name}. Be on time!")]:
        remind_at = appt_dt-timedelta(hours=hours)
        if remind_at>now:
            await asyncio.sleep((remind_at-now).total_seconds())
            if user.get("phone"): await send_sms(user["phone"],msg)

@app.get("/appointments")
async def get_appts(user=Depends(get_user)):
    conn = get_db()
    appts = conn.execute("SELECT * FROM appointments WHERE user_id=? ORDER BY appt_datetime DESC",(user["id"],)).fetchall()
    conn.close()
    return {"appointments":[dict(a) for a in appts]}

PACKAGES = {
    "starter":{"credits":10,"price":100,"name":"Starter"},
    "popular":{"credits":50,"price":450,"name":"Popular"},
    "best_value":{"credits":100,"price":800,"name":"Best Value"},
    "pro":{"credits":250,"price":1800,"name":"Pro"},
}

@app.post("/credits/purchase")
async def purchase(request: Request, user=Depends(get_user)):
    body = await request.json()
    pkg = PACKAGES.get(body.get("package","popular"),PACKAGES["popular"])
    if not STRIPE_SECRET: return {"url":"https://stripe.com/mock","mock":True}
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price_data":{"currency":"usd","product_data":{"name":f"WorkBridge {pkg['name']} — {pkg['credits']} Credits"},"unit_amount":pkg["price"]},"quantity":1}],
            mode="payment",
            success_url="https://workbridgesms.com/dashboard?credits=added",
            cancel_url="https://workbridgesms.com/dashboard",
            metadata={"user_id":str(user["id"]),"credits":str(pkg["credits"])})
        return {"url":session.url}
    except Exception as e: raise HTTPException(500,str(e))

@app.post("/credits/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature","")
    if STRIPE_WEBHOOK:
        try: event = stripe.Webhook.construct_event(payload,sig,STRIPE_WEBHOOK)
        except: raise HTTPException(400,"Invalid signature")
    else: event = json.loads(payload)
    if event["type"]=="checkout.session.completed":
        meta = event["data"]["object"].get("metadata",{})
        uid = int(meta.get("user_id",0)); cred = int(meta.get("credits",0))
        if uid and cred:
            conn = get_db()
            conn.execute("UPDATE users SET credits=credits+? WHERE id=?",(cred,uid))
            conn.commit()
            u = conn.execute("SELECT token,phone FROM users WHERE id=?",(uid,)).fetchone()
            conn.close()
            if u:
                await manager.send(u["token"],{"type":"credits_added","credits":cred})
                if u["phone"]: await send_sms(u["phone"],f"WorkBridge: {cred} credits added!")
    return {"status":"ok"}

@app.get("/credits/balance")
async def balance(user=Depends(get_user)):
    conn = get_db()
    u = conn.execute("SELECT credits FROM users WHERE id=?",(user["id"],)).fetchone()
    conn.close()
    return {"credits":u["credits"] if u else 0,"packages":PACKAGES}

@app.websocket("/ws/{token}")
async def ws_endpoint(websocket: WebSocket, token: str):
    conn = get_db()
    u = conn.execute("SELECT id FROM users WHERE token=?",(token,)).fetchone()
    conn.close()
    if not u: await websocket.close(code=4001); return
    await manager.connect(token,websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data=="ping": await websocket.send_json({"type":"pong"})
    except WebSocketDisconnect: manager.disconnect(token)

@app.get("/health")
async def health():
    return {"status":"ok","version":"3.0","services":{
        "twilio":bool(TWILIO_SID),"anthropic":bool(ANTHROPIC_KEY),
        "stripe":bool(STRIPE_SECRET),"google":bool(GOOGLE_KEY)}}

@app.get("/")
async def root():
    return {"message":"WorkBridge API v3.0 — Coach Ray + Live Search + Two-Way SMS"}
