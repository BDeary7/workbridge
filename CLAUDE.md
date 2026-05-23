# CLAUDE.md — WorkBridge Live Build Reference
# Updated: May 23, 2026 | Living document

## REAL DOMAIN: workbridgesms.com
## BACKEND: https://workbridge-api.onrender.com
## GITHUB: https://github.com/BDeary7/workbridge
## LOCAL: /Users/brandondeary/Desktop/workbridge/workbridge/

## CURRENT STATUS
- Backend: v1.0.0 live, v3.0 deploying now
- Frontend: LIVE at workbridgesms.com
- Twilio: Toll-free verification IN PROGRESS
- Twilio Webhook: NOT SET — set after v3.0 deploys
- Webhook URL: https://workbridge-api.onrender.com/sms/reply/webhook

## REMAINING BLOCKERS
1. Wait for Render v3.0 deploy — curl health until version 3.0
2. Set Twilio webhook after v3.0 live
3. Confirm ANTHROPIC_API_KEY in Render env vars
4. Confirm Stripe keys in Render env vars

## OC PITCH
- $396,899 total ask — PDF sent to CareCoordination@ocgov.com
- Internal champion: Matthew Perez — Kinship office social worker
- matthew.perez@ocworkforcesolutions.com

## DEPLOY
cd ~/Desktop/workbridge/workbridge
git add -A && git commit -m "msg" && git push origin main
curl https://workbridge-api.onrender.com/health
