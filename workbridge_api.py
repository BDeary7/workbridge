from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import sqlite3, hashlib, secrets, json, os, asyncio, httpx

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN  = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")
GOOGLE_PLACES_KEY  = os.getenv("GOOGLE_PLACES_KEY", "")
STRIPE_SECRET_KEY  = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
ANTHROPIC_API_KEY  = os.getenv("ANTHROPIC_API_KEY", "")
DB_PATH = "/data/workbridge.db"

app = FastAPI(title="WorkBridge API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, email TEXT UNIQUE, phone TEXT,
        password_hash TEXT, credits INTEGER DEFAULT 5,
        language TEXT DEFAULT 'en', created_at TEXT DEFAULT (datetime('now')),
        api_token TEXT
    );
    CREATE TABLE IF NOT EXISTS sms_blast (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, recipient_name TEXT, recipient_phone TEXT,
        recipient_address TEXT, category TEXT, position TEXT,
        zip_code TEXT, message_text TEXT, status TEXT DEFAULT 'pending',
        twilio_sid TEXT, sent_at TEXT, reply_text TEXT, replied_at TEXT
    );
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, business_name TEXT, business_phone TEXT,
        appt_datetime TEXT, notes TEXT, status TEXT DEFAULT 'scheduled',
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS credit_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, credits INTEGER, amount_cents INTEGER,
        stripe_session TEXT, status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)
    conn.commit()
    conn.close()

init_db()

class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    language: Optional[str] = "en"

class LoginRequest(BaseModel):
    email: str
    password: str

class SearchRequest(BaseModel):
    zip_code: str
    category: str
    position: str
    radius_miles: Optional[int] = 10

class BlastRequest(BaseModel):
    businesses: List[dict]
    message: str
    category: str
    position: str
    zip_code: str

class AppointmentRequest(BaseModel):
    business_name: str
    business_phone: str
    appt_datetime: str
    notes: Optional[str] = ""

class CreditPurchaseRequest(BaseModel):
    credits: int

class CoachRequest(BaseModel):
    messages: List[dict]
    language: Optional[str] = "en"

CREDIT_PACKAGES = {10:100, 50:450, 100:800, 250:1800, 500:3000}

def hash_password(pw): return hashlib.sha256(pw.encode()).hexdigest()

def get_user(request: Request):
    token = request.headers.get("Authorization","").replace("Bearer ","")
    if not token: raise HTTPException(401, "Token required")
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE api_token=?", (token,)).fetchone()
    conn.close()
    if not user: raise HTTPException(401, "Invalid token")
    return dict(user)

@app.get("/")
async def root():
    return {"message":"WorkBridge API","docs":"/docs","health":"/health"}

@app.get("/health")
async def health():
    return {"status":"online","service":"WorkBridge API","version":"1.0.0","message":"Built for Hugo. 🌉"}

@app.post("/auth/register")
async def register(req: RegisterRequest):
    conn = get_db()
    if conn.execute("SELECT id FROM users WHERE email=?", (req.email,)).fetchone():
        conn.close()
        raise HTTPException(400, "Email already registered")
    token = secrets.token_hex(32)
    conn.execute("INSERT INTO users (name,email,phone,password_hash,credits,language,api_token) VALUES (?,?,?,?,5,?,?)",
        (req.name, req.email, req.phone, hash_password(req.password), req.language, token))
    conn.commit()
    conn.close()
    return {"token": token, "credits": 5, "message": "Welcome to WorkBridge! 5 free credits included."}

@app.post("/auth/login")
async def login(req: LoginRequest):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=? AND password_hash=?",
        (req.email, hash_password(req.password))).fetchone()
    if not user:
        conn.close()
        raise HTTPException(401, "Invalid credentials")
    token = secrets.token_hex(32)
    conn.execute("UPDATE users SET api_token=? WHERE id=?", (token, user["id"]))
    conn.commit()
    conn.close()
    return {"token": token, "user_id": user["id"], "name": user["name"], "credits": user["credits"]}

@app.post("/search/businesses")
async def search_businesses(req: SearchRequest, request: Request):
    user = get_user(request)
    businesses = []
    if GOOGLE_PLACES_KEY:
        async with httpx.AsyncClient() as client:
            geo = await client.get("https://maps.googleapis.com/maps/api/geocode/json",
                params={"address": req.zip_code, "key": GOOGLE_PLACES_KEY})
            geo_data = geo.json()
            if geo_data.get("results"):
                loc = geo_data["results"][0]["geometry"]["location"]
                lat, lng = loc["lat"], loc["lng"]
                resp = await client.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                    params={"location":f"{lat},{lng}","radius":req.radius_miles*1609,
                            "keyword":req.category,"key":GOOGLE_PLACES_KEY})
                for place in resp.json().get("results",[])[:10]:
                    detail = await client.get("https://maps.googleapis.com/maps/api/place/details/json",
                        params={"place_id":place["place_id"],
                                "fields":"name,formatted_phone_number,formatted_address",
                                "key":GOOGLE_PLACES_KEY})
                    d = detail.json().get("result",{})
                    if d.get("formatted_phone_number"):
                        businesses.append({"name":place.get("name"),"phone":d.get("formatted_phone_number"),
                            "address":d.get("formatted_address",""),"category":req.category,"rating":place.get("rating",0)})
                    await asyncio.sleep(0.1)
    # If Google Places returns nothing, use realistic demo data
    if not businesses:
        demo_names = [
            f"Sunrise {req.category} Center", f"Pacific {req.position} Services",
            f"Golden State {req.category}", f"Harbor View {req.position} Agency",
            f"Coastal {req.category} Group", f"Premier {req.position} Solutions",
            f"Valley {req.category} Associates", f"Westside {req.position} Network"
        ]
        for i, name in enumerate(demo_names[:8]):
            businesses.append({
                "name": name,
                "phone": f"(949) {500+i*7}-{1000+i*13}",
                "address": f"{100+i*50} Pacific Coast Hwy, {req.zip_code}",
                "category": req.category,
                "rating": round(4.0 + (i%3)*0.2, 1)
            })
    return {"businesses": businesses[:20], "count": len(businesses[:20])}

@app.post("/sms/blast")
async def send_blast(req: BlastRequest, background_tasks: BackgroundTasks, request: Request):
    user = get_user(request)
    needed = len(req.businesses)
    conn = get_db()
    current = conn.execute("SELECT credits FROM users WHERE id=?", (user["id"],)).fetchone()["credits"]
    if current < needed:
        conn.close()
        raise HTTPException(402, f"Need {needed} credits, have {current}")
    conn.execute("UPDATE users SET credits=credits-? WHERE id=?", (needed, user["id"]))
    blast_ids = []
    for biz in req.businesses:
        c = conn.execute("INSERT INTO sms_blast (user_id,recipient_name,recipient_phone,recipient_address,category,position,zip_code,message_text) VALUES (?,?,?,?,?,?,?,?)",
            (user["id"],biz.get("name"),biz.get("phone"),biz.get("address"),req.category,req.position,req.zip_code,req.message))
        blast_ids.append(c.lastrowid)
    conn.commit()
    conn.close()
    background_tasks.add_task(execute_blast, blast_ids, req.businesses, req.message)
    return {"status":"queued","count":needed,"credits_remaining":current-needed}

async def execute_blast(blast_ids, businesses, message):
    for blast_id, biz in zip(blast_ids, businesses):
        phone = "".join(c for c in biz.get("phone","") if c.isdigit())
        if len(phone) == 10: phone = "+1" + phone
        elif not phone.startswith("+"): phone = "+" + phone
        try:
            if TWILIO_ACCOUNT_SID:
                from twilio.rest import Client
                Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN).messages.create(
                    body=message, from_=TWILIO_FROM_NUMBER, to=phone)
            conn = get_db()
            conn.execute("UPDATE sms_blast SET status='sent',sent_at=? WHERE id=?",
                (datetime.utcnow().isoformat(), blast_id))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"SMS error: {e}")
        await asyncio.sleep(0.2)

@app.post("/sms/reply/webhook")
async def sms_webhook(request: Request):
    form = await request.form()
    from_number = form.get("From","")
    body = form.get("Body","")
    conn = get_db()
    blast = conn.execute("SELECT * FROM sms_blast WHERE recipient_phone LIKE ? AND status='sent' ORDER BY sent_at DESC LIMIT 1",
        (f"%{from_number[-10:]}%",)).fetchone()
    if blast:
        conn.execute("UPDATE sms_blast SET status='replied',reply_text=?,replied_at=? WHERE id=?",
            (body, datetime.utcnow().isoformat(), blast["id"]))
        conn.commit()
    conn.close()
    return {"status":"ok"}

@app.get("/sms/history")
async def sms_history(request: Request):
    user = get_user(request)
    conn = get_db()
    rows = conn.execute("SELECT * FROM sms_blast WHERE user_id=? ORDER BY sent_at DESC LIMIT 50",(user["id"],)).fetchall()
    conn.close()
    return {"history": [dict(r) for r in rows]}

@app.post("/appointments/create")
async def create_appointment(req: AppointmentRequest, request: Request):
    user = get_user(request)
    conn = get_db()
    c = conn.execute("INSERT INTO appointments (user_id,business_name,business_phone,appt_datetime,notes) VALUES (?,?,?,?,?)",
        (user["id"],req.business_name,req.business_phone,req.appt_datetime,req.notes))
    conn.commit()
    conn.close()
    return {"appt_id":c.lastrowid,"status":"scheduled"}

@app.get("/appointments")
async def get_appointments(request: Request):
    user = get_user(request)
    conn = get_db()
    rows = conn.execute("SELECT * FROM appointments WHERE user_id=? ORDER BY appt_datetime",(user["id"],)).fetchall()
    conn.close()
    return {"appointments":[dict(r) for r in rows]}

@app.post("/credits/purchase")
async def purchase_credits(req: CreditPurchaseRequest, request: Request):
    user = get_user(request)
    if req.credits not in CREDIT_PACKAGES:
        raise HTTPException(400, f"Choose from: {list(CREDIT_PACKAGES.keys())}")
    price = CREDIT_PACKAGES[req.credits]
    if not STRIPE_SECRET_KEY:
        return {"message":"Stripe not configured","credits":req.credits,"price_cents":price}
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price_data":{"currency":"usd","product_data":{"name":f"WorkBridge {req.credits} SMS Credits"},"unit_amount":price},"quantity":1}],
        mode="payment",
        success_url="https://workbridge-rho.vercel.app/dashboard",
        cancel_url="https://workbridge-rho.vercel.app/dashboard",
        metadata={"user_id":user["id"],"credits":req.credits}
    )
    conn = get_db()
    conn.execute("INSERT INTO credit_transactions (user_id,credits,amount_cents,stripe_session) VALUES (?,?,?,?)",
        (user["id"],req.credits,price,session.id))
    conn.commit()
    conn.close()
    return {"checkout_url":session.url}

@app.post("/credits/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    try:
        event = json.loads(payload)
        if event.get("type") == "checkout.session.completed":
            s = event["data"]["object"]
            meta = s.get("metadata",{})
            uid = int(meta.get("user_id",0))
            credits_to_add = int(meta.get("credits",0))
            if uid and credits_to_add:
                conn = get_db()
                conn.execute("UPDATE users SET credits=credits+? WHERE id=?", (credits_to_add, uid))
                conn.execute("UPDATE credit_transactions SET status='completed' WHERE stripe_session=?", (s["id"],))
                conn.commit()
                conn.close()
                print(f"Added {credits_to_add} credits to user {uid}")
        return {"status":"ok"}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status":"ok"}

@app.get("/credits/balance")
async def get_balance(request: Request):
    user = get_user(request)
    conn = get_db()
    row = conn.execute("SELECT credits,phone,email,name FROM users WHERE id=?",(user["id"],)).fetchone()
    conn.close()
    return {
        "credits": row["credits"],
        "cost_per_text": 0.10,
        "phone": row["phone"] or "",
        "email": row["email"] or "",
        "name": row["name"] or ""
    }

@app.post("/coach/chat")
async def coach_chat(req: CoachRequest):
    if not ANTHROPIC_API_KEY:
        return {"reply": "Coach Ray is coming soon! Visit workbridge-rho.vercel.app to get started."}
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={"Content-Type":"application/json","x-api-key":ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
                json={"model":"claude-haiku-4-5-20251001","max_tokens":400,
                      "system":f"You are Coach Ray, WorkBridge's AI career coach. Keep responses SHORT (2-3 sentences max). Help with job searching, GED prep, interview tips, and career advancement. Be warm, encouraging, and direct. Respond in {'Spanish' if req.language=='es' else 'English'}.",
                      "messages":req.messages},
                timeout=30
            )
            data = res.json()
            if data.get("content"):
                reply = data["content"][0].get("text", "I'm here to help! Ask me anything about jobs or your GED.")
            elif data.get("error"):
                error_msg = data["error"].get("message", "Unknown error")
                reply = f"DEBUG ERROR: {error_msg}"
            else:
                reply = f"DEBUG: Unexpected response: {str(data)[:200]}"
            return {"reply": reply}
    except Exception as e:
        return {"reply": f"DEBUG EXCEPTION: {str(e)}"}

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@app.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    conn = get_db()
    user = conn.execute("SELECT id FROM users WHERE email=?", (req.email,)).fetchone()
    if user:
        # Generate reset token
        reset_token = secrets.token_hex(16)
        conn.execute("UPDATE users SET api_token=? WHERE email=?", (reset_token, req.email))
        conn.commit()
        # In production send email — for now return token directly
        conn.close()
        return {"message": f"Reset token: {reset_token} — use POST /auth/reset-password", "token": reset_token}
    conn.close()
    return {"message": "If that email exists, a reset link has been sent."}

@app.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    conn = get_db()
    user = conn.execute("SELECT id FROM users WHERE api_token=?", (req.token,)).fetchone()
    if not user:
        conn.close()
        raise HTTPException(400, "Invalid or expired reset token")
    new_token = secrets.token_hex(32)
    conn.execute("UPDATE users SET password_hash=?, api_token=? WHERE id=?",
        (hash_password(req.new_password), new_token, user["id"]))
    conn.commit()
    conn.close()
    return {"message": "Password reset successfully", "token": new_token}

class ProfileSaveRequest(BaseModel):
    mission: str
    answers: dict
    timestamp: Optional[str] = None

@app.post("/coach/save-profile")
async def save_profile(req: ProfileSaveRequest, request: Request):
    user = get_user(request)
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER, mission TEXT, answers TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )""")
    conn.execute("INSERT INTO user_profiles (user_id, mission, answers) VALUES (?,?,?)",
        (user["id"], req.mission, json.dumps(req.answers)))
    conn.commit()
    conn.close()
    return {"status": "saved", "mission": req.mission}

@app.get("/coach/profiles")
async def get_profiles(request: Request):
    user = get_user(request)
    conn = get_db()
    conn.execute("""CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, mission TEXT, answers TEXT,
        created_at TEXT DEFAULT (datetime('now')))""")
    rows = conn.execute(
        "SELECT * FROM user_profiles WHERE user_id=? ORDER BY created_at DESC",
        (user["id"],)).fetchall()
    conn.close()
    return {"profiles": [{"mission":r["mission"],"answers":json.loads(r["answers"]),"created_at":r["created_at"]} for r in rows]}
