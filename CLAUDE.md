# CLAUDE.md — WorkBridge Live Build Reference
# Updated: May 23, 2026 — Late Session

## DOMAIN: workbridgesms.com
## BACKEND: https://workbridge-api.onrender.com (v3.0)
## GITHUB: https://github.com/BDeary7/workbridge
## LOCAL: /Users/brandondeary/Desktop/workbridge/workbridge/

## COLOR SCHEMA (consistent across ALL pages)
amber=#F59E0B green=#10B981 dark=#080C12 white=#F0F4F8
CSS vars in globals.css: --wb-amber --wb-green --wb-dark --wb-white

## STATUS
Backend v3.0 LIVE | workbridgesms.com LIVE
Twilio: verification pending | Ytel: call Monday (800) 926-7007
Resend: DNS propagating | Forgot password: ready when DNS verifies

## ENDPOINTS
/auth/register|login|me|forgot-password|reset-password|profile/update
/sms/blast|inbox|thread/{id}|reply|history|reply/webhook
/coach/chat|generate-message|agent-search|save-profile|suggest-reply|draft-message|session|reset|docs
/messages/reply|/user/missions|/appointments|/credits/purchase|webhook|balance
/dev/add-credits|/ws/{token}|/health

## RENDER ENV VARS (all set)
TWILIO_ACCOUNT_SID|TWILIO_AUTH_TOKEN|TWILIO_FROM_NUMBER
ANTHROPIC_API_KEY|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET
GOOGLE_PLACES_KEY|SECRET_KEY|RESEND_API_KEY|RESEND_FROM|PORT

## MONDAY
1. Ytel (800) 926-7007 — swap SMS
2. Resend DNS verify — update RESEND_FROM in Render
3. Hugo test full flow
4. VetBridge build

## DEPLOY
cd ~/Desktop/workbridge/workbridge
git add -A && git commit -m "msg" && git push origin main
curl https://workbridge-api.onrender.com/health

## LESSONS
- iOS Safari: -webkit-text-fill-color for inputs
- useSearchParams needs Suspense in Next.js
- Python 3.14: no backslash in f-strings
- Never vercel.json with Next.js app router
- Twilio webhook needs GET+POST both 200
- onboarding@resend.dev only sends to account owner until domain verified
