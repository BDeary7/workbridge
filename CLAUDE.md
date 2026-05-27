# CLAUDE.md — WorkBridge Master Reference
# Updated: May 27, 2026 | READ FIRST every session

## URLS
workbridgesms.com | workbridge-api.onrender.com | /casemgr (PIN: WB2026OC)

## STATUS — ALL GREEN
Backend v3.0 | PostgreSQL | PWA | Placement Tracking | Case Manager | Mission Search
Spanish Onboarding | SMS-only Mode | VetBridge | Coach Ray Heavy Lifting ✅

## 5 REVENUE STREAMS
1. SMS credits ($0.10/msg)
2. Agency white-label ($499/mo) — Matthew Perez target
3. CareerForce employer portal ($49-199/mo) — 14 agencies loaded
4. County contracts — $396,899 pitch sent
5. Placement success fee ($50-200/hire)

## COACH RAY — ALL 10 MISSIONS NOW ACTIVE
Each mission: live web search → personalized outreach → SMS blast → document generation
job ✅ | veteran ✅ | education ✅ | housing ✅ | home ✅
senior ✅ | debt ✅ | vehicle ✅ | chores ✅ | business ✅

Documents generated per mission:
- job: Interview Prep, Negotiation Script, Credential Roadmap, Follow-Up Templates
- education: GED Study Plan, Credential Roadmap
- housing: Housing Application Cover Letter
- debt: Hardship Letter, Debt Payoff Plan
- veteran: VA Benefits Summary

## SMS-ONLY MODE
Text JOIN/HOLA/TRABAJO → auto-registers → Coach Ray guides via SMS
STOP → unsubscribe

## NEXT BUILDS
1. HMIS/CalJOBS integration
2. CareerForce employer portal
3. Credit repair (11th mission)
4. Agency white-label portal
5. Auto follow-up scheduler (3-day cron)

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

## DEPLOY
cd ~/Desktop/workbridge/workbridge
git add -A && git commit -m "msg" && git push origin main
curl https://workbridge-api.onrender.com/health

## LESSONS
- mkdir -p before cat > for nested files
- iOS Safari: -webkit-text-fill-color for inputs
- useSearchParams needs Suspense in Next.js
- Never vercel.json with Next.js app router
- Nested backticks break TypeScript build
- Python 3.14: no backslash in f-strings
- Twilio webhook needs GET + POST both 200
- Mixed ? and %s crashes PostgreSQL — always use is_pg() helper
- Always read existing files before replacing
