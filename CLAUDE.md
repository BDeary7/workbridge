# WorkBridge — Claude.md
# Living project reference. Updated: May 19, 2026

## CURRENT STATUS
- Backend (Render): workbridge-api.onrender.com — NEEDS MANUAL DEPLOY (v1.0.0 live, v3.0 in GitHub)
- Frontend (Vercel): workbridge-rho.vercel.app — LIVE
- GitHub: github.com/BDeary7/workbridge — v3.0 pushed, not deployed on Render yet

## ARCHITECTURE
Backend: FastAPI on Render | Frontend: React on Vercel | DB: SQLite on Render

## SMS — HOW TEXTING WORKS
1. User blasts businesses → POST /sms/blast → Twilio sends → conversation threads created
2. Business replies → Twilio fires /sms/reply/webhook → stored → WebSocket pushes to user in real time
3. User replies back → POST /sms/reply → Twilio sends to business
4. Webhook URL: https://workbridge-api.onrender.com/sms/reply/webhook

## REMAINING BLOCKERS
1. CRITICAL: Render manual deploy — v3.0 not live
2. CRITICAL: ANTHROPIC_API_KEY in Render env vars
3. CRITICAL: Twilio webhook URL set in Twilio console
4. HIGH: Stripe keys in Render env
5. HIGH: Google Places key in Render env
6. MEDIUM: WorkBridgeDashboard.jsx push to Vercel

## OC PITCH
- $396,899 total ask — PDF sent
- Emails out to OC Care Coordination + Matthew Perez
- OC CoC Board: May 27, 2026 at 2pm

## REQUIRED ENV VARS (Render)
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER,
ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
GOOGLE_PLACES_KEY, SECRET_KEY=workbridge-secret-2026
