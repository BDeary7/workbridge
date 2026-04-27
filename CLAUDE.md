# WorkBridge — Master Project File
Last Updated: 2026-04-26

## LIVE URLS
- Frontend: https://workbridge-rho.vercel.app
- Backend: https://workbridge-api.onrender.com
- GitHub: https://github.com/BDeary7/workbridge
- Account: brandondeary777@gmail.com

## TECH STACK
- Frontend: Next.js (TypeScript) → Vercel
- Backend: FastAPI (Python) → Render
- Database: SQLite → /data/workbridge.db (persistent disk)
- SMS: Twilio (connected + env vars set)
- Payments: Stripe (connected + env vars set)
- AI: Anthropic Claude (Coach Ray) — NEEDS $5 CREDITS
- Google Places: connected — NEEDS API billing enabled

## ✅ COMPLETED & TESTED
- [x] Homepage with Hugo story, bilingual EN/ES
- [x] Login — Log In / Sign Up / Forgot Password
- [x] Persistent database on Render /data disk
- [x] Coach Ray chat via Render backend
- [x] 10 Mission cards deployed on dashboard
- [x] Coach Ray qualifying questions per mission (all 10)
- [x] Veteran Hub — all 16 questions including refi
- [x] Answers saved as lead profiles to DB
- [x] Legal opt-in checkboxes (SMS, data, partners)
- [x] Forgot password + reset endpoints
- [x] TypeScript errors fixed, Vercel deploying clean
- [x] CLAUDE.md master file in GitHub

## ❌ NEEDS FIXING NOW (blockers)
- [ ] Anthropic API credits — add $5 at console.anthropic.com
- [ ] Google Places API — enable billing for real business results
- [ ] SMS confirmation to user after profile complete (Twilio)

## 🏗️ BUILD PHASES

### PHASE 1 — DATA & SCRAPING (most critical)
Goal: Pull 20+ real businesses per ZIP/category search

Sources to integrate:
1. Google Places API (already connected — needs billing)
2. Outscraper API — Google Maps scraper ($0.001/record)
3. Yelp Fusion API (free 500 calls/day)
4. DexScreener trending (already working for crypto)
5. Yellow Pages scraper
6. Better Business Bureau directory
7. LinkedIn Jobs API (hiring businesses)
8. Indeed/ZipRecruiter job feeds
9. Angi/HomeAdvisor (home services)
10. Caring.com (senior care)
11. VA.gov facility locator
12. USAA partner dealer network
Model: Like MakeMyData.com — pull verified business
lists with phone, address, owner name, category

### PHASE 2 — LEAD FUNNEL (revenue engine)
Flow:
User completes mission → Lead saved to DB →
Lead appears in Buyer Marketplace →
Buyer claims lead → Stripe payment →
Contact details revealed → User gets SMS confirmation

Lead Pricing:
- Veterans Hub (refi/home): $75-150/lead
- Job Placement: $15-25/lead
- Home Services: $20-40/lead
- Senior Care: $50-100/lead
- Vehicle Purchase: $35-75/lead
- Debt Relief: $40-80/lead
- Education: $15-30/lead
- Housing: $20-40/lead
- Business Staffing: $25-50/lead
- Household Help: $10-20/lead

Monthly Subscriptions for buyers:
- Veteran category: $499/mo unlimited
- All categories: $999/mo unlimited

### PHASE 3 — BUYER MARKETPLACE
Pages to build:
- /buyer/signup — buyer registration
- /buyer/dashboard — see blurred leads by category
- /buyer/claim — Stripe payment → reveal contact
- /admin — revenue dashboard, lead volume, buyer stats

### PHASE 4 — SMS AUTOMATION
- User completes profile → SMS confirmation sent
- Buyer claims lead → SMS to buyer with details
- Admin gets DAILY summary only (not per lead)
- No spam — smart batching via Twilio

### PHASE 5 — LANGUAGES (44M immigrants)
✅ English
✅ Spanish
🔜 Mandarin Chinese (5M in US)
🔜 Tagalog/Filipino (4M in US)
🔜 Vietnamese (2M in US)
🔜 Portuguese/Brazilian (1.4M in US)

### PHASE 6 — ADMIN REVENUE DASHBOARD
- Total leads by category
- Revenue this week/month
- Top performing missions
- Buyer activity
- Lead quality scores

## 🎯 10 MISSIONS — Coach Ray Specialist Mode
1. ⭐ Veterans Hub → VA benefits, refi, disability, home buying
2. 🔍 Find a Job → SMS job placement, no resume
3. 🔧 Home Services → Plumber/handyman/electrician
4. 👴 Senior Care → In-home, assisted living, memory care
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
5. Veteran? (YES = premium lead)

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
18. Phone number (mandatory)
19. Email

JOB SEEKER: 10 questions
HOME SERVICES: 8 questions
SENIOR CARE: 8 questions
EDUCATION: 6 questions
HOUSING: 6 questions
BUSINESS: 7 questions
VEHICLE: 8 questions
DEBT RELIEF: 6 questions
CHORES: 5 questions

## BUSINESS IDEAS PIPELINE
IMMEDIATE REVENUE:
1. Lead marketplace — veteran refi to BZ ($75-150/lead)
2. Employer dashboard — $99/mo pre-qualified candidates
3. OC Government contract — $45K pilot
4. Insurance cross-sell — veterans + homeowners
5. CareerForce white-label — $499/mo staffing agencies

NEXT PHASE:
6. SMS-only mode (no app needed)
7. Court-mandated job placement (probation)
8. Refugee resettlement — IRC/UNHCR
9. Re-entry program — formerly incarcerated
10. Gig economy — Uber/DoorDash SMS onboarding
11. Real estate leads — veteran home buyers
12. Medicare/Medicaid enrollment
13. Solar panel leads — homeowners
14. Legal services — veterans benefits attorneys

## SUBSCRIPTION MODEL
- $9.99/month per user = unlimited Coach Ray + 50 SMS
- 100 users = $999/mo
- 1,000 users = $9,990/mo
- 10,000 users = $99,900/mo
- 1,000,000 users = $9.99M/mo

## DATA SOURCES (like MakeMyData.com)
MakeMyData model: Buy/sell targeted data lists
WorkBridge model: Scrape + enrich + sell as leads

Best scraping tools identified:
1. Outscraper — Google Maps, $0.001/record, no sub needed
2. Apify — scheduled scrapes, free tier
3. Google Places API — already connected
4. Yelp Fusion API — free 500 calls/day
5. SerpAPI — Google search results scraper
6. PhantomBuster — LinkedIn + social scraping
7. Hunter.io — email finder
8. Clearbit — company enrichment
9. USPS API — address verification
10. Twilio Lookup — phone validation

## OC GOVERNMENT PITCH
- Target: CareCoordination@ocgov.com
- Pilot: 100 participants / 90 days / $45,000
- Full deployment: $345,599
- PDF: WorkBridge_OC_Executive_Summary_v3.pdf

## INFRASTRUCTURE (for OC pitch)
- MBPC RTX PRO 6000 Blackwell: $42,999
- MBPC 2x RTX 5090: $23,999
- Server room setup: $15,000

## WARSHIP TRADING (separate)
- EC2 LOCKED — AWS bill unpaid
- Scalper v4.1 at /home/ec2-user/my-warship/
- $24.99 USDC in wallet B65x...D8v
- Resume when AWS paid

## RULES FOR CLAUDE
- Always add new ideas to bounce back
- Test every build locally before pushing
- Delete old code completely before replacing
- Update CLAUDE.md after every session
- Build phases in order — no skipping
- SMS must be tested before any phase is marked complete
- Scraping must return real data before marking complete
