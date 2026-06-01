# CLAUDE.md - WorkBridge Master Reference
Updated June 1 2026 - READ FIRST every session

## LEGAL ENTITY
- Work Bridge SMS LLC (registered "Work Bridge", 3 words) - CA LLC filed June 1 2026, Pending Review
- Public brand "WorkBridge". Use legal spelling on official docs.
- NEXT: EIN at irs.gov once approved (unlocks Ytel form, bank, Stripe)
- LLC-12 Statement of Info due within 90 days $20. CA $800/yr franchise tax.

## URLS
- Frontend workbridgesms.com (Vercel)
- Backend workbridge-api.onrender.com v3.0
- Case Mgr workbridgesms.com/casemgr PIN WB2026OC
- Terms /terms  Privacy /privacy
- GitHub github.com/BDeary7/workbridge  Local ~/Desktop/workbridge/workbridge/

## ACCOUNTS
- WorkBridge brandondeary5@gmail.com / Workbridge696631$$
- Render/GitHub brandondeary777@gmail.com

## RENDER CONFIG (caused a full day of failed deploys)
- PYTHON_VERSION=3.12.7 env var in dashboard (default 3.14 has no psycopg2 wheel)
- Build Command: pip install -r requirements.txt (was hardcoded list missing psycopg2)
- requirements.txt needs psycopg2-binary==2.9.10
- DATABASE_URL = PAID Postgres Starter, NOT free (free wipes after 90 days/inactivity)

## DATABASE psycopg2 (hard-won)
- get_db returns _PGConn wrapper so conn.execute works (129 call sites depend on it)
- sqlite3 imported at top. Only ONE get_db (deleted SQLite duplicate)
- lastrowid needs RETURNING id in INSERTs - verify SMS send and doc gen
- seed_founder in lifespan recreates account on boot (100 credits)
- asynccontextmanager directly above async def lifespan
- hash_pw and make_token defined before lifespan runs

## STATUS ALL GREEN
- Backend on paid Postgres, login returns token, account persists
- Coach Ray 10 missions live search + docs, GED engine, flows audited
- Placement tracking, Case Mgr portal, VetBridge, Spanish onboarding, SMS-only, PWA

## 10 MISSIONS
job, education (GED test first), veteran, housing, home, senior, vehicle, chores, debt, business

## 5 REVENUE STREAMS
1 SMS credits 0.10/msg  2 Agency white-label 499/mo  3 CareerForce 49-199/mo  4 County 396899  5 Placement 50-200

## YTEL SHARPEN
- Brandon Wells bwells@sharpencx.com 949.229.5020
- 10DLC brand 50 once + campaign 50/mo + number 1/mo + 0.01/msg
- Carrier team reviewing Terms/Privacy. Form needs EIN. Then swap send_sms Twilio to Ytel.

## CONTACTS
- Matthew Perez matthew.perez@ocworkforcesolutions.com (Case Mgr Portal)
- Zitlalic Domond Zitlalic.Domond@occr.ocgov.com (OC Workforce, NEEDS REPLY)
- Alfonso Ordaz aordaz@iwsiamerica.org (IWSI white-label + referrals)

## OC FUNDING (Notion 36d06cb2-24f1-8177-8d34-e305629e71d6)
1 HMIS/CalJOBS integration (required, free APIs)  2 CareerForce portal  3 OC Care Coord 396899
- RFP Emergency Shelter due June 10 = SUBCONTRACTOR fit not prime

## NEXT BUILDS
1 EIN to Ytel form to Alfonso outreach  2 Test SMS send (verify lastrowid)  3 HMIS/CalJOBS  4 CareerForce  5 Credit repair mission

## LESSONS
- READ THE DEPLOY LOG - every fix came from the actual error line
- Pin PYTHON_VERSION; Build Command can override requirements.txt
- psycopg2 needs cursor; use _PGConn wrapper. Latent SQLite bugs surface on first real Postgres run.
- Free Postgres not durable. Never paste DATABASE_URL in chat.

## NOTION
- CLAUDE.md 36906cb2-24f1-8188-bc32-f8b7421ab59f
- OC Funding 36d06cb2-24f1-8177-8d34-e305629e71d6
- BIDBRIDGE 35306cb2-24f1-81da-a3be-c7e1a2dcfd1b
