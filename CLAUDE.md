# CLAUDE.md — WorkBridge Master Reference
# Updated: May 26, 2026 | READ FIRST every session

## LIVE URLS
workbridgesms.com | workbridge-api.onrender.com | workbridgesms.com/casemgr (PIN: WB2026OC)

## STATUS — ALL GREEN
Backend v3.0 | PostgreSQL | PWA | Placement Tracking | Case Manager Portal | Mission Search

## 5 REVENUE STREAMS
1. SMS credits ($0.10/msg)
2. Agency white-label ($499/mo) — Matthew Perez target
3. CareerForce employer portal ($49-199/mo) — 14 agencies loaded
4. County contracts — $396,899 pitch sent
5. Placement success fee ($50-200/hire)

## NEXT SESSION — BUILD IN ORDER
1. Spanish-first mobile onboarding (app/onboarding/page.tsx exists — needs Spanish + Hugo flow)
2. SMS-only mode (text JOIN → Coach Ray guides via SMS, no app needed)
3. HMIS/CalJOBS integration
4. CareerForce employer portal
5. Credit repair mission (11th mission)
6. Agency white-label portal

## KEY CONTACTS
Matthew Perez: matthew.perez@ocworkforcesolutions.com — Case Manager Portal
Zitlalic Domond: Zitlalic.Domond@occr.ocgov.com — NEEDS REPLY
Ytel: Thursday 11am — Richard + Brandon Wells — (800) 926-7007
Joshua: OC Workforce — gave 14 staffing agency list

## ALL ENDPOINTS
/auth/register|login|me|forgot-password|reset-password|profile/update
/sms/blast|inbox|thread/{id}|reply|history|reply/webhook
/coach/chat|generate-message|agent-search|mission-search|save-profile
/coach/suggest-reply|draft-message|session|reset|docs|veteran-translate|staffing-agencies
/messages/reply|/user/missions|/appointments
/placements/update|my|stats|report
/agency/stats|agency/client/{id}
/credits/purchase|webhook|balance|/dev/add-credits
/ws/{token}|/health

## CASE MANAGER PORTAL
URL: workbridgesms.com/casemgr | PIN: WB2026OC
Give to: Matthew Perez, Joshua, any OC social worker

## 14 OC STAFFING AGENCIES (in backend /coach/staffing-agencies)
Robert Half|Ultimate Staffing|East Ridge|Express Employment|Action Resource
West Coast Staffing|Vault Workforce|Staff Seekers|Kimco|Tony Beare
Pirate Staffing|Staffing Solutions|PeopleReady|AMP Staffing

## COLORS: amber=#F59E0B green=#10B981 dark=#080C12 white=#F0F4F8

## DEPLOY
cd ~/Desktop/workbridge/workbridge
git add -A && git commit -m "msg" && git push origin main
curl https://workbridge-api.onrender.com/health

## LESSONS
- mkdir -p before cat > for nested files
- iOS Safari: -webkit-text-fill-color for inputs
- useSearchParams needs Suspense in Next.js
- Never vercel.json with Next.js
- Nested backticks break TypeScript
- Python 3.14 no backslash in f-strings
- Twilio webhook needs GET+POST both 200
- Always read existing files before replacing
