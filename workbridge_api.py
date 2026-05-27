# workbridge_api.py — WorkBridge v3.0
# Coach Ray + Live Search + Document Generation + Two-Way SMS
# Deploy: uvicorn workbridge_api:app --host 0.0.0.0 --port $PORT

import os, hashlib, json, asyncio, httpx, re
from datetime import datetime, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager
import psycopg2
import psycopg2.extras

DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_db():
    if DATABASE_URL:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
        conn.autocommit = False
        return conn
    else:
        import sqlite3
        conn = sqlite3.connect("/tmp/workbridge.db")
        conn.row_factory = sqlite3.Row
        return conn

def is_pg():
    return bool(DATABASE_URL)

def placeholder(n=1):
    if is_pg():
        return ",".join(["%s"]*n)
    return ",".join(["?"]*n)

def ph(n=1):
    return placeholder(n)
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
    if is_pg():
        cur = conn.cursor()
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
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
            profile_json TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            contact_phone TEXT NOT NULL,
            contact_name TEXT NOT NULL,
            contact_company TEXT,
            status TEXT DEFAULT 'active',
            last_message TEXT,
            last_message_at TEXT,
            unread_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')),
            UNIQUE(user_id, contact_phone)
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            direction TEXT NOT NULL,
            body TEXT NOT NULL,
            from_number TEXT,
            to_number TEXT,
            twilio_sid TEXT,
            status TEXT DEFAULT 'sent',
            sent_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS coach_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL UNIQUE,
            session_json TEXT DEFAULT '[]',
            mission TEXT DEFAULT 'intake',
            updated_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS generated_docs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            doc_type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            business_name TEXT,
            business_phone TEXT,
            appt_datetime TEXT,
            notes TEXT,
            status TEXT DEFAULT 'scheduled',
            created_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS credits_log (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            amount INTEGER,
            reason TEXT,
            stripe_session TEXT,
            created_at TEXT DEFAULT (to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        cur.execute("""
        CREATE TABLE IF NOT EXISTS placements (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            conversation_id INTEGER,
            employer_name TEXT,
            status TEXT DEFAULT 'contacted',
            notes TEXT,
            wage TEXT,
            hired_at TEXT,
            created_at TEXT,
            updated_at TEXT
        )""")
        conn.commit()
        cur.close()
        conn.close()
        return
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
    CREATE TABLE IF NOT EXISTS placements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        conversation_id INTEGER,
        employer_name TEXT,
        status TEXT DEFAULT 'contacted',
        notes TEXT,
        wage TEXT,
        hired_at TEXT,
        created_at TEXT,
        updated_at TEXT
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
    u = conn.execute("SELECT * FROM users WHERE token=%s", (token,)).fetchone()
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

COACH_SYSTEM = """You are Coach Ray — WorkBridge's AI specialist.
You are warm, direct, and genuinely invested in every person you help.
You have seen people go from homeless to employed in 48 hours. You are a DOER — not just a guide.

CRITICAL RULES:
- NEVER ask for name, phone, ZIP code, or state — already in profile above
- Always respond in the user's language (Spanish if language=es)
- SMS to businesses: always in ENGLISH regardless of user language
- Keep responses under 200 words unless generating a document
- Ask ONE question at a time
- End EVERY response with a concrete next step YOU will take for them
- You do the heavy lifting — search, draft, connect, send

MISSION-SPECIFIC BEHAVIOR:

[JOB SEARCH]
- Draft personalized SMS outreach to employers based on user's skills
- Find employers actively hiring near their ZIP using live search data
- Generate interview prep sheets, follow-up templates, negotiation scripts
- Track applications and follow up automatically after 3 days
- Match veterans to contractor jobs, seniors to part-time, parents to flexible schedules

[EDUCATION]
- Find FREE GED programs near user's ZIP — call centers, community colleges, libraries
- Find trade school programs with financial aid options
- Find apprenticeships and on-the-job training programs
- Draft enrollment inquiry SMS/emails on user's behalf
- Generate a personalized study plan with daily goals

[HOUSING]
- Search 211.org database for emergency shelter near ZIP
- Find Section 8 voucher offices and waitlist status
- Identify transitional housing, sober living, veterans housing
- Draft housing application cover letters
- Find rental assistance programs (ERAP, ESG, CoC)

[SENIOR CARE]
- Find licensed assisted living and memory care near ZIP
- Check Medi-Cal/Medicare coverage options
- Find in-home care agencies and cost estimates
- Draft family inquiry letters to facilities
- Find adult day programs and respite care

[DEBT / TAX RELIEF]
- Search IRS Fresh Start program eligibility
- Find NFCC-certified free credit counselors by state
- Find nonprofit debt management programs
- Draft hardship letters to creditors
- Generate debt payoff strategy based on balances

[VEHICLE]
- Find USAA and military appreciation dealer programs
- Search CarMax and AutoNation inventory near ZIP
- Find buy-here-pay-here dealers for credit-challenged buyers
- Calculate monthly payment estimates
- Draft purchase inquiry messages to dealers

[HOME SERVICES]
- Search CSLB or state licensing board for contractor verification
- Find licensed, insured contractors near ZIP
- Get BBB ratings and reviews
- Draft service request messages
- Flag unlicensed or uninsured contractors as HIGH RISK

[HOUSEHOLD HELP]
- Find vetted cleaning, lawn, and home service companies near ZIP
- Search Care.com and TaskRabbit alternatives
- Compare pricing and availability
- Draft service booking requests

[HIRE WORKERS / BUSINESS]
- Pull from WorkBridge job seeker pool for matching candidates
- Draft job posting SMS for rapid outreach
- Screen candidates based on mission answers
- Schedule interview batches

[VETERANS HUB]
- Translate MOS codes to civilian job titles
- Connect to VA Vocational Rehabilitation (Ch. 31)
- Find veteran-preference federal jobs on USAJOBS
- Draft DD-214 civilian resume bullet points
- Connect to Hire Heroes USA and ACP mentoring

DOCUMENTS YOU CAN GENERATE:
- Interview Prep Sheet, Salary Negotiation Script, Credential Roadmap
- 90-Day Advance Plan, Follow-Up Templates, Housing Application Letter
- Debt Hardship Letter, GED Study Plan, VA Benefits Summary

SMS DRAFTING: Label outgoing SMS as [SMS TO SEND - ENGLISH] so user knows exactly what gets sent.

ALWAYS end with: what you found, what you drafted, what you're sending next."""

async def call_coach_ray(user: dict, message: str, mission: str = "intake") -> dict:
    conn = get_db()
    session = conn.execute("SELECT * FROM coach_sessions WHERE user_id=%s",(user["id"],)).fetchone()
    history = json.loads(session["session_json"]) if session else []
    if not session:
        conn.execute("INSERT INTO coach_sessions (user_id,session_json,mission) VALUES (%s,%s,%s)",
            (user["id"],"[]",mission))
        conn.commit()

    history = history[-24:]
    search_ctx = ""
    msg_lower = message.lower()
    job   = user.get("target_job","") or ""
    state = user.get("state","") or ""
    zp    = user.get("zip_code","") or ""
    lang  = user.get("language","en") or "en"

    # Mission-aware live search — fires on first message of each mission
    try:
        if mission == "education" or any(k in msg_lower for k in ["ged","diploma","trade school","college","program","certif"]):
            q = f"free GED programs adult education near {zp} {state} 2025"
            search_ctx += "\n[GED/EDUCATION RESOURCES]: " + (await web_search(q)) + "\n"
            q = f"trade school apprenticeship programs {state} financial aid 2025"
            search_ctx += "\n[TRADE PROGRAMS]: " + (await web_search(q)) + "\n"

        elif mission == "housing" or any(k in msg_lower for k in ["shelter","housing","homeless","section 8","rent"]):
            q = f"emergency shelter housing assistance near {zp} {state}"
            search_ctx += "\n[HOUSING RESOURCES]: " + (await web_search(q)) + "\n"
            q = f"section 8 voucher waitlist rental assistance {zp} {state}"
            search_ctx += "\n[RENTAL ASSISTANCE]: " + (await web_search(q)) + "\n"

        elif mission == "debt" or any(k in msg_lower for k in ["debt","credit","irs","tax","collection","loan"]):
            q = f"IRS Fresh Start program debt relief nonprofit {state} 2025"
            search_ctx += "\n[DEBT RELIEF]: " + (await web_search(q)) + "\n"
            q = f"NFCC credit counseling free {state} 2025"
            search_ctx += "\n[CREDIT COUNSELING]: " + (await web_search(q)) + "\n"

        elif mission == "senior" or any(k in msg_lower for k in ["senior","elderly","assisted","memory care","caregiver"]):
            q = f"assisted living memory care facilities near {zp} {state} Medi-Cal"
            search_ctx += "\n[SENIOR CARE]: " + (await web_search(q)) + "\n"
            q = f"in-home care agencies {zp} {state} cost 2025"
            search_ctx += "\n[IN-HOME CARE]: " + (await web_search(q)) + "\n"

        elif mission == "vehicle" or any(k in msg_lower for k in ["car","vehicle","truck","auto","dealer","usaa"]):
            q = f"USAA military car buying program dealers near {zp}"
            search_ctx += "\n[VEHICLE RESOURCES]: " + (await web_search(q)) + "\n"
            q = f"buy here pay here dealers bad credit {zp} {state}"
            search_ctx += "\n[CAR DEALERS]: " + (await web_search(q)) + "\n"

        elif mission == "home" or any(k in msg_lower for k in ["plumber","electrician","contractor","repair","handyman"]):
            q = f"licensed insured contractors near {zp} {state} BBB"
            search_ctx += "\n[CONTRACTOR SEARCH]: " + (await web_search(q)) + "\n"

        elif mission == "chores" or any(k in msg_lower for k in ["clean","lawn","mow","housekeeping","laundry"]):
            q = f"house cleaning lawn care services near {zp} {state} affordable"
            search_ctx += "\n[HOME SERVICES]: " + (await web_search(q)) + "\n"

        elif mission == "veteran" or any(k in msg_lower for k in ["va","veteran","military","mos","voc rehab","gi bill"]):
            q = f"VA vocational rehabilitation jobs veteran employment {state} 2025"
            search_ctx += "\n[VETERAN RESOURCES]: " + (await web_search(q)) + "\n"
            q = f"federal jobs veteran preference USAJOBS {state} hiring"
            search_ctx += "\n[FEDERAL JOBS]: " + (await web_search(q)) + "\n"

        elif mission in ["job","intake"] or any(k in msg_lower for k in ["salary","pay","wage","hiring","work","near","job"]):
            if any(k in msg_lower for k in ["salary","pay","wage","earn"]):
                q = f"average salary {job} {state} 2025"
            else:
                q = f"jobs hiring {job} near {zp} {state}"
            search_ctx += "\n[JOB MARKET]: " + (await web_search(q)) + "\n"

    except Exception as se:
        search_ctx = f"\n[Search unavailable: {str(se)[:50]}]\n"

    # Build full system with user profile + live search data
    profile = f"""
USER PROFILE:
Name: {user.get("first_name","")} {user.get("last_name","")}
Phone: {user.get("phone","")}
ZIP: {user.get("zip_code","")}
State: {user.get("state","")}
Language: {user.get("language","en")}
Target Job: {user.get("target_job","")}
Skills: {user.get("skills","")}
Availability: {user.get("availability","")}
Current Mission: {mission}
{search_ctx}"""

    full_system = COACH_SYSTEM + profile

    # Add user message to history
    history.append({"role":"user","content":message})

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
                    json={"model":"claude-sonnet-4-20250514","max_tokens":1000,"system":full_system,"messages":history}
                )
                reply = res.json()["content"][0]["text"]
        except Exception as e:
            reply = f"Coach Ray is momentarily unavailable. ({str(e)[:60]})"

    history.append({"role":"assistant","content":reply})
    # Save without the user message in history (already stored above)
    conn.execute("UPDATE coach_sessions SET session_json=%s,mission=%s,updated_at=%s WHERE user_id=%s",
        (json.dumps(history),mission,datetime.utcnow().isoformat(),user["id"]))

    doc = None
    doc_keywords = ["interview prep","negotiation script","credential roadmap","90-day",
                    "follow-up template","housing application","hardship letter",
                    "ged study plan","va benefits","debt payoff","service request"]
    if any(k in reply.lower() for k in doc_keywords):
        doc_type = "interview_prep"      if "interview prep" in reply.lower() else \
                   "negotiation_script"  if "negotiation script" in reply.lower() else \
                   "credential_roadmap"  if "credential roadmap" in reply.lower() else \
                   "advance_plan"        if "90-day" in reply.lower() else \
                   "housing_letter"      if "housing application" in reply.lower() else \
                   "hardship_letter"     if "hardship letter" in reply.lower() else \
                   "ged_study_plan"      if "ged study plan" in reply.lower() else \
                   "va_benefits_summary" if "va benefits" in reply.lower() else \
                   "debt_payoff_plan"    if "debt payoff" in reply.lower() else \
                   "followup_templates"
        doc_content = await generate_document(doc_type, user)
        if doc_content:
            cur = conn.execute("INSERT INTO generated_docs (user_id,doc_type,title,content) VALUES (%s,%s,%s,%s)",
                (user["id"],doc_type,doc_content["title"],doc_content["content"]))
            doc = {"id":cur.lastrowid if not is_pg() else cur.fetchone()[0] if cur.rowcount > 0 else 0,"type":doc_type,"title":doc_content["title"]}

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
        "housing_letter": f"Generate a Housing Application Cover Letter for {first} in {state}. Include: hardship summary, stable income proof, references section, request for consideration. Professional and compassionate tone.",
        "hardship_letter": f"Generate a Debt Hardship Letter for {first} to send to creditors in {state}. Include: financial hardship explanation, proposed payment plan, request for interest reduction, professional tone.",
        "ged_study_plan": f"Generate a 30-Day GED Study Plan for {first} in {state}. Include: daily study schedule, free resources, practice test schedule, subject breakdown (Math, RLA, Science, Social Studies), tips.",
        "va_benefits_summary": f"Generate a VA Benefits Summary for veteran {first} in {state}. Include: disability claim checklist, education benefits (GI Bill), home loan eligibility, vocational rehab (Ch.31), healthcare enrollment steps.",
        "debt_payoff_plan": f"Generate a Debt Payoff Strategy for {first} in {state}. Include: snowball vs avalanche comparison, IRS Fresh Start eligibility, NFCC counselor resources, sample 12-month payoff timeline.",
    }
    titles = {
        "interview_prep": f"Interview Prep Sheet — {job}",
        "negotiation_script": f"Salary Negotiation Script — {job}",
        "credential_roadmap": f"Credential Roadmap — {job}",
        "advance_plan": "90-Day Career Advance Plan",
        "followup_templates": "Follow-Up Message Templates",
        "housing_letter": "Housing Application Cover Letter",
        "hardship_letter": "Debt Hardship Letter",
        "ged_study_plan": "30-Day GED Study Plan",
        "va_benefits_summary": "VA Benefits Summary",
        "debt_payoff_plan": "Debt Payoff Strategy",
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
    if conn.execute("SELECT id FROM users WHERE email=%s",(req.email,)).fetchone():
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
    u = conn.execute("SELECT * FROM users WHERE email=%s AND password_hash=%s",
        (req.email,hash_pw(req.password))).fetchone()
    if not u: conn.close(); raise HTTPException(401,"Invalid credentials")
    token = make_token(req.email)
    conn.execute("UPDATE users SET token=%s WHERE id=%s",(token,u["id"]))
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
        if v is not None: conn.execute(f"UPDATE users SET {f}=%s WHERE id=%s",(v,user["id"]))
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
    u = conn.execute("SELECT * FROM users WHERE id=%s",(user["id"],)).fetchone()
    if u["credits"] < len(req.businesses):
        conn.close(); raise HTTPException(402,f"Need {len(req.businesses)} credits, have {u['credits']}")
    sent,failed,conv_ids = 0,[],[]
    for biz in req.businesses:
        phone_raw = biz.get("phone","")
        if not phone_raw: failed.append(biz.get("name","Unknown")); continue
        phone = normalize_phone(phone_raw)
        biz_name = biz.get("name","Business")
        existing = conn.execute("SELECT id FROM conversations WHERE user_id=%s AND contact_phone=%s",
            (user["id"],phone)).fetchone()
        if existing:
            conv_id = existing["id"]
            conn.execute("UPDATE conversations SET status='active',last_message=%s,last_message_at=%s WHERE id=%s",
                (req.message,datetime.utcnow().isoformat(),conv_id))
        else:
            cur = conn.execute("""INSERT INTO conversations
                (user_id,contact_phone,contact_name,contact_company,last_message,last_message_at)
                VALUES (?,?,?,?,?,?)""",(user["id"],phone,biz_name,biz_name,req.message,datetime.utcnow().isoformat()))
            conv_id = cur.lastrowid if not is_pg() else cur.fetchone()[0] if cur.rowcount > 0 else 0
        sid = await send_sms(phone, req.message)
        conn.execute("""INSERT INTO messages
            (conversation_id,user_id,direction,body,from_number,to_number,twilio_sid)
            VALUES (?,?,?,?,?,?,?)""",(conv_id,user["id"],"outbound",req.message,TWILIO_FROM or "WorkBridge",phone,sid or ""))
        if sid: sent+=1; conv_ids.append(conv_id)
        else: failed.append(biz_name)
    if sent>0: conn.execute("UPDATE users SET credits=credits-? WHERE id=%s",(sent,user["id"]))
    new_bal = conn.execute("SELECT credits FROM users WHERE id=%s",(user["id"],)).fetchone()["credits"]
    conn.commit(); conn.close()
    await manager.send(u["token"],{"type":"blast_complete","sent":sent,"failed":failed,
        "credits_remaining":new_bal,"conversation_ids":conv_ids})
    return {"sent":sent,"failed":len(failed),"credits_remaining":new_bal}

@app.get("/sms/inbox")
async def get_inbox(user=Depends(get_user)):
    conn = get_db()
    convs = conn.execute("SELECT * FROM conversations WHERE user_id=%s ORDER BY last_message_at DESC",(user["id"],)).fetchall()
    conn.close()
    return {"conversations":[dict(c) for c in convs]}

@app.get("/sms/thread/{conversation_id}")
async def get_thread(conversation_id: int, user=Depends(get_user)):
    conn = get_db()
    conv = conn.execute("SELECT * FROM conversations WHERE id=%s AND user_id=%s",(conversation_id,user["id"])).fetchone()
    if not conv: conn.close(); raise HTTPException(404,"Not found")
    msgs = conn.execute("SELECT * FROM messages WHERE conversation_id=%s ORDER BY sent_at ASC",(conversation_id,)).fetchall()
    conn.execute("UPDATE conversations SET unread_count=0 WHERE id=%s",(conversation_id,))
    conn.commit(); conn.close()
    return {"conversation":dict(conv),"messages":[dict(m) for m in msgs]}

@app.post("/sms/reply")
async def send_reply(req: ReplyRequest, user=Depends(get_user)):
    conn = get_db()
    conv = conn.execute("SELECT * FROM conversations WHERE id=%s AND user_id=%s",(req.conversation_id,user["id"])).fetchone()
    if not conv: conn.close(); raise HTTPException(404,"Not found")
    u = conn.execute("SELECT credits FROM users WHERE id=%s",(user["id"],)).fetchone()
    if u["credits"]<1: conn.close(); raise HTTPException(402,"No credits")
    sid = await send_sms(conv["contact_phone"],req.body)
    conn.execute("""INSERT INTO messages
        (conversation_id,user_id,direction,body,from_number,to_number,twilio_sid)
        VALUES (?,?,?,?,?,?,?)""",(req.conversation_id,user["id"],"outbound",req.body,TWILIO_FROM or "WorkBridge",conv["contact_phone"],sid or ""))
    conn.execute("UPDATE conversations SET last_message=%s,last_message_at=%s WHERE id=%s",
        (req.body,datetime.utcnow().isoformat(),req.conversation_id))
    conn.execute("UPDATE users SET credits=credits-1 WHERE id=%s",(user["id"],))
    new_bal = conn.execute("SELECT credits FROM users WHERE id=%s",(user["id"],)).fetchone()["credits"]
    conn.commit(); conn.close()
    return {"status":"sent","credits_remaining":new_bal}

@app.get("/sms/reply/webhook")
async def inbound_webhook_get():
    return PlainTextResponse('<?xml version="1.0" encoding="UTF-8"?><Response />', media_type="application/xml")

@app.post("/sms/reply/webhook")
async def inbound_webhook(request: Request):
    form = await request.form()
    from_number = form.get("From","")
    body = form.get("Body","").strip()
    body_upper = body.upper()
    conn = get_db()
    ph = "%s" if is_pg() else "?"

    # ── SMS-ONLY MODE ──────────────────────────────────────────────────────
    # Keywords that trigger Coach Ray via SMS (no app needed)
    SMS_TRIGGERS = ["JOIN","HOLA","START","TRABAJO","HELP","AYUDA","HELLO","HI","JOBS","YES"]
    STOP_WORDS = ["STOP","UNSUBSCRIBE","CANCEL","QUIT","END"]

    # Handle STOP
    if body_upper in STOP_WORDS:
        conn.close()
        resp = MessagingResponse()
        resp.message("You have been unsubscribed from WorkBridge. Reply JOIN to resubscribe.")
        return PlainTextResponse(str(resp), media_type="application/xml")

    # Check if this person is a registered user by phone number
    user_by_phone = conn.execute(
        f"SELECT * FROM users WHERE phone={ph} OR phone={ph}",
        (from_number, from_number.replace("+1",""))
    ).fetchone()

    # Check if this is a trigger keyword from unknown number
    is_trigger = body_upper in SMS_TRIGGERS or any(body_upper.startswith(t) for t in SMS_TRIGGERS)

    if is_trigger and not user_by_phone:
        # Auto-register new user for SMS-only mode
        import secrets
        auto_email = f"sms_{from_number.replace('+','')}@workbridge.sms"
        auto_pass = secrets.token_urlsafe(16)
        token = hashlib.sha256(f"{SECRET_KEY}{auto_email}{datetime.utcnow().isoformat()}".encode()).hexdigest()
        lang = "es" if any(w in body_upper for w in ["HOLA","TRABAJO","AYUDA"]) else "en"
        try:
            conn.execute(
                f"INSERT INTO users (first_name,last_name,email,password_hash,phone,language,credits,token) VALUES ({ph},{ph},{ph},{ph},{ph},{ph},{ph},{ph})",
                ("SMS","User",auto_email,hash_pw(auto_pass),from_number,lang,10,token)
            )
            conn.commit()
            user_by_phone = conn.execute(f"SELECT * FROM users WHERE phone={ph}",(from_number,)).fetchone()
        except:
            user_by_phone = conn.execute(f"SELECT * FROM users WHERE phone={ph}",(from_number,)).fetchone()

    if user_by_phone or (is_trigger and user_by_phone):
        u = dict(user_by_phone) if user_by_phone else None
        if u:
            lang = u.get("language","en")
            # Get or start SMS Coach Ray session
            sms_msg = body
            if is_trigger and body_upper in SMS_TRIGGERS:
                sms_msg = "find me a job" if lang == "en" else "buscarme un trabajo"

            # Call Coach Ray
            try:
                result = await call_coach_ray(u, sms_msg, "intake")
                reply_text = result.get("reply","")
                # Truncate for SMS (160 chars per segment, max 3 segments)
                if len(reply_text) > 480:
                    reply_text = reply_text[:477] + "..."
                # Add workbridgesms.com for web access
                if len(reply_text) < 140:
                    reply_text += "\n\nworkbridgesms.com"
            except Exception as e:
                if lang == "es":
                    reply_text = "Hola! Soy Coach Ray de WorkBridge. Te ayudo a encontrar trabajo. ¿Qué tipo de trabajo buscas? workbridgesms.com"
                else:
                    reply_text = "Hi! I'm Coach Ray from WorkBridge. I help you find work fast. What kind of job are you looking for? workbridgesms.com"

            conn.close()
            resp = MessagingResponse()
            resp.message(reply_text)
            return PlainTextResponse(str(resp), media_type="application/xml")

    # ── EXISTING CONVERSATION REPLY (business replying to job seeker) ──────
    conv = conn.execute(
        f"SELECT * FROM conversations WHERE contact_phone={ph} ORDER BY last_message_at DESC LIMIT 1",
        (from_number,)
    ).fetchone()

    if conv:
        conn.execute(
            f"""INSERT INTO messages (conversation_id,user_id,direction,body,from_number,to_number,status)
            VALUES ({ph},{ph},{ph},{ph},{ph},{ph},{ph})""",
            (conv["id"],conv["user_id"],"inbound",body,from_number,TWILIO_FROM or "WorkBridge","received")
        )
        conn.execute(
            f"""UPDATE conversations SET last_message={ph},last_message_at={ph},
            unread_count=unread_count+1,status='replied' WHERE id={ph}""",
            (body,datetime.utcnow().isoformat(),conv["id"])
        )
        conn.commit()
        u = conn.execute(f"SELECT * FROM users WHERE id={ph}",(conv["user_id"],)).fetchone()
        if u:
            tok = u["token"] if isinstance(u,dict) else u[10]
            uphone = u["phone"] if isinstance(u,dict) else u[5]
            await manager.send(tok,{"type":"new_message","conversation_id":conv["id"],
                "from":conv["contact_name"],"body":body,"alert":f"\U0001f389 {conv['contact_name']} replied!"})
            if uphone:
                await send_sms(uphone,f"WorkBridge: {conv['contact_name']} replied!\n\"{body[:80]}\"\nLog in: workbridgesms.com")

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
    s = conn.execute("SELECT * FROM coach_sessions WHERE user_id=%s",(user["id"],)).fetchone()
    conn.close()
    if not s: return {"history":[],"mission":"intake"}
    return {"history":json.loads(s["session_json"]),"mission":s["mission"]}

@app.post("/coach/reset")
async def reset_session(user=Depends(get_user)):
    conn = get_db()
    conn.execute("DELETE FROM coach_sessions WHERE user_id=%s",(user["id"],))
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
    docs = conn.execute("SELECT id,doc_type,title,created_at FROM generated_docs WHERE user_id=%s ORDER BY created_at DESC",(user["id"],)).fetchall()
    conn.close()
    return {"docs":[dict(d) for d in docs]}

@app.get("/coach/docs/{doc_id}")
async def get_doc(doc_id: int, user=Depends(get_user)):
    conn = get_db()
    doc = conn.execute("SELECT * FROM generated_docs WHERE id=%s AND user_id=%s",(doc_id,user["id"])).fetchone()
    conn.close()
    if not doc: raise HTTPException(404,"Not found")
    return dict(doc)

@app.post("/appointments/create")
async def create_appt(req: AppointmentRequest, background_tasks: BackgroundTasks, user=Depends(get_user)):
    conn = get_db()
    appt_dt = datetime.fromisoformat(req.appt_datetime)
    cur = conn.execute("INSERT INTO appointments (user_id,business_name,business_phone,appt_datetime,notes) VALUES (%s,%s,%s,%s,%s)",
        (user["id"],req.business_name,req.business_phone,req.appt_datetime,req.notes))
    appt_id = cur.lastrowid if not is_pg() else cur.fetchone()[0] if cur.rowcount > 0 else 0; conn.commit(); conn.close()
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
    appts = conn.execute("SELECT * FROM appointments WHERE user_id=%s ORDER BY appt_datetime DESC",(user["id"],)).fetchall()
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
            conn.execute("UPDATE users SET credits=credits+? WHERE id=%s",(cred,uid))
            conn.commit()
            u = conn.execute("SELECT token,phone FROM users WHERE id=%s",(uid,)).fetchone()
            conn.close()
            if u:
                await manager.send(u["token"],{"type":"credits_added","credits":cred})
                if u["phone"]: await send_sms(u["phone"],f"WorkBridge: {cred} credits added!")
    return {"status":"ok"}

@app.get("/credits/balance")
async def balance(user=Depends(get_user)):
    conn = get_db()
    u = conn.execute("SELECT credits FROM users WHERE id=%s",(user["id"],)).fetchone()
    conn.close()
    return {"credits":u["credits"] if u else 0,"packages":PACKAGES}

@app.websocket("/ws/{token}")
async def ws_endpoint(websocket: WebSocket, token: str):
    conn = get_db()
    u = conn.execute("SELECT id FROM users WHERE token=%s",(token,)).fetchone()
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
        "stripe":bool(STRIPE_SECRET),"google":bool(GOOGLE_KEY),"resend":bool(RESEND_API_KEY)}}

@app.get("/")
async def root():
    return {"message":"WorkBridge API v3.0 — Coach Ray + Live Search + Two-Way SMS"}

# ── MISSING ENDPOINTS — Dashboard Compatibility ────────────────────────────────

@app.get("/user/missions")
async def get_user_missions(user=Depends(get_user)):
    conn = get_db()
    u = conn.execute("SELECT profile_json FROM users WHERE id=%s", (user["id"],)).fetchone()
    conn.close()
    profile = json.loads(u["profile_json"]) if u and u["profile_json"] else {}
    return {"missions": profile.get("missions", [])}

@app.post("/user/missions")
async def save_user_missions(request: Request, user=Depends(get_user)):
    body = await request.json()
    conn = get_db()
    u = conn.execute("SELECT profile_json FROM users WHERE id=%s", (user["id"],)).fetchone()
    profile = json.loads(u["profile_json"]) if u and u["profile_json"] else {}
    profile["missions"] = body.get("missions", [])
    conn.execute("UPDATE users SET profile_json=%s WHERE id=%s", (json.dumps(profile), user["id"]))
    conn.commit(); conn.close()
    return {"status": "saved"}

@app.post("/coach/save-profile")
async def save_profile(request: Request, user=Depends(get_user)):
    body = await request.json()
    mission = body.get("mission", "")
    answers = body.get("answers", {})
    conn = get_db()
    u = conn.execute("SELECT profile_json FROM users WHERE id=%s", (user["id"],)).fetchone()
    profile = json.loads(u["profile_json"]) if u and u["profile_json"] else {}
    profile[f"mission_{mission}"] = answers
    profile["last_mission"] = mission
    if answers.get("phone"):
        conn.execute("UPDATE users SET phone=%s WHERE id=%s", (answers["phone"], user["id"]))
    if answers.get("zip"):
        conn.execute("UPDATE users SET zip_code=%s WHERE id=%s", (answers["zip"], user["id"]))
    conn.execute("UPDATE users SET profile_json=%s WHERE id=%s", (json.dumps(profile), user["id"]))
    conn.commit(); conn.close()
    return {"status": "saved"}

@app.post("/coach/generate-message")
async def generate_message(request: Request, user=Depends(get_user)):
    body = await request.json()
    mission = body.get("mission", "job")
    answers = body.get("answers", {})
    name = body.get("name", user.get("first_name", ""))
    language = body.get("language", user.get("language", "en"))
    job_type = answers.get("job_type", answers.get("goal", answers.get("service_type", "work")))
    zip_code = answers.get("zip", answers.get("zip_code", user.get("zip_code", "")))
    narrative = answers.get("narrative", "")
    lang_note = "English — for US businesses." if language == "en" else f"{language}"
    prompt = f"Write a 160-char SMS for {name} seeking {job_type} work near {zip_code}. {lang_note} Context: {narrative[:100]}. Include name, skill, ask if hiring, end WorkBridge. Return ONLY message text."
    if not ANTHROPIC_KEY:
        return {"message": f"Hi, I'm {name}. I have experience in {job_type} and am seeking work near {zip_code}. Are you hiring? — WorkBridge"}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.post("https://api.anthropic.com/v1/messages",
                headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                json={"model": "claude-sonnet-4-20250514", "max_tokens": 200, "messages": [{"role": "user", "content": prompt}]})
            return {"message": res.json()["content"][0]["text"].strip().strip('"')}
    except:
        return {"message": f"Hi, I'm {name} seeking {job_type} work near {zip_code}. Are you hiring? — WorkBridge"}

@app.post("/coach/agent-search")
async def agent_search(request: Request, user=Depends(get_user)):
    body = await request.json()
    zip_code = body.get("zip_code", user.get("zip_code", "90001"))
    category = body.get("category", "home health")
    language = body.get("language", "en")
    answers = body.get("answers", {})
    conn = get_db()
    u = conn.execute("SELECT * FROM users WHERE id=%s", (user["id"],)).fetchone()
    if u["credits"] < 1:
        conn.close(); raise HTTPException(402, "No credits remaining")
    name = u["first_name"] or ""
    narrative = answers.get("narrative", "")
    if ANTHROPIC_KEY:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                prompt = f"Write a 160-char SMS for {name} seeking {category} work near {zip_code}. English for US businesses. Include name, skill, ask if hiring, end WorkBridge."
                res = await client.post("https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                    json={"model": "claude-sonnet-4-20250514", "max_tokens": 200, "messages": [{"role": "user", "content": prompt}]})
                outreach_msg = res.json()["content"][0]["text"].strip().strip('"')
        except:
            outreach_msg = f"Hi, I'm {name}. I have experience in {category} and am seeking work near {zip_code}. Are you hiring? — WorkBridge"
    else:
        outreach_msg = f"Hi, I'm {name}. I have experience in {category} and am seeking work near {zip_code}. Are you hiring? — WorkBridge"
    businesses = []
    if GOOGLE_KEY:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                geo = await client.get("https://maps.googleapis.com/maps/api/geocode/json", params={"address": zip_code, "key": GOOGLE_KEY})
                geo_data = geo.json()
                if geo_data.get("results"):
                    loc = geo_data["results"][0]["geometry"]["location"]
                    places = await client.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                        params={"location": f"{loc['lat']},{loc['lng']}", "radius": 5000, "keyword": category, "type": "establishment", "key": GOOGLE_KEY})
                    for r in places.json().get("results", [])[:10]:
                        if r.get("place_id"):
                            detail = await client.get("https://maps.googleapis.com/maps/api/place/details/json",
                                params={"place_id": r["place_id"], "fields": "formatted_phone_number,name", "key": GOOGLE_KEY})
                            phone = detail.json().get("result", {}).get("formatted_phone_number", "")
                            if phone:
                                businesses.append({"name": r.get("name", ""), "phone": phone})
        except: pass
    if not businesses:
        businesses = [{"name": f"Local {category.title()} Business {i}", "phone": f"+1949555{1000+i}"} for i in range(1, 4)]
    sent = 0
    for biz in businesses:
        phone_raw = biz.get("phone", "")
        if not phone_raw: continue
        phone = normalize_phone(phone_raw)
        biz_name = biz.get("name", "Business")
        existing = conn.execute("SELECT id FROM conversations WHERE user_id=%s AND contact_phone=%s", (user["id"], phone)).fetchone()
        if existing:
            conv_id = existing["id"]
            conn.execute("UPDATE conversations SET status='active', last_message=%s, last_message_at=%s WHERE id=%s", (outreach_msg, datetime.utcnow().isoformat(), conv_id))
        else:
            cur = conn.execute("INSERT INTO conversations (user_id, contact_phone, contact_name, contact_company, last_message, last_message_at) VALUES (%s,%s,%s,%s,%s,%s)",
                (user["id"], phone, biz_name, biz_name, outreach_msg, datetime.utcnow().isoformat()))
            conv_id = cur.lastrowid if not is_pg() else cur.fetchone()[0] if cur.rowcount > 0 else 0
        sid = await send_sms(phone, outreach_msg)
        conn.execute("INSERT INTO messages (conversation_id, user_id, direction, body, from_number, to_number, twilio_sid) VALUES (%s,%s,%s,%s,%s,%s,%s)",
            (conv_id, user["id"], "outbound", outreach_msg, TWILIO_FROM or "WorkBridge", phone, sid or ""))
        if sid: sent += 1
    if sent > 0:
        conn.execute("UPDATE users SET credits=credits-? WHERE id=%s", (sent, user["id"]))
    new_bal = conn.execute("SELECT credits FROM users WHERE id=%s", (user["id"],)).fetchone()["credits"]
    conn.commit(); conn.close()
    confirm = f"Sent to {sent} of {len(businesses)} businesses near {zip_code}!" if language == "en" else f"¡Mensajes enviados a {sent} de {len(businesses)} empresas cerca de {zip_code}!"
    return {"messages_sent": sent, "businesses_found": len(businesses), "credits_remaining": new_bal, "outreach_message": outreach_msg, "user_confirmation": confirm}

@app.post("/coach/suggest-reply")
async def suggest_reply(request: Request, user=Depends(get_user)):
    body = await request.json()
    business_name = body.get("business_name", "the business")
    last_message = body.get("last_message", "")
    user_name = body.get("user_name", user.get("first_name", ""))
    if not ANTHROPIC_KEY:
        return {"suggestion": "Thank you for getting back to me! I'm very interested. When would be a good time to connect?"}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            prompt = f"Write a short professional SMS reply (under 160 chars) from {user_name} to {business_name} who said: '{last_message}'. Warm, express interest, suggest next step. Return ONLY reply text."
            res = await client.post("https://api.anthropic.com/v1/messages",
                headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                json={"model": "claude-sonnet-4-20250514", "max_tokens": 200, "messages": [{"role": "user", "content": prompt}]})
            return {"suggestion": res.json()["content"][0]["text"].strip().strip('"')}
    except:
        return {"suggestion": "Thank you! I'm very interested. When would be a good time to connect?"}

@app.post("/messages/reply")
async def messages_reply_compat(request: Request, user=Depends(get_user)):
    body = await request.json()
    to = body.get("to", ""); message = body.get("message", ""); business_name = body.get("business_name", "Business")
    if not to or not message: raise HTTPException(400, "Missing to or message")
    phone = normalize_phone(to)
    conn = get_db()
    u = conn.execute("SELECT credits FROM users WHERE id=%s", (user["id"],)).fetchone()
    if u["credits"] < 1: conn.close(); raise HTTPException(402, "No credits remaining")
    conv = conn.execute("SELECT id FROM conversations WHERE user_id=%s AND contact_phone=%s", (user["id"], phone)).fetchone()
    if conv:
        conv_id = conv["id"]
    else:
        cur = conn.execute("INSERT INTO conversations (user_id, contact_phone, contact_name, contact_company, last_message, last_message_at) VALUES (%s,%s,%s,%s,%s,%s)",
            (user["id"], phone, business_name, business_name, message, datetime.utcnow().isoformat()))
        conv_id = cur.lastrowid if not is_pg() else cur.fetchone()[0] if cur.rowcount > 0 else 0
    sid = await send_sms(phone, message)
    conn.execute("INSERT INTO messages (conversation_id, user_id, direction, body, from_number, to_number, twilio_sid) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (conv_id, user["id"], "outbound", message, TWILIO_FROM or "WorkBridge", phone, sid or ""))
    conn.execute("UPDATE conversations SET last_message=%s, last_message_at=%s WHERE id=%s", (message, datetime.utcnow().isoformat(), conv_id))
    conn.execute("UPDATE users SET credits=credits-1 WHERE id=%s", (user["id"],))
    conn.commit(); conn.close()
    return {"status": "sent", "sid": sid}

@app.get("/sms/history")
async def sms_history_compat(limit: int = 50, user=Depends(get_user)):
    conn = get_db()
    msgs = conn.execute(
        """SELECT m.*, c.contact_name as recipient_name, c.contact_phone as recipient_phone,
           c.status as conv_status, m.conversation_id
           FROM messages m JOIN conversations c ON m.conversation_id=c.id
           WHERE m.user_id=? AND m.direction='outbound' ORDER BY m.sent_at DESC LIMIT ?""",
        (user["id"], limit)).fetchall()
    history = []
    seen = {}
    for m in msgs:
        d = dict(m)
        cid = d["conversation_id"]
        if cid not in seen:
            seen[cid] = True
            inbound = conn.execute(
                "SELECT body, sent_at FROM messages WHERE conversation_id=? AND direction='inbound' ORDER BY sent_at DESC LIMIT 1",
                (cid,)).fetchone()
            history.append({"id": d["id"], "recipient_name": d["recipient_name"],
                "recipient_phone": d["recipient_phone"], "message_text": d["body"],
                "status": d["status"], "sent_at": d["sent_at"],
                "reply_text": inbound["body"] if inbound else None,
                "replied_at": inbound["sent_at"] if inbound else None,
                "conversation_id": cid})
    conn.close()
    return {"history": history}

# ── MISSING ENDPOINTS — Dashboard Compatibility ────────────────────────────────

@app.get("/user/missions")
async def get_user_missions(user=Depends(get_user)):
    conn = get_db()
    u = conn.execute("SELECT profile_json FROM users WHERE id=%s", (user["id"],)).fetchone()
    conn.close()
    profile = json.loads(u["profile_json"]) if u and u["profile_json"] else {}
    return {"missions": profile.get("missions", [])}

@app.post("/user/missions")
async def save_user_missions(request: Request, user=Depends(get_user)):
    body = await request.json()
    conn = get_db()
    u = conn.execute("SELECT profile_json FROM users WHERE id=%s", (user["id"],)).fetchone()
    profile = json.loads(u["profile_json"]) if u and u["profile_json"] else {}
    profile["missions"] = body.get("missions", [])
    conn.execute("UPDATE users SET profile_json=%s WHERE id=%s", (json.dumps(profile), user["id"]))
    conn.commit(); conn.close()
    return {"status": "saved"}

@app.post("/coach/save-profile")
async def save_profile(request: Request, user=Depends(get_user)):
    body = await request.json()
    mission = body.get("mission", "")
    answers = body.get("answers", {})
    conn = get_db()
    u = conn.execute("SELECT profile_json FROM users WHERE id=%s", (user["id"],)).fetchone()
    profile = json.loads(u["profile_json"]) if u and u["profile_json"] else {}
    profile[f"mission_{mission}"] = answers
    profile["last_mission"] = mission
    if answers.get("phone"):
        conn.execute("UPDATE users SET phone=%s WHERE id=%s", (answers["phone"], user["id"]))
    if answers.get("zip"):
        conn.execute("UPDATE users SET zip_code=%s WHERE id=%s", (answers["zip"], user["id"]))
    conn.execute("UPDATE users SET profile_json=%s WHERE id=%s", (json.dumps(profile), user["id"]))
    conn.commit(); conn.close()
    return {"status": "saved"}

@app.post("/coach/generate-message")
async def generate_message(request: Request, user=Depends(get_user)):
    body = await request.json()
    mission = body.get("mission", "job")
    answers = body.get("answers", {})
    name = body.get("name", user.get("first_name", ""))
    language = body.get("language", user.get("language", "en"))
    job_type = answers.get("job_type", answers.get("goal", answers.get("service_type", "work")))
    zip_code = answers.get("zip", answers.get("zip_code", user.get("zip_code", "")))
    narrative = answers.get("narrative", "")
    lang_note = "English — for US businesses." if language == "en" else f"{language}"
    prompt = f"Write a 160-char SMS for {name} seeking {job_type} work near {zip_code}. {lang_note} Context: {narrative[:100]}. Include name, skill, ask if hiring, end WorkBridge. Return ONLY message text."
    if not ANTHROPIC_KEY:
        return {"message": f"Hi, I'm {name}. I have experience in {job_type} and am seeking work near {zip_code}. Are you hiring? — WorkBridge"}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.post("https://api.anthropic.com/v1/messages",
                headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                json={"model": "claude-sonnet-4-20250514", "max_tokens": 200, "messages": [{"role": "user", "content": prompt}]})
            return {"message": res.json()["content"][0]["text"].strip().strip('"')}
    except:
        return {"message": f"Hi, I'm {name} seeking {job_type} work near {zip_code}. Are you hiring? — WorkBridge"}

@app.post("/coach/agent-search")
async def agent_search(request: Request, user=Depends(get_user)):
    body = await request.json()
    zip_code = body.get("zip_code", user.get("zip_code", "90001"))
    category = body.get("category", "home health")
    language = body.get("language", "en")
    answers = body.get("answers", {})
    conn = get_db()
    u = conn.execute("SELECT * FROM users WHERE id=%s", (user["id"],)).fetchone()
    if u["credits"] < 1:
        conn.close(); raise HTTPException(402, "No credits remaining")
    name = u["first_name"] or ""
    narrative = answers.get("narrative", "")
    if ANTHROPIC_KEY:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                prompt = f"Write a 160-char SMS for {name} seeking {category} work near {zip_code}. English for US businesses. Include name, skill, ask if hiring, end WorkBridge."
                res = await client.post("https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                    json={"model": "claude-sonnet-4-20250514", "max_tokens": 200, "messages": [{"role": "user", "content": prompt}]})
                outreach_msg = res.json()["content"][0]["text"].strip().strip('"')
        except:
            outreach_msg = f"Hi, I'm {name}. I have experience in {category} and am seeking work near {zip_code}. Are you hiring? — WorkBridge"
    else:
        outreach_msg = f"Hi, I'm {name}. I have experience in {category} and am seeking work near {zip_code}. Are you hiring? — WorkBridge"
    businesses = []
    if GOOGLE_KEY:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                geo = await client.get("https://maps.googleapis.com/maps/api/geocode/json", params={"address": zip_code, "key": GOOGLE_KEY})
                geo_data = geo.json()
                if geo_data.get("results"):
                    loc = geo_data["results"][0]["geometry"]["location"]
                    places = await client.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                        params={"location": f"{loc['lat']},{loc['lng']}", "radius": 5000, "keyword": category, "type": "establishment", "key": GOOGLE_KEY})
                    for r in places.json().get("results", [])[:10]:
                        if r.get("place_id"):
                            detail = await client.get("https://maps.googleapis.com/maps/api/place/details/json",
                                params={"place_id": r["place_id"], "fields": "formatted_phone_number,name", "key": GOOGLE_KEY})
                            phone = detail.json().get("result", {}).get("formatted_phone_number", "")
                            if phone:
                                businesses.append({"name": r.get("name", ""), "phone": phone})
        except: pass
    if not businesses:
        businesses = [{"name": f"Local {category.title()} Business {i}", "phone": f"+1949555{1000+i}"} for i in range(1, 4)]
    sent = 0
    for biz in businesses:
        phone_raw = biz.get("phone", "")
        if not phone_raw: continue
        phone = normalize_phone(phone_raw)
        biz_name = biz.get("name", "Business")
        existing = conn.execute("SELECT id FROM conversations WHERE user_id=%s AND contact_phone=%s", (user["id"], phone)).fetchone()
        if existing:
            conv_id = existing["id"]
            conn.execute("UPDATE conversations SET status='active', last_message=%s, last_message_at=%s WHERE id=%s", (outreach_msg, datetime.utcnow().isoformat(), conv_id))
        else:
            cur = conn.execute("INSERT INTO conversations (user_id, contact_phone, contact_name, contact_company, last_message, last_message_at) VALUES (%s,%s,%s,%s,%s,%s)",
                (user["id"], phone, biz_name, biz_name, outreach_msg, datetime.utcnow().isoformat()))
            conv_id = cur.lastrowid if not is_pg() else cur.fetchone()[0] if cur.rowcount > 0 else 0
        sid = await send_sms(phone, outreach_msg)
        conn.execute("INSERT INTO messages (conversation_id, user_id, direction, body, from_number, to_number, twilio_sid) VALUES (%s,%s,%s,%s,%s,%s,%s)",
            (conv_id, user["id"], "outbound", outreach_msg, TWILIO_FROM or "WorkBridge", phone, sid or ""))
        if sid: sent += 1
    if sent > 0:
        conn.execute("UPDATE users SET credits=credits-? WHERE id=%s", (sent, user["id"]))
    new_bal = conn.execute("SELECT credits FROM users WHERE id=%s", (user["id"],)).fetchone()["credits"]
    conn.commit(); conn.close()
    confirm = f"Sent to {sent} of {len(businesses)} businesses near {zip_code}!" if language == "en" else f"¡Mensajes enviados a {sent} de {len(businesses)} empresas cerca de {zip_code}!"
    return {"messages_sent": sent, "businesses_found": len(businesses), "credits_remaining": new_bal, "outreach_message": outreach_msg, "user_confirmation": confirm}

@app.post("/coach/suggest-reply")
async def suggest_reply(request: Request, user=Depends(get_user)):
    body = await request.json()
    business_name = body.get("business_name", "the business")
    last_message = body.get("last_message", "")
    user_name = body.get("user_name", user.get("first_name", ""))
    if not ANTHROPIC_KEY:
        return {"suggestion": "Thank you for getting back to me! I'm very interested. When would be a good time to connect?"}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            prompt = f"Write a short professional SMS reply (under 160 chars) from {user_name} to {business_name} who said: '{last_message}'. Warm, express interest, suggest next step. Return ONLY reply text."
            res = await client.post("https://api.anthropic.com/v1/messages",
                headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                json={"model": "claude-sonnet-4-20250514", "max_tokens": 200, "messages": [{"role": "user", "content": prompt}]})
            return {"suggestion": res.json()["content"][0]["text"].strip().strip('"')}
    except:
        return {"suggestion": "Thank you! I'm very interested. When would be a good time to connect?"}

@app.post("/messages/reply")
async def messages_reply_compat(request: Request, user=Depends(get_user)):
    body = await request.json()
    to = body.get("to", ""); message = body.get("message", ""); business_name = body.get("business_name", "Business")
    if not to or not message: raise HTTPException(400, "Missing to or message")
    phone = normalize_phone(to)
    conn = get_db()
    u = conn.execute("SELECT credits FROM users WHERE id=%s", (user["id"],)).fetchone()
    if u["credits"] < 1: conn.close(); raise HTTPException(402, "No credits remaining")
    conv = conn.execute("SELECT id FROM conversations WHERE user_id=%s AND contact_phone=%s", (user["id"], phone)).fetchone()
    if conv:
        conv_id = conv["id"]
    else:
        cur = conn.execute("INSERT INTO conversations (user_id, contact_phone, contact_name, contact_company, last_message, last_message_at) VALUES (%s,%s,%s,%s,%s,%s)",
            (user["id"], phone, business_name, business_name, message, datetime.utcnow().isoformat()))
        conv_id = cur.lastrowid if not is_pg() else cur.fetchone()[0] if cur.rowcount > 0 else 0
    sid = await send_sms(phone, message)
    conn.execute("INSERT INTO messages (conversation_id, user_id, direction, body, from_number, to_number, twilio_sid) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (conv_id, user["id"], "outbound", message, TWILIO_FROM or "WorkBridge", phone, sid or ""))
    conn.execute("UPDATE conversations SET last_message=%s, last_message_at=%s WHERE id=%s", (message, datetime.utcnow().isoformat(), conv_id))
    conn.execute("UPDATE users SET credits=credits-1 WHERE id=%s", (user["id"],))
    conn.commit(); conn.close()
    return {"status": "sent", "sid": sid}

@app.get("/sms/history")
async def sms_history_compat(limit: int = 50, user=Depends(get_user)):
    conn = get_db()
    msgs = conn.execute(
        """SELECT m.*, c.contact_name as recipient_name, c.contact_phone as recipient_phone,
           c.status as conv_status, m.conversation_id
           FROM messages m JOIN conversations c ON m.conversation_id=c.id
           WHERE m.user_id=? AND m.direction='outbound' ORDER BY m.sent_at DESC LIMIT ?""",
        (user["id"], limit)).fetchall()
    history = []
    seen = {}
    for m in msgs:
        d = dict(m)
        cid = d["conversation_id"]
        if cid not in seen:
            seen[cid] = True
            inbound = conn.execute(
                "SELECT body, sent_at FROM messages WHERE conversation_id=? AND direction='inbound' ORDER BY sent_at DESC LIMIT 1",
                (cid,)).fetchone()
            history.append({"id": d["id"], "recipient_name": d["recipient_name"],
                "recipient_phone": d["recipient_phone"], "message_text": d["body"],
                "status": d["status"], "sent_at": d["sent_at"],
                "reply_text": inbound["body"] if inbound else None,
                "replied_at": inbound["sent_at"] if inbound else None,
                "conversation_id": cid})
    conn.close()
    return {"history": history}

@app.post("/dev/add-credits")
async def dev_add_credits(request: Request, user=Depends(get_user)):
    """Dev only — add test credits"""
    body = await request.json()
    amount = min(int(body.get("amount", 50)), 200)  # cap at 200
    conn = get_db()
    conn.execute("UPDATE users SET credits=credits+? WHERE id=%s", (amount, user["id"]))
    new_bal = conn.execute("SELECT credits FROM users WHERE id=%s", (user["id"],)).fetchone()["credits"]
    conn.commit(); conn.close()
    return {"credits": new_bal, "added": amount}

# ── FORGOT PASSWORD ────────────────────────────────────────────────────────────
import secrets

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM    = os.getenv("RESEND_FROM", "WorkBridge <onboarding@resend.dev>")

@app.post("/auth/forgot-password")
async def forgot_password(request: Request):
    body  = await request.json()
    email = body.get("email", "").strip().lower()
    if not email:
        raise HTTPException(400, "Email required")

    conn = get_db()

    # Always respond success to prevent email enumeration
    user = conn.execute("SELECT * FROM users WHERE email=%s", (email,)).fetchone()
    if not user:
        conn.close()
        return {"status": "ok", "message": "If that email exists you will receive a reset link"}

    # Generate secure token
    reset_token = secrets.token_urlsafe(32)
    expires_at  = (datetime.utcnow() + timedelta(hours=1)).isoformat()

    # Store token in profile_json
    profile = json.loads(user["profile_json"]) if user["profile_json"] else {}
    profile["reset_token"]   = reset_token
    profile["reset_expires"] = expires_at
    conn.execute("UPDATE users SET profile_json=%s WHERE id=%s", (json.dumps(profile), user["id"]))
    conn.commit()
    conn.close()

    # Send email via Resend
    reset_url = f"https://workbridgesms.com/reset-password?token={reset_token}"
    first_name = user["first_name"] or "there"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1421; color: #E2E8F0; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #00C6A2; font-size: 28px; margin: 0;">🌉 WorkBridge</h1>
        <p style="color: #64748B; margin-top: 8px;">AI-Powered Job Placement</p>
      </div>
      <h2 style="color: #FFFFFF; font-size: 22px;">Reset Your Password</h2>
      <p style="color: #B0C4D8; line-height: 1.6;">Hi {first_name},</p>
      <p style="color: #B0C4D8; line-height: 1.6;">We received a request to reset your WorkBridge password. Click the button below to create a new password. This link expires in 1 hour.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{reset_url}" style="background: #00C6A2; color: #0A0F1A; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
          Reset My Password →
        </a>
      </div>
      <p style="color: #64748B; font-size: 13px; line-height: 1.6;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      <p style="color: #64748B; font-size: 12px; margin-top: 32px; border-top: 1px solid #1E3A5F; padding-top: 16px;">
        WorkBridge — workbridgesms.com<br/>
        Laguna Woods, California
      </p>
    </div>
    """

    if RESEND_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "from": RESEND_FROM,
                        "to": [email],
                        "subject": "Reset your WorkBridge password",
                        "html": html_body
                    }
                )
        except Exception as e:
            print(f"Resend error: {e}")

    return {"status": "ok", "message": "If that email exists you will receive a reset link"}


@app.post("/auth/reset-password")
async def reset_password(request: Request):
    body      = await request.json()
    token     = body.get("token", "")
    password  = body.get("password", "")

    if not token or not password:
        raise HTTPException(400, "Token and password required")
    if len(password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    conn = get_db()
    users = conn.execute("SELECT * FROM users").fetchall()

    target_user = None
    for u in users:
        profile = json.loads(u["profile_json"]) if u["profile_json"] else {}
        if profile.get("reset_token") == token:
            expires = profile.get("reset_expires", "")
            if expires and datetime.fromisoformat(expires) > datetime.utcnow():
                target_user = u
                break

    if not target_user:
        conn.close()
        raise HTTPException(400, "Invalid or expired reset link")

    # Update password and clear token
    profile = json.loads(target_user["profile_json"]) if target_user["profile_json"] else {}
    profile.pop("reset_token", None)
    profile.pop("reset_expires", None)

    conn.execute(
        "UPDATE users SET password_hash=?, profile_json=? WHERE id=?",
        (hash_pw(password), json.dumps(profile), target_user["id"])
    )
    conn.commit()
    conn.close()

    return {"status": "ok", "message": "Password updated successfully"}

# ── VETBRIDGE — MOS TRANSLATION ────────────────────────────────────────────────

MOS_MAP = {
    "11b":"Infantry — Security, Law Enforcement, Border Patrol, Corrections",
    "11c":"Indirect Fire — Artillery Tech, Logistics, Operations",
    "12b":"Combat Engineer — Construction, Project Management, Heavy Equipment",
    "12k":"Plumber — Plumbing, HVAC, Facilities Management",
    "13f":"Fire Support — Logistics Coordinator, Operations Analyst",
    "15w":"UAV Operator — Drone Pilot, GIS Analyst, Aviation Tech",
    "18x":"Special Forces — Security Consultant, Federal Agent, Defense Contractor",
    "25b":"IT Specialist — Network Admin, Cybersecurity, Help Desk",
    "25u":"Signal Support — Telecom Tech, Network Engineer, IT Support",
    "35l":"Counterintelligence — Federal Agent, Investigator, Security Analyst",
    "42a":"HR Specialist — Human Resources, Payroll, Recruiting",
    "56m":"Chaplain Assistant — Counselor, Social Work, Nonprofit",
    "68w":"Combat Medic — EMT, Paramedic, Nursing, Healthcare",
    "88m":"Motor Transport — CDL Driver, Logistics, Fleet Manager",
    "91b":"Wheeled Vehicle Mechanic — Auto Mechanic, Fleet Maintenance",
    "92a":"Automated Logistical — Supply Chain, Warehouse, Inventory",
    "it": "Navy IT — Network Admin, Cybersecurity, Systems Admin",
    "ht": "Navy Hospital Corpsman — EMT, Nursing, Medical Assistant",
    "0311":"Marine Infantry — Security, Law Enforcement, Federal Agent",
    "0621":"Marine Signal — Telecom, Network Tech, IT Support",
    "3p0x1":"AF Security Forces — Law Enforcement, Security, Federal Agent",
    "4n0x1":"AF Medical — Nursing, Healthcare, EMT",
    "6c0x1":"AF Contracting — Procurement, Contract Management, Government",
}

@app.post("/coach/veteran-translate")
async def veteran_translate(request: Request, user=Depends(get_user)):
    body = await request.json()
    mos = body.get("mos_code", "").lower().strip().replace(" ", "")
    branch = body.get("branch", "")
    narrative = body.get("narrative", "")

    # Check local map first
    civilian_translation = MOS_MAP.get(mos, "")

    if not civilian_translation and ANTHROPIC_KEY:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                prompt = f"""Translate this military experience to civilian job opportunities.

MOS/Rate/AFSC: {mos}
Branch: {branch}
Additional context: {narrative[:200]}

Provide:
1. Top 3 civilian job titles that match this military experience
2. Industries that actively hire veterans with this background
3. Any certifications from military service that transfer directly
4. Average civilian salary range for these roles

Keep it practical and actionable. Under 200 words."""
                res = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                    json={"model": "claude-sonnet-4-20250514", "max_tokens": 400,
                          "messages": [{"role": "user", "content": prompt}]}
                )
                civilian_translation = res.json()["content"][0]["text"]
        except:
            civilian_translation = f"Your {mos} experience translates to roles in security, operations, and technical fields. Search 'veteran jobs {mos}' on USAJOBS.gov for federal positions."

    elif not civilian_translation:
        civilian_translation = f"Your {mos} military experience is valuable. Visit USAJOBS.gov for veteran-preference federal jobs, or O*NET OnLine (onetonline.org) to search your MOS code for civilian equivalents."

    return {
        "mos": mos.upper(),
        "branch": branch,
        "civilian_translation": civilian_translation,
        "resources": [
            {"name": "USAJOBS.gov", "url": "https://usajobs.gov", "desc": "Federal jobs with veteran preference"},
            {"name": "O*NET Military Crosswalk", "url": "https://onetonline.org/crosswalk/MOC", "desc": "Translate your MOS to civilian jobs"},
            {"name": "VA Voc Rehab (Ch. 31)", "url": "https://va.gov/careers-employment/vocational-rehabilitation", "desc": "Up to $2,800/mo while job searching"},
            {"name": "Hire Heroes USA", "url": "https://hireheroesusa.org", "desc": "Free veteran job placement"},
            {"name": "American Corporate Partners", "url": "https://acp-usa.org", "desc": "Free mentoring from executives"},
        ]
    }

# ── MISSION-AWARE SEARCH ENGINE ───────────────────────────────────────────────

MISSION_SEARCH_CONFIG = {
    "job": {
        "category": "staffing agency employment",
        "outreach": "job seeker looking for work",
        "doc": "We connect pre-screened candidates via SMS. Are you hiring?"
    },
    "home": {
        "category": "home repair contractor licensed",
        "outreach": "homeowner needing home services",
        "doc": "I need a licensed contractor for home repair near {zip}. Available immediately."
    },
    "senior": {
        "category": "assisted living senior care facility",
        "outreach": "family seeking senior care placement",
        "doc": "We are looking for senior care options near {zip}. Can you help?"
    },
    "education": {
        "category": "GED adult education trade school",
        "outreach": "adult learner seeking education programs",
        "doc": "I am looking for GED or trade certification programs near {zip}."
    },
    "housing": {
        "category": "affordable housing social services nonprofit",
        "outreach": "person seeking housing assistance",
        "doc": "I need housing assistance resources near {zip}. Can you help?"
    },
    "business": {
        "category": "job seekers employment candidates staffing",
        "outreach": "business owner hiring workers",
        "doc": "We have pre-screened candidates available in {zip}. Are you hiring?"
    },
    "vehicle": {
        "category": "car dealership auto sales USAA military",
        "outreach": "buyer seeking vehicle purchase",
        "doc": "I am looking to purchase a vehicle near {zip}. Do you have inventory available?"
    },
    "debt": {
        "category": "credit counseling debt relief financial advisor nonprofit",
        "outreach": "person seeking debt and financial relief",
        "doc": "I need financial counseling services near {zip}. Do you offer free consultations?"
    },
    "chores": {
        "category": "house cleaning lawn care home services",
        "outreach": "homeowner needing household help",
        "doc": "I need regular household services near {zip}. Do you have availability?"
    },
    "veteran": {
        "category": "veteran services VA benefits employment",
        "outreach": "veteran seeking employment and benefits",
        "doc": "I am a veteran seeking employment and benefits assistance near {zip}."
    },
}

# 14 Staffing Agencies from OC Workforce Solutions
OC_STAFFING_AGENCIES = [
    {"name": "Robert Half Management Resources", "url": "roberthalf.com", "phone": "9492510440"},
    {"name": "Ultimate Staffing Services", "url": "ultimatestaffing.com", "phone": ""},
    {"name": "East Ridge Workforce Solutions", "url": "eastridge.com", "phone": ""},
    {"name": "Express Employment Professionals", "url": "expresspros.com", "phone": ""},
    {"name": "Action Resource Management Inc", "url": "actionresourcemgmt.com", "phone": ""},
    {"name": "West Coast Staffing", "url": "wcstaffing.net", "phone": ""},
    {"name": "Vault Workforce Solutions", "url": "jobs.vault.com", "phone": ""},
    {"name": "Staff Seekers Inc", "url": "staffseekers.com", "phone": ""},
    {"name": "Kimco Staffing Services", "url": "kimco.com", "phone": ""},
    {"name": "Tony Beare Inc", "url": "tonybeare.com", "phone": ""},
    {"name": "Pirate Staffing", "url": "poweredstaffing.com", "phone": ""},
    {"name": "Staffing Solutions", "url": "staffingsolutions.us", "phone": ""},
    {"name": "PeopleReady", "url": "peopleready.com", "phone": ""},
    {"name": "AMP Staffing Agency", "url": "callamp.com", "phone": ""},
]

@app.get("/coach/staffing-agencies")
async def get_staffing_agencies(user=Depends(get_user)):
    """Return OC staffing agencies list for employer outreach"""
    return {"agencies": OC_STAFFING_AGENCIES, "total": len(OC_STAFFING_AGENCIES)}

@app.post("/coach/mission-search")
async def mission_search(request: Request, user=Depends(get_user)):
    """Dynamic search engine for all 10 missions"""
    body     = await request.json()
    mission  = body.get("mission", "job")
    answers  = body.get("answers", {})
    language = body.get("language", user.get("language", "en"))

    zip_code = answers.get("zip") or answers.get("zip_code") or user.get("zip_code", "90001")
    state    = user.get("state", "CA")
    name     = user.get("first_name", "")

    config = MISSION_SEARCH_CONFIG.get(mission, MISSION_SEARCH_CONFIG["job"])
    category = answers.get("job_type") or answers.get("service_type") or answers.get("care_type") or config["category"]

    # Build personalized outreach message
    outreach_template = config["doc"].replace("{zip}", zip_code)

    if ANTHROPIC_KEY:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                lang_note = "English — for US businesses." if language == "en" else f"{language}"
                prompt = f"""Write a professional SMS (under 160 chars) from {name} who is a {config['outreach']} near {zip_code}.
Context: {str(answers)[:200]}
{lang_note}
Include their name, specific need, ZIP area. End with WorkBridge. Sound human.
Return ONLY the message."""
                res = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                    json={"model": "claude-sonnet-4-20250514", "max_tokens": 200,
                          "messages": [{"role": "user", "content": prompt}]}
                )
                outreach_msg = res.json()["content"][0]["text"].strip().strip('"')
        except:
            outreach_msg = f"Hi, I'm {name}. {outreach_template} — WorkBridge"
    else:
        outreach_msg = f"Hi, I'm {name}. {outreach_template} — WorkBridge"

    # Live search for businesses
    businesses = []
    if GOOGLE_KEY:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                geo = await client.get(
                    "https://maps.googleapis.com/maps/api/geocode/json",
                    params={"address": zip_code, "key": GOOGLE_KEY}
                )
                if geo.json().get("results"):
                    loc = geo.json()["results"][0]["geometry"]["location"]
                    places = await client.get(
                        "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                        params={"location": f"{loc['lat']},{loc['lng']}",
                                "radius": 8000, "keyword": category,
                                "type": "establishment", "key": GOOGLE_KEY}
                    )
                    for r in places.json().get("results", [])[:15]:
                        if r.get("place_id"):
                            detail = await client.get(
                                "https://maps.googleapis.com/maps/api/place/details/json",
                                params={"place_id": r["place_id"],
                                        "fields": "formatted_phone_number,name,formatted_address",
                                        "key": GOOGLE_KEY}
                            )
                            result = detail.json().get("result", {})
                            phone = result.get("formatted_phone_number", "")
                            if phone:
                                businesses.append({
                                    "name": r.get("name", ""),
                                    "phone": phone,
                                    "address": result.get("formatted_address", r.get("vicinity", "")),
                                    "rating": r.get("rating", 0),
                                    "mission": mission
                                })
        except Exception as e:
            print(f"Places error: {e}")

    # Fallback — web search for resources
    if not businesses and mission in ["housing", "education", "debt"]:
        search_results = await web_search(f"{category} near {zip_code} {state} phone number")
        return {
            "businesses": [],
            "outreach_message": outreach_msg,
            "search_results": search_results,
            "mission": mission,
            "message": f"Found resources via search for {mission} near {zip_code}"
        }

    # Send SMS blast
    conn = get_db()
    u = conn.execute("SELECT * FROM users WHERE id=%s" if is_pg() else "SELECT * FROM users WHERE id=?",
                     (user["id"],)).fetchone()

    if not u or (u["credits"] if isinstance(u, dict) else u["credits"]) < 1:
        conn.close()
        return {"businesses": businesses, "outreach_message": outreach_msg,
                "sent": 0, "message": "No credits — preview only"}

    sent = 0
    for biz in businesses[:10]:
        phone_raw = biz.get("phone", "")
        if not phone_raw: continue
        phone = normalize_phone(phone_raw)
        biz_name = biz.get("name", "Business")

        if is_pg():
            existing = conn.execute(
                "SELECT id FROM conversations WHERE user_id=%s AND contact_phone=%s",
                (user["id"], phone)).fetchone()
        else:
            existing = conn.execute(
                "SELECT id FROM conversations WHERE user_id=? AND contact_phone=?",
                (user["id"], phone)).fetchone()

        if existing:
            conv_id = existing["id"] if isinstance(existing, dict) else existing[0]
        else:
            if is_pg():
                cur = conn.cursor()
                cur.execute(
                    "INSERT INTO conversations (user_id,contact_phone,contact_name,contact_company,last_message,last_message_at) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
                    (user["id"], phone, biz_name, biz_name, outreach_msg, datetime.utcnow().isoformat()))
                conv_id = cur.fetchone()[0]
            else:
                cur = conn.execute(
                    "INSERT INTO conversations (user_id,contact_phone,contact_name,contact_company,last_message,last_message_at) VALUES (?,?,?,?,?,?)",
                    (user["id"], phone, biz_name, biz_name, outreach_msg, datetime.utcnow().isoformat()))
                conv_id = cur.lastrowid

        sid = await send_sms(phone, outreach_msg)
        if is_pg():
            conn.execute(
                "INSERT INTO messages (conversation_id,user_id,direction,body,from_number,to_number,twilio_sid) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                (conv_id, user["id"], "outbound", outreach_msg, TWILIO_FROM or "WorkBridge", phone, sid or ""))
        else:
            conn.execute(
                "INSERT INTO messages (conversation_id,user_id,direction,body,from_number,to_number,twilio_sid) VALUES (?,?,?,?,?,?,?)",
                (conv_id, user["id"], "outbound", outreach_msg, TWILIO_FROM or "WorkBridge", phone, sid or ""))
        if sid: sent += 1

    if sent > 0:
        if is_pg():
            conn.execute("UPDATE users SET credits=credits-%s WHERE id=%s", (sent, user["id"]))
        else:
            conn.execute("UPDATE users SET credits=credits-? WHERE id=?", (sent, user["id"]))

    if is_pg():
        new_bal = conn.execute("SELECT credits FROM users WHERE id=%s", (user["id"],)).fetchone()
    else:
        new_bal = conn.execute("SELECT credits FROM users WHERE id=?", (user["id"],)).fetchone()

    credits_left = new_bal["credits"] if isinstance(new_bal, dict) else new_bal[0]
    conn.commit(); conn.close()

    confirm = {
        "en": f"✅ Sent to {sent} {mission} providers near {zip_code}! Watching for replies.",
        "es": f"✅ ¡Enviado a {sent} proveedores cerca de {zip_code}! Esperando respuestas.",
    }

    return {
        "businesses": businesses,
        "businesses_found": len(businesses),
        "messages_sent": sent,
        "credits_remaining": credits_left,
        "outreach_message": outreach_msg,
        "mission": mission,
        "user_confirmation": confirm.get(language, confirm["en"])
    }

# ── PLACEMENT TRACKING ────────────────────────────────────────────────────────

@app.post("/placements/update")
async def update_placement(request: Request, user=Depends(get_user)):
    """Track placement status for a conversation"""
    body = await request.json()
    conv_id = body.get("conversation_id")
    status  = body.get("status")  # contacted|replied|interviewed|offered|hired|retained_30|retained_90
    notes   = body.get("notes", "")
    employer_name = body.get("employer_name", "")
    wage    = body.get("wage", "")

    valid = ["contacted","replied","interviewed","offered","hired","retained_30","retained_90","declined"]
    if status not in valid:
        raise HTTPException(400, f"Invalid status. Must be one of: {valid}")

    conn = get_db()
    ph = "%s" if is_pg() else "?"

    # Check if placement record exists
    existing = conn.execute(
        f"SELECT id FROM placements WHERE user_id={ph} AND conversation_id={ph}",
        (user["id"], conv_id)
    ).fetchone()

    now = datetime.utcnow().isoformat()

    if existing:
        pid = existing["id"] if isinstance(existing, dict) else existing[0]
        conn.execute(
            f"""UPDATE placements SET status={ph}, notes={ph},
            employer_name={ph}, wage={ph}, updated_at={ph},
            hired_at=CASE WHEN {ph}='hired' THEN {ph} ELSE hired_at END
            WHERE id={ph}""",
            (status, notes, employer_name, wage, now, status, now, pid)
        )
    else:
        conn.execute(
            f"""INSERT INTO placements
            (user_id, conversation_id, employer_name, status, notes, wage, created_at, updated_at)
            VALUES ({ph},{ph},{ph},{ph},{ph},{ph},{ph},{ph})""",
            (user["id"], conv_id, employer_name, status, notes, wage, now, now)
        )

    conn.commit(); conn.close()
    return {"status": "updated", "placement_status": status}

@app.get("/placements/my")
async def my_placements(user=Depends(get_user)):
    """Get all placement records for current user"""
    conn = get_db()
    ph = "%s" if is_pg() else "?"
    placements = conn.execute(
        f"""SELECT p.*, c.contact_name, c.contact_phone
        FROM placements p
        LEFT JOIN conversations c ON p.conversation_id = c.id
        WHERE p.user_id={ph}
        ORDER BY p.updated_at DESC""",
        (user["id"],)
    ).fetchall()
    conn.close()
    return {"placements": [dict(p) for p in placements]}

@app.get("/placements/stats")
async def placement_stats(user=Depends(get_user)):
    """OC-compliant placement statistics"""
    conn = get_db()
    ph = "%s" if is_pg() else "?"

    total_contacted = conn.execute(
        f"SELECT COUNT(*) as c FROM conversations WHERE user_id={ph}", (user["id"],)
    ).fetchone()
    total_replied = conn.execute(
        f"SELECT COUNT(*) as c FROM conversations WHERE user_id={ph} AND status='replied'", (user["id"],)
    ).fetchone()

    placement_counts = conn.execute(
        f"""SELECT status, COUNT(*) as c FROM placements
        WHERE user_id={ph} GROUP BY status""", (user["id"],)
    ).fetchall()

    stats = {
        "total_contacted": total_contacted["c"] if isinstance(total_contacted, dict) else total_contacted[0],
        "total_replied": total_replied["c"] if isinstance(total_replied, dict) else total_replied[0],
        "placements": {p["status"] if isinstance(p, dict) else p[0]: p["c"] if isinstance(p, dict) else p[1] for p in placement_counts}
    }

    hired = stats["placements"].get("hired", 0)
    contacted = stats["total_contacted"] or 1
    stats["placement_rate"] = round((hired / contacted) * 100, 1)
    stats["reply_rate"] = round((stats["total_replied"] / contacted) * 100, 1)

    conn.close()
    return stats

@app.get("/placements/report")
async def placement_report(user=Depends(get_user)):
    """Generate OC-compliant monthly placement report"""
    conn = get_db()
    ph = "%s" if is_pg() else "?"

    # Get full pipeline
    pipeline = conn.execute(
        f"""SELECT p.status, p.employer_name, p.wage, p.created_at, p.updated_at,
        c.contact_name, c.contact_phone
        FROM placements p
        LEFT JOIN conversations c ON p.conversation_id = c.id
        WHERE p.user_id={ph}
        ORDER BY p.updated_at DESC""",
        (user["id"],)
    ).fetchall()

    u = conn.execute(f"SELECT * FROM users WHERE id={ph}", (user["id"],)).fetchone()
    conn.close()

    user_name = f"{u['first_name']} {u['last_name']}" if isinstance(u, dict) else f"{u[1]} {u[2]}"

    report = {
        "generated_at": datetime.utcnow().isoformat(),
        "client_name": user_name,
        "platform": "WorkBridge — workbridgesms.com",
        "report_period": datetime.utcnow().strftime("%B %Y"),
        "pipeline": [dict(p) for p in pipeline],
        "oc_metrics": {
            "total_employers_contacted": len([p for p in pipeline]),
            "employers_replied": len([p for p in pipeline if (p["status"] if isinstance(p, dict) else p[0]) in ["replied","interviewed","offered","hired","retained_30","retained_90"]]),
            "interviews_completed": len([p for p in pipeline if (p["status"] if isinstance(p, dict) else p[0]) in ["interviewed","offered","hired","retained_30","retained_90"]]),
            "job_offers_received": len([p for p in pipeline if (p["status"] if isinstance(p, dict) else p[0]) in ["offered","hired","retained_30","retained_90"]]),
            "placements_made": len([p for p in pipeline if (p["status"] if isinstance(p, dict) else p[0]) in ["hired","retained_30","retained_90"]]),
            "30_day_retention": len([p for p in pipeline if (p["status"] if isinstance(p, dict) else p[0]) in ["retained_30","retained_90"]]),
            "90_day_retention": len([p for p in pipeline if (p["status"] if isinstance(p, dict) else p[0]) == "retained_90"]),
        }
    }
    return report

# ── AGENCY / CASE MANAGER ENDPOINTS ──────────────────────────────────────────

@app.get("/agency/stats")
async def agency_stats(user=Depends(get_user)):
    """Case manager dashboard — all clients + stats"""
    conn = get_db()
    ph = "%s" if is_pg() else "?"

    clients = conn.execute(
        f"""SELECT u.id, u.first_name, u.last_name, u.phone, u.zip_code,
        u.state, u.language, u.credits, u.target_job, u.created_at,
        (SELECT status FROM placements WHERE user_id=u.id
         ORDER BY updated_at DESC LIMIT 1) as placement_status
        FROM users WHERE u.id > 0 ORDER BY u.created_at DESC"""
    ).fetchall()

    total_contacted = conn.execute("SELECT COUNT(*) as c FROM conversations").fetchone()
    total_replied   = conn.execute("SELECT COUNT(*) as c FROM conversations WHERE status='replied'").fetchone()
    total_hired     = conn.execute("SELECT COUNT(*) as c FROM placements WHERE status='hired'").fetchone()
    total_retained  = conn.execute("SELECT COUNT(*) as c FROM placements WHERE status='retained_30'").fetchone()
    total_interviewed = conn.execute("SELECT COUNT(*) as c FROM placements WHERE status='interviewed'").fetchone()

    def gc(row): return row["c"] if isinstance(row, dict) else row[0]

    conn.close()
    return {
        "total_clients":      len(clients),
        "total_contacted":    gc(total_contacted),
        "total_replied":      gc(total_replied),
        "total_interviewed":  gc(total_interviewed),
        "total_hired":        gc(total_hired),
        "total_retained_30":  gc(total_retained),
        "clients": [dict(c) for c in clients]
    }

@app.get("/agency/client/{client_id}")
async def agency_client_detail(client_id: int, user=Depends(get_user)):
    """Get full detail for a specific client"""
    conn = get_db()
    ph = "%s" if is_pg() else "?"

    client = conn.execute(
        f"SELECT * FROM users WHERE id={ph}", (client_id,)
    ).fetchone()

    if not client:
        conn.close()
        raise HTTPException(404, "Client not found")

    placements = conn.execute(
        f"""SELECT p.*, c.contact_name, c.contact_phone
        FROM placements p
        LEFT JOIN conversations c ON p.conversation_id = c.id
        WHERE p.user_id={ph}
        ORDER BY p.updated_at DESC""",
        (client_id,)
    ).fetchall()

    conversations = conn.execute(
        f"""SELECT * FROM conversations WHERE user_id={ph}
        ORDER BY last_message_at DESC""",
        (client_id,)
    ).fetchall()

    conn.close()
    return {
        "client": {k:v for k,v in dict(client).items() if k != "password_hash"},
        "placements": [dict(p) for p in placements],
        "conversations": [dict(c) for c in conversations],
        "total_contacted": len(conversations),
        "total_replied": len([c for c in conversations if (c["status"] if isinstance(c, dict) else c[5]) == "replied"])
    }
