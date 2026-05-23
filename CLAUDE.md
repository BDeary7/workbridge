# CLAUDE.md — WorkBridge Live Build Reference
# Updated: May 23, 2026 — End of Session

## STATUS: ALL GREEN
Backend v3.0 LIVE | workbridgesms.com LIVE | Twilio verification SUBMITTED

## REAL DOMAIN: workbridgesms.com
## BACKEND: https://workbridge-api.onrender.com
## GITHUB: https://github.com/BDeary7/workbridge
## LOCAL: /Users/brandondeary/Desktop/workbridge/workbridge/

## ALL ENDPOINTS LIVE
/auth/register|login|me|profile/update
/sms/blast|inbox|thread/{id}|reply|history|reply/webhook
/coach/chat|generate-message|agent-search|save-profile|suggest-reply|draft-message|session|reset|docs
/messages/reply | /user/missions | /appointments | /credits/purchase|webhook|balance
/ws/{token} | /health

## DASHBOARD — DO NOT REPLACE app/dashboard/page.tsx
10 missions: veteran|job|home|senior|education|housing|business|vehicle|debt|chores
All have conditional question trees in getQuestions()

## SMS FLOW
mission → agent-search → Google Places → Twilio blast → business replies
→ webhook → WebSocket → SMS History → suggest-reply → messages/reply

## TWILIO
Number: +18774173538 (toll-free)
Webhook: https://workbridge-api.onrender.com/sms/reply/webhook
Verification: SUBMITTED May 23 — pending 3-7 days

## OC PITCH
$396,899 total ask — PDF sent — CareCoordination@ocgov.com
Champion: Matthew Perez — matthew.perez@ocworkforcesolutions.com — Kinship office

## DEPLOY
cd ~/Desktop/workbridge/workbridge
git add -A && git commit -m "msg" && git push origin main
curl https://workbridge-api.onrender.com/health

## LESSONS
- Domain is workbridgesms.com NOT workbridge-rho.vercel.app
- Never use vercel.json with Next.js app router
- Always read existing code before replacing
- Python 3.14 no backslash in f-strings
- Twilio webhook needs GET + POST both returning 200
- /sms/history needs recipient_name + reply_text fields for dashboard
