# CLAUDE.md — WorkBridge Master Reference
# Updated: May 25, 2026 — Complete Build Session
# READ THIS FIRST at start of every session

## REAL DOMAIN: workbridgesms.com
## BACKEND: https://workbridge-api.onrender.com (v3.0 LIVE)
## GITHUB: https://github.com/BDeary7/workbridge
## LOCAL: /Users/brandondeary/Desktop/workbridge/workbridge/

---

## CURRENT STATUS — MAY 25, 2026

| Item | Status |
|---|---|
| Backend v3.0 | LIVE — all 5 services |
| workbridgesms.com | LIVE |
| PostgreSQL | LIVE — data persists forever |
| Twilio toll-free | Verification pending 3-7 days |
| Ytel | Call Monday 9am (800) 926-7007 Lake Forest CA |
| Resend email | DNS propagating — check Monday |
| VetBridge + MOS | LIVE |
| OC Vendor Registration | DONE — opengov.com/portal/ocgov |

---

## 5 REVENUE STREAMS — WORKBRIDGE

1. PAY-AS-YOU-GO CREDITS
   $0.10/SMS credit. Users buy packs.
   Starter $1 (10), Popular $4.50 (50), Best Value $8 (100), Pro $18 (250)

2. AGENCY WHITE-LABEL ($499/mo)
   Nonprofits, shelters, churches, counties buy WorkBridge under their brand.
   Matthew Perez / OC Kinship office is target client #1.
   B2B revenue — highest margin.

3. EMPLOYER PORTAL — CAREERFORCE ($49-199/mo)
   Businesses post openings → WorkBridge matches + blasts candidates.
   Reverse the job seeker flow. Employers pay monthly subscription.

4. COUNTY / GOVERNMENT CONTRACTS
   OC CoC, HMIS integration, HHAP-6 eligible services.
   $396,899 pitch submitted. Vendor registered on opengov.
   Placement tracking data makes this fundable.

5. PLACEMENT SUCCESS FEE
   When a user gets hired → platform earns a placement fee from employer.
   $50-200 per successful placement. Performance-based model.

---

## BUILD ORDER — COMPLETE TASK LIST

### MONDAY IMMEDIATE (before anything else)
[ ] Call Ytel 9am (800) 926-7007 — swap SMS provider
[ ] Check Resend DNS verified → update RESEND_FROM in Render
[ ] Reply to Zitlalic Domond — confirm OC vendor registration
[ ] Test Hugo full flow at workbridgesms.com
[ ] Add 100 credits to Brandon account: curl dev/add-credits

### PHASE 1 — CRITICAL MISSING (build in this order)
[ ] 1. SMS-only mode — user texts JOIN to Ytel number, Coach Ray guides via SMS only. No app, no smartphone needed. Hugo's real use case.
[ ] 2. Placement tracking — track contacted/replied/interviewed/hired/30-day retention. OC requires this for funding. Table: placements in PostgreSQL.
[ ] 3. Case manager portal — Matthew Perez dashboard showing his clients' job search progress. Login with agency token. View all users, outcomes, placements.
[ ] 4. Auto follow-up scheduler — no reply in 3 days → Coach Ray auto-drafts + sends follow-up. Cron job on Render.
[ ] 5. Push notifications (PWA) — business replies while app is closed → phone buzzes. Currently WebSocket only (requires open app).
[ ] 6. Spanish-first mobile onboarding — Hugo flow. Large buttons, simple Spanish, photo upload for ID, no resume needed. /onboarding page rewrite.
[ ] 7. HMIS / CalJOBS integration — API integration for OC county funding eligibility. Required for government contracts.
[ ] 8. Employer portal (CareerForce) — businesses post openings, WorkBridge matches from job seeker pool. Revenue stream #3.
[ ] 9. Credit repair mission (11th mission) — Coach Ray guides dispute letters to Experian, Equifax, TransUnion.
[ ] 10. Agency white-label portal — nonprofits/shelters buy WorkBridge under their brand. $499/mo. Revenue stream #2.

### PHASE 2 — COMPLETE ALL MISSIONS (make Coach Ray do heavy lifting)
[ ] Education — live GED center search, trade school finder, community college near ZIP
[ ] Housing — 211 API, HUD shelter finder, Section 8 offices near ZIP
[ ] Senior care — licensed facility search via Google Places + state licensing API
[ ] Debt relief — IRS Fresh Start matching, NFCC counselors by state
[ ] Vehicle — USAA dealer network, CarMax, local dealers near ZIP
[ ] Home services — contractor license verification, insurance check, Yelp rating
[ ] Business (Hire Workers) — candidate matching from job seeker pool
[ ] Household help — vetted service provider search near ZIP

### PHASE 3 — COUNTY PITCH SUPPORT
[ ] Placement reports PDF generator — auto-generates monthly OC-compliant reports
[ ] HHAP-6 eligible activity documentation
[ ] Supportive Housing NOFA — find developer partner to subcontract to
[ ] CONREP facility partner outreach — find licensed ARF operators needing employment tech

---

## COMPLETE API ENDPOINTS (v3.0)
/auth/register|login|me|forgot-password|reset-password|profile/update
/sms/blast|inbox|thread/{id}|reply|history|reply/webhook (GET+POST)
/coach/chat|generate-message|agent-search|save-profile|suggest-reply
/coach/draft-message|session|reset|docs|veteran-translate
/messages/reply|/user/missions|/appointments
/credits/purchase|webhook|balance
/dev/add-credits (TEST ONLY)
/ws/{token}|/health

---

## DASHBOARD — 10 MISSIONS (DO NOT REPLACE app/dashboard/page.tsx)
veteran|job|home|senior|education|housing|business|vehicle|debt|chores
Each has conditional question trees in getQuestions()
VetBridge: employment sub-track fires when veteran selects Employment
MOS translation: /coach/veteran-translate — 30 codes + Claude AI fallback

---

## SMS FLOW (END TO END)
mission → agent-search → Google Places → Ytel/Twilio blast
→ business replies → webhook POST → WebSocket push → SMS History
→ suggest-reply AI → messages/reply → Ytel/Twilio delivers
Webhook: https://workbridge-api.onrender.com/sms/reply/webhook

---

## TWILIO / YTEL
Twilio: +18774173538 toll-free — verification submitted May 23
Ytel: Monday 9am (800) 926-7007 — Lake Forest CA — 30 min swap
Swap changes: send_sms() function + webhook parser only

---

## RESEND EMAIL
Key: RESEND_API_KEY in Render
From: onboarding@resend.dev (temp — change when DNS verifies)
Domain: workbridgesms.com on GoDaddy — check Monday
Change RESEND_FROM to: WorkBridge <noreply@workbridgesms.com>

---

## RENDER ENV VARS (all confirmed live)
TWILIO_ACCOUNT_SID|TWILIO_AUTH_TOKEN|TWILIO_FROM_NUMBER
ANTHROPIC_API_KEY|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET
GOOGLE_PLACES_KEY|SECRET_KEY|RESEND_API_KEY|RESEND_FROM
PORT|DATABASE_URL (PostgreSQL)

---

## SYSTEM COLOR SCHEMA
amber=#F59E0B  green=#10B981  dark=#080C12  white=#F0F4F8
CSS vars in globals.css: --wb-amber --wb-green --wb-dark --wb-white

---

## KEY FILES
app/dashboard/page.tsx     — DO NOT REPLACE — 10 mission dashboard
app/page.tsx               — Homepage
app/login/page.tsx         — Login + Signup + Forgot Password (3 tabs)
app/onboarding/page.tsx    — Onboarding flow (needs Spanish-first rewrite)
app/messages/page.tsx      — SMS inbox
app/reset-password/page.tsx — Password reset
app/privacy/page.tsx       — Privacy policy
app/terms/page.tsx         — Terms of service
app/globals.css            — System colors + iOS Safari fixes
workbridge_api.py          — FastAPI backend v3.0

---

## OC PROCUREMENT
Registered: procurement.opengov.com/portal/ocgov
NIGP:20879 | NAICS:541511,561311,624310 | UNSPSC:80111500,81111700
Zitlalic Domond: Zitlalic.Domond@occr.ocgov.com — needs reply
Matthew Perez: matthew.perez@ocworkforcesolutions.com — internal champion
OC Pitch: $396,899 sent to CareCoordination@ocgov.com

---

## DEPLOY COMMANDS
cd ~/Desktop/workbridge/workbridge
git add -A && git commit -m "msg" && git push origin main
curl https://workbridge-api.onrender.com/health

---

## LESSONS LEARNED
- Real domain: workbridgesms.com NOT workbridge-rho.vercel.app
- iOS Safari: -webkit-text-fill-color for input text visibility
- useSearchParams() needs Suspense wrapper in Next.js
- Never use vercel.json with Next.js app router
- Nested backticks in template literals break TypeScript
- Python 3.14: no backslash escapes inside f-strings
- Twilio webhook needs GET + POST both returning 200 TwiML
- onboarding@resend.dev only sends to account owner until domain verified
- SQLite resets on Render free tier — PostgreSQL live and fixed
- Always read existing code before replacing anything
