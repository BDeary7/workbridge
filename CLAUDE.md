# CLAUDE.md — WorkBridge Live Build Reference
# Updated: May 24, 2026

## 🚨 DO FIRST NEXT SESSION — PostgreSQL Migration
SQLite wipes all users on every Render redeploy.
1. render.com → New → PostgreSQL → Free → Oregon
2. Copy Internal Database URL
3. Add DATABASE_URL to workbridge-api environment
4. Paste URL to Claude — migration patch ready to run

## DOMAIN: workbridgesms.com
## BACKEND: https://workbridge-api.onrender.com (v3.0)
## GITHUB: https://github.com/BDeary7/workbridge
## LOCAL: /Users/brandondeary/Desktop/workbridge/workbridge/

## COLORS: amber=#F59E0B green=#10B981 dark=#080C12 white=#F0F4F8

## ENDPOINTS
/auth/register|login|me|forgot-password|reset-password|profile/update
/sms/blast|inbox|thread/{id}|reply|history|reply/webhook
/coach/chat|generate-message|agent-search|save-profile|suggest-reply
/coach/draft-message|session|reset|docs|veteran-translate
/messages/reply|/user/missions|/appointments|/credits/purchase|webhook|balance
/dev/add-credits|/ws/{token}|/health

## VETBRIDGE BUILT
MOS translation, DD-214 questions, employment sub-track, Voc Rehab detection
30-code local map + Claude AI fallback | /coach/veteran-translate

## TWILIO: +18774173538 toll-free — verification pending
## YTEL: Call Monday 9am (800) 926-7007 Lake Forest CA
## RESEND: DNS propagating — change RESEND_FROM when verified

## OC PROCUREMENT
Registered: procurement.opengov.com/portal/ocgov
NIGP:20879 NAICS:541511,561311,624310 UNSPSC:80111500,81111700
Zitlalic Domond: Zitlalic.Domond@occr.ocgov.com — reply to her email
Matthew Perez: matthew.perez@ocworkforcesolutions.com

## RENDER ENV VARS NEEDED
DATABASE_URL — PostgreSQL Internal URL (not added yet)

## MONDAY
1. PostgreSQL migration
2. Ytel call
3. Resend DNS check
4. Hugo full test
5. Reply Zitlalic Domond

## LESSONS
SQLite resets on Render — PostgreSQL critical
iOS Safari: -webkit-text-fill-color for inputs
useSearchParams needs Suspense in Next.js
Nested backticks break TypeScript build
Never vercel.json with Next.js app router
