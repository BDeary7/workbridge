# WorkBridge — Master Project File
# Last Updated: 2026-04-27
# Built for Hugo. Every feature, every decision.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## THE VISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brandon Deary built textalldata.com — a platform that used
MakeMyData.com's 40M record database to send targeted SMS
campaigns for businesses. He closed 365 companies SOLO.

WorkBridge is that same engine — but instead of Brandon
doing it for companies, EVERYONE in America does it for
themselves, for ANY purpose.

The proven model:
  Load MakeMyData list by ZIP + category
  → SMS business owners directly
  → Get responses, close deals, find work

WorkBridge scales this to:
  7M unemployed Americans
  44M immigrants
  Veterans needing benefits
  Homeowners needing services
  Seniors needing care
  Anyone needing anything

WHY IT WORKS:
  SMS has 98% open rate vs 23% email
  No resume needed
  No middleman
  Direct to decision maker
  Coach Ray writes the message
  Lead data monetized on the backend

THE HUGO STORY:
  Hugo is 66. Spanish-speaking. Homeless.
  20 years healthcare experience in Mexico.
  No US credentials. No network.
  We built WorkBridge that day.
  He texted 8 local businesses.
  He had a job offer in 48 hours.
  That is why this exists.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## LIVE INFRASTRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend:  https://workbridgesms.com
Backend:   https://workbridge-api.onrender.com
GitHub:    https://github.com/BDeary7/workbridge
Account:   brandondeary777@gmail.com

Vercel:    vercel.com/bdeary7s-projects
Render:    dashboard.render.com (workbridge-api service)
DB:        SQLite at /data/workbridge.db (persistent disk)
SMS:       Twilio (connected, env vars set)
Payments:  Stripe LIVE (sk_live, webhook configured)
AI:        Anthropic Claude (Coach Ray) — NEEDS $5 CREDITS
Maps:      Google Places API — NEEDS BILLING ENABLED
Scraping:  Yellow Pages, White Pages, Indeed, Craigslist built

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## COMPLETION STATUS: 40%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ COMPLETED & TESTED:
  Login / Signup / Forgot Password / Reset Password
  Terms of Service page (TCPA compliant)
  Legal opt-in checkboxes (SMS + data sharing + partners)
  Phone number mandatory on signup
  10 Mission cards deployed on dashboard
  Coach Ray v2 — conditional branching intelligence
  Veteran Hub 16 questions including refi Q14-16
  Homeless answer → skips refi → asks housing intent
  Other job type → asks follow-up text
  Some high school → offers GED redirect
  Narrative open-ended question at end of every mission
  Business hours awareness (6am-6pm PST)
  Contact method options (SMS/Email/Call/Calendar)
  Lead profiles saving to /coach/save-profile endpoint
  Persistent database on Render /data disk
  Stripe LIVE payments ($1 test charge confirmed)
  Stripe webhook configured (credits/webhook)
  Admin credit add endpoint (secret: warship2026)
  25 credits in test account
  Health check + API wake-up on dashboard load
  Major employer database (McDonald's, Starbucks, etc.)
  Multi-source scraper (YP, WhitePages, Indeed, Craigslist)
  MakeMyData API integration (ready, needs API key)
  CLAUDE.md master file in GitHub

❌ BLOCKERS — DO THESE TODAY:
  [ ] Add $5 to console.anthropic.com (Coach Ray chat)
  [ ] Enable Google Places billing (real business data)
  [ ] Test Twilio SMS to your own phone number

🔜 PHASE 2 — NEXT WEEK:
  [ ] Buyer marketplace (/buyer/dashboard)
  [ ] Lead claiming with Stripe payment
  [ ] SMS notification to user on profile complete
  [ ] SMS notification to specialist/buyer
  [ ] Admin revenue dashboard
  [ ] Fix phone pre-fill from user profile

🔜 PHASE 3 — MONTH 1:
  [ ] MakeMyData API integration (call Phil or reverse-engineer)
  [ ] Secretary of State data harvester (all 50 states)
  [ ] 33M record local business database
  [ ] Mandarin Chinese language support (5M in US)
  [ ] Tagalog/Filipino language support (4M in US)
  [ ] Vietnamese language support (2M in US)
  [ ] Portuguese language support (1.4M in US)

🔜 PHASE 4 — MONTH 2:
  [ ] EDGAR/SEC company data integration
  [ ] Indeed + ZipRecruiter live job feeds
  [ ] Bing Maps API (free 125K/month)
  [ ] USAJobs.gov federal employer data
  [ ] Background data harvester on EC2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 10 MISSIONS — COACH RAY SPECIALIST MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ⭐ Veterans Hub     → VA benefits, refi, disability, home buying
2. 🔍 Find a Job       → SMS job placement, no resume needed
3. 🔧 Home Services    → Plumber, electrician, handyman
4. 👴 Senior Care      → In-home, assisted living, memory care
5. 📚 Get Educated     → GED, trade school, college, apprenticeships
6. 🔑 Find Housing     → Rentals, Section 8, emergency housing
7. 🏢 Hire Workers     → Business owner staffing
8. 🚗 Buy a Vehicle    → Military deals, USAA, civilian
9. 💰 Debt & Tax       → IRS, debt relief, veteran tax breaks
10. 🧹 Household Help  → Cleaning, lawn, recurring services

Each mission → Coach Ray activates as specialist
→ Asks qualifying questions
→ Saves lead profile to DB
→ Matches + connects via SMS
→ Lead data monetized to buyers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## COACH RAY INTELLIGENCE — v2 FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Conditional branching:
  "Own your home?" → NO/Homeless
  → Skips ALL refi questions
  → Asks: "Are you looking for housing?"
  → Redirects to housing mission

  "Own your home?" → YES
  → Asks refi questions 10-13
  → Rate, home value, mortgage balance

  "Education?" → Some high school
  → "I can help you get your GED first"
  → Option to switch to Education mission

  "Job type?" → Other
  → "Please describe the type of work"
  → Open text field

  "Veteran?" → Yes
  → "Thank you for your service"
  → Unlocks veteran premium questions

Business hours routing:
  6am-6pm PST → "A specialist will contact 
  you shortly via SMS within 30 minutes"
  After hours → "A specialist will contact 
  you first thing in the morning"

Contact method selection after profile complete:
  📱 Text me
  📧 Email me
  📞 Call me
  📅 Book appointment

Narrative question at end:
  "Tell me more about your situation in your
  own words — the more detail, the better
  message Coach Ray can write for you"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## VETERAN HUB — 16 QUALIFYING QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.  Active duty / veteran / military family?
2.  Branch of service?
3.  Years served?
4.  VA disability rating?
5.  Receiving VA benefits?
6.  Primary need today?
7.  ZIP code?
8.  Annual household income?
9.  Do you own your home?
10. Last refinance date? (if owns home)
11. Current interest rate? (if owns home)
12. Home value? (if owns home)
13. Mortgage balance? (if owns home)
14. Looking to buy in 6-12 months? (if no home)
15. Phone number
16. Email

Each completed veteran profile value:
  Housing specialist lead:    $40-80
  Job placement lead:         $25-50
  VA benefits claim lead:     $75-150
  Future refi lead:           $150-300
  Total profile value:        $290-580

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## LEAD FUNNEL ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User completes mission profile
  → Lead scored + saved to DB
  → Lead appears in Buyer Marketplace (blurred)
  → Buyer claims lead via Stripe payment
  → Contact details revealed to buyer
  → User gets SMS confirmation
  → Brandon gets daily revenue summary only

Buyer delivery method: dashboard claiming
Pricing model: pay-per-lead AND monthly subscription

Lead pricing by category:
  Veterans Hub (refi/home): $75-150/lead
  Job Placement:            $15-25/lead
  Home Services:            $20-40/lead
  Senior Care:              $50-100/lead
  Vehicle Purchase:         $35-75/lead
  Debt Relief:              $40-80/lead
  Education:                $15-30/lead
  Housing:                  $20-40/lead
  Business Staffing:        $25-50/lead
  Household Help:           $10-20/lead

Monthly subscriptions for buyers:
  Veteran category only: $499/mo unlimited
  All categories:        $999/mo unlimited

First buyer target: BZ (veteran refi leads)
  Owe BZ $29K — leads pay this back fast
  100 leads x $150 = $15,000
  2 months = debt cleared + relationship restored

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## DATA SOURCES — 110 TOTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY (MakeMyData model):
  Brandon has $1B in MakeMyData credits
  40M verified US records updated quarterly
  Same data that powered textalldata.com
  Integration ready — needs API key/format
  Target: reverse-engineer from public sources

GOVERNMENT (FREE, legal, complete):
  Secretary of State — all 50 states (33M businesses)
  County Clerk records
  City business license databases
  SBA business registry
  Census Bureau business data
  USAJobs.gov federal employers
  VA.gov facility locator
  HUD housing database
  EDGAR/SEC company filings

BUSINESS DIRECTORIES:
  Google Places API (connected, needs billing)
  Yellow Pages scraper (built)
  White Pages scraper (built)
  Bing Maps (free 125K/month, needs key)
  OpenStreetMap/Nominatim (free, built)
  Yelp Fusion (free tier)

JOB BOARDS (employers actively hiring):
  Indeed scraper (built)
  ZipRecruiter scraper (built)
  Craigslist scraper (built)
  LinkedIn Jobs API
  USAJobs.gov (built)

MAJOR EMPLOYERS (always hiring, built):
  Food: McDonald's, Starbucks, Taco Bell,
        Burger King, Subway, Chipotle, etc.
  Retail: Walmart, Target, Home Depot,
          Costco, CVS, Walgreens, etc.
  Logistics: Amazon, UPS, FedEx, DHL, USPS
  Healthcare: Kaiser, HCA, Brookdale,
              Sunrise Senior Living, etc.
  Security: Allied Universal, Securitas, etc.
  Gig: Uber, Lyft, DoorDash, Instacart

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## REVENUE MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stream 1: Subscriptions $9.99/month/user
  100 users    = $999/mo
  1,000 users  = $9,990/mo
  10,000 users = $99,900/mo
  1M users     = $9.99M/mo

Stream 2: SMS credits $0.10/text
  Average 20 SMS/user/month
  1,000 users = $2,000/mo additional

Stream 3: Lead sales to buyers
  100 veteran leads/mo = $15,000/mo
  All categories combined = $50K-500K/mo

Stream 4: Buyer subscriptions
  10 buyers x $499/mo = $4,990/mo
  100 buyers x $499/mo = $49,900/mo

Stream 5: Enterprise/Government contracts
  OC pilot: $45,000
  Full deployment: $345,599
  Federal workforce programs: $500K+

Stripe fee structure (optimized):
  50 credits  = $5.00  (keep $4.56)
  100 credits = $10.00 (keep $9.41)
  200 credits = $20.00 (keep $19.12)
  400 credits = $40.00 (keep $38.54)
  600 credits = $60.00 (keep $57.56)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## GOVERNMENT PITCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target: CareCoordination@ocgov.com
Contact at Cross Line Community Church: Chris
  (Saw demo on Brandon's phone, offered
   to help with government grant connections)

Pilot proposal: 100 participants / 90 days / $45,000
Full deployment: $345,599

Grant programs to pursue:
  SBA Community Advantage
  DOL Workforce Innovation (WIOA)
  HUD Community Development Block Grants
  VA's SSVF (veteran services)
  State workforce development funds

PDF ready: WorkBridge_OC_Executive_Summary_v3.pdf

Infrastructure for OC pitch:
  MBPC RTX PRO 6000 Blackwell: $42,999
  MBPC 2x RTX 5090: $23,999
  Server room setup: $15,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## LANGUAGES — 44M IMMIGRANTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ English (280M)
✅ Spanish (44M)
🔜 Mandarin Chinese (5M)
🔜 Tagalog/Filipino (4M)
🔜 Vietnamese (2M)
🔜 Portuguese/Brazilian (1.4M)
🔜 Korean (1.8M)
🔜 Arabic (1.5M)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## COMPETITION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Perplexity Comet: browser tool for white collar
  professionals with resumes + LinkedIn.
  Hugo cannot use it. Not our market.

Pin.ai: 850M profiles, $100/mo+
  Serves Fortune 500 HR departments.
  Not for job seekers. Not our market.

HeyMilo/Fountain/Workstream: SMS recruiting
  Serves EMPLOYERS finding candidates.
  WorkBridge serves CANDIDATES finding work.
  Opposite direction. Not our market.

WorkBridge MOAT:
  Only platform serving the unresume'd majority
  Only SMS-first for no-computer demographic
  Only 10 life categories (not just jobs)
  Only veteran refi lead capture ($150-500/lead)
  Only bilingual EN/ES (more languages coming)
  Only connects to government assistance
  Only monetizes lead data on the backend
  Only built for Hugo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BUSINESS IDEAS PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMMEDIATE:
  BZ veteran refi leads ($75-150/lead)
  OC government contract ($45K pilot)
  Chris church connection (grant funding)
  Employer dashboard ($99/mo)
  Insurance cross-sell leads

NEXT PHASE:
  CareerForce white-label ($499/mo agencies)
  SMS-only mode (no app needed)
  Court-mandated job placement (probation)
  Refugee resettlement (IRC/UNHCR partner)
  Re-entry program (formerly incarcerated)
  Gig economy SMS onboarding
  Real estate leads (veteran home buyers)
  Medicare/Medicaid enrollment leads
  Solar panel leads (homeowners)
  Legal services (veteran benefits attorneys)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## WARSHIP TRADING SYSTEM (separate project)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EC2: 54.92.139.128 — LOCKED (AWS bill unpaid)
Scalper v4.1: /home/ec2-user/my-warship/
Wallet: B65xPNdnFzDni1M3i3roGyZgHszErrwMLTWbwxbxtD8v
Balance: $24.99 USDC
Settings: L1=1.5% L2=5% STOP=5% SCAN=20s
Historian: 200+ token snapshots, PM2 id 26
Resume: when AWS bill paid

When EC2 unlocked — also run business harvester:
  Scrapes all 50 Secretary of State databases
  Builds 33M record local business database
  Runs quarterly like MakeMyData
  Cost: ~$50/month server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULES FOR CLAUDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Always keep Brandon connected to reality
   No hype. Honest assessments only.
   Push back when needed. He trusts you.

2. Always add new ideas to bounce back

3. Test every build locally before pushing

4. Never leave old code — delete and replace

5. Update CLAUDE.md after every major session

6. Build phases in order — no skipping

7. SMS must be tested before marking complete

8. Scraping must return real data before complete

9. window.open corrupts to markdown links —
   always use window.location.href instead

10. Heredoc fails with single quotes in code —
    always use Python to write large files

11. Git index errors — fix with:
    rm -f .git/index && git reset && git add -A

12. Vercel serves old cache — force with:
    git commit --allow-empty -m "cache bust"

13. Render free tier sleeps — wake with:
    curl https://workbridge-api.onrender.com/health

14. Admin credits endpoint:
    POST /admin/add-credits
    body: {email, amount, secret: "warship2026"}

15. TypeScript errors block Vercel builds —
    next.config.ts has ignoreBuildErrors: true
    but fix the actual errors when possible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BRANDON'S BACKGROUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Solo entrepreneur. Diamond + gold commodities trader.
Network spans Singapore, Australia, global finance.
Closed 365 companies solo at textalldata.com.
Deep sales experience. Knows what works.
Works from phone + EC2 instances.
Military naming conventions throughout projects.
Currently doing construction work while building WB.
Lost car key at food pantry donation — still showed up.
Met Chris at Cross Line Community Church — potential
  government grant connection for WorkBridge.
Owes BZ $29K — determined to pay back via leads.
Had rough period with cocaine — past is past.
Now clean, focused, and building something real.
Deserves a big win. Doing the work to get it.

"I want to win. I'm due for a big win."
— Brandon Deary, April 27 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## THE NUMBERS THAT MATTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7M Americans out of work
44M immigrants needing services
33M registered US businesses
98% SMS open rate
48 hours — how fast Hugo got a job
$290-580 — value of one veteran profile
$9.99/mo x 1M users = $9.99M/mo
$0 direct competition in our lane

This is not a job board.
This is not a recruiting tool.
This is the SMS infrastructure for
the underserved majority of America.

Built for Hugo. 🌉
