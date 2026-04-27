# WorkBridge — Master Project File
Last Updated: 2026-04-26

## LIVE URLS
- Frontend: https://workbridge-rho.vercel.app
- Backend: https://workbridge-api.onrender.com
- GitHub: https://github.com/BDeary7/workbridge

## CREDENTIALS
- WorkBridge account: brandondeary777@gmail.com
- Render: dashboard.render.com
- Vercel: vercel.com/bdeary7s-projects

## TECH STACK
- Frontend: Next.js (TypeScript) → Vercel
- Backend: FastAPI (Python) → Render
- Database: SQLite → /data/workbridge.db (persistent disk)
- SMS: Twilio
- Payments: Stripe
- AI: Anthropic Claude (Coach Ray)

## ✅ COMPLETED & TESTED
- [x] Homepage with Hugo story, bilingual EN/ES
- [x] Login page — Log In / Sign Up / Forgot Password tabs
- [x] User registration with JWT token auth
- [x] Persistent database on Render /data disk
- [x] Health check endpoint + frontend wake-up ping
- [x] Render env vars: ANTHROPIC, TWILIO, STRIPE, GOOGLE_PLACES
- [x] Backend API 13 endpoints deployed on Render
- [x] Coach Ray chat via Render backend (not direct Anthropic)
- [x] Save profile endpoint /coach/save-profile
- [x] Forgot password + reset password endpoints
- [x] Legal opt-in checkboxes (SMS, data sharing, partners)

## 🔜 IN PROGRESS
- [ ] Dashboard — 10 Mission cards (build error blocking deploy)
- [ ] Coach Ray specialist mode per mission
- [ ] Qualifying questions per mission (all 10 missions built locally)

## ❌ NOT STARTED
- [ ] Fix Vercel build error on new dashboard
- [ ] Languages: Mandarin, Tagalog, Vietnamese, Portuguese
- [ ] Find Jobs — real business scraping (Google Places broken)
- [ ] Stripe payment portal — credits purchase working
- [ ] Lead marketplace — sell veteran refi leads
- [ ] Employer dashboard — $99/mo to receive leads
- [ ] Admin panel — view all lead profiles
- [ ] SMS opt-in compliance (TCPA)
- [ ] Email confirmation on signup

## 🎯 10 MISSIONS — Coach Ray Specialist Mode
1. ⭐ Veterans Hub → VA benefits, refi, home buying, tax breaks, disability
2. 🔍 Find a Job → SMS job placement, no resume needed
3. 🔧 Home Services → Plumber/handyman/electrician
4. 👴 Senior Care → In-home care, assisted living, memory care
5. 📚 Get Educated → GED/trade/college/apprenticeships
6. 🔑 Find Housing → Rentals, Section 8, emergency housing
7. 🏢 Hire Workers → Business owner staffing
8. 🚗 Buy a Vehicle → Military deals, USAA, civilian
9. 💰 Debt & Tax Relief → IRS, debt, veteran tax breaks
10. 🧹 Household Help → Cleaning, lawn, recurring services

## QUALIFYING QUESTIONS MATRIX
UNIVERSAL (all missions):
1. What do you need help with today?
2. ZIP code?
3. How urgent? (Today / This week / Planning ahead)
4. Budget range?
5. Are you a veteran? (YES = premium lead)

VETERAN SPECIFIC (16 questions):
6. Active duty / veteran / military family?
7. Branch of service?
8. Years served?
9. VA disability rating?
10. Receiving VA benefits?
11. Primary need today?
12. Annual income?
13. Own your home?
14. Last refinance date?
15. Current interest rate?
16. Home value?
17. Mortgage balance?
18. Phone number
19. Email

JOB SEEKER SPECIFIC:
6. Job type?
7. Work authorization?
8. Availability (FT/PT)?
9. Driver's license?
10. Education level?
11. Start date?
12. Veteran?
13. Pay expectation?
14. Phone

HOME SERVICES SPECIFIC:
6. Service type?
7. Describe the problem
8. Urgency?
9. Own or rent?
10. Budget?
11. Best time?
12. Phone

## LANGUAGES — 44M IMMIGRANTS
✅ English
✅ Spanish (44M)
🔜 Mandarin Chinese (5M)
🔜 Tagalog/Filipino (4M)
🔜 Vietnamese (2M)
🔜 Portuguese (1.4M)

## BUSINESS IDEAS PIPELINE
IMMEDIATE REVENUE:
1. Lead marketplace — veteran refi leads $45-150/lead → BZ connection
2. Employer dashboard — $99/mo pre-qualified candidates
3. Government contract — OC Care Coordination pilot $45K
4. Insurance cross-sell — veterans + homeowners
5. CareerForce white-label — $499/mo to staffing agencies

NEXT PHASE:
6. SMS-only mode (no app/login needed)
7. Court-mandated job placement (probation)
8. Refugee resettlement — IRC/UNHCR partner
9. Re-entry program — formerly incarcerated
10. Gig economy — Uber/DoorDash SMS onboarding

## SUBSCRIPTION MODEL
- $9.99/month per user = unlimited Coach Ray + 50 SMS credits
- 100 users = $999/mo
- 1,000 users = $9,990/mo
- 10,000 users = $99,900/mo
- 1,000,000 users = $9.99M/mo

## OC GOVERNMENT PITCH
- Target: CareCoordination@ocgov.com
- Pilot: 100 participants / 90 days / $45,000
- Full deployment: $345,599
- PDF: WorkBridge_OC_Executive_Summary_v3.pdf

## INFRASTRUCTURE NEEDED (for OC pitch)
- MBPC RTX PRO 6000 Blackwell: $42,999
- MBPC 2x RTX 5090: $23,999
- Server room setup: $15,000

## WARSHIP TRADING SYSTEM (separate project)
- EC2 LOCKED — AWS bill unpaid
- Scalper v4.1 ready at /home/ec2-user/my-warship/
- $24.99 USDC remaining in wallet B65x...D8v
- Historian bot built 200+ token snapshots
- Resume when AWS bill paid

## RULES FOR CLAUDE
- Always add new ideas to bounce back
- Test every build locally before pushing
- Never leave old code — delete and replace
- Update this file after every session
- Checklist before deploy: lint + build pass
