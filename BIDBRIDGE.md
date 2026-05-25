# BIDBRIDGE.md — BidTrueMetric + NoMoreBidWar Complete Spec
# Updated: May 25, 2026
# Build AFTER WorkBridge Phase 1 is complete

---

## TWO DOMAINS — ONE MISSION

nomorebidwar.com  — Consumer brand. The rage. The movement.
bidtruemetric.com — Data engine. The math. The proof.

"The Carfax of Construction"

---

## ORIGIN STORY (Brandon's fuel)

Brandon worked construction for a Texas contractor.
Promised $25/hr. Mid-job: "I'm losing money."
Got stiffed. Lost his chop saw. Still building.
Plumbed a 5-story condo. Built Super Walmart, Target.
No Silicon Valley developer has this combination.
That rage is the fuel. This platform is the fix.

---

## THE PROBLEM

$45 billion in construction fraud annually.
3.7 million contractors in the US.
150 million homeowners at risk.

THREE PEOPLE WHO GET HURT EVERY DAY:

WORKER: "I was promised $42/hr. Mid-job: cut to $22. No recourse."
HOMEOWNER: "Contractor quoted $4,500 for a $12,000 job. Disappeared after demo."
LEGITIMATE CONTRACTOR: "I bid $11K fairly. Lost to a $4,500 scammer. No way to prove I'm the right choice."

---

## CORE FEATURES

### 1. UNDERCUTTER RED FLAG SYSTEM
Bid 20%+ below market = YELLOW FLAG
  "Warning: This contractor may be cutting overhead costs."
Bid 40%+ below market = RED FLAG
  "FAILED METRIC: This bid is mathematically impossible
   without cutting corners, substandard materials,
   or planning to stiff workers.
   Demand: license #, insurance cert, permit plan."
No insurance = UNSTABLE flag
No workers comp = HIGH RISK flag

### 2. BACKPACK PROTECTION — THE KILLER FEATURE
Nobody else has this. Workers protected before first tool is lifted.

Formula:
  available_margin = total_bid - (materials x 1.08)
  projected_rate = available_margin / hours
  If projected_rate < journeyman_floor_for_ZIP:
    Worker SMS: "WARNING — This job cannot mathematically
    pay your $42/hr rate. The bid is insolvent. Walk away."
    Contractor: RED STATUS
    Homeowner: HIGH RISK warning

Data source: BLS occupational employment stats by ZIP + trade

### 3. CONTRACTOR SKILL LEDGER
Bid-to-execution accuracy tracked on every job.
  Within 5% = GOLD STANDARD badge
  Consistent overruns = MARGIN DECAY flag
  Stiffed a worker = RED STATUS (permanent)

LABOR HARMONY INDEX:
  After job completes → payment verification triggered
  Worker confirms: did you receive agreed rate?
  YES = contractor score improves
  NO = contractor RED STATUS permanently

STATUS LEVELS:
  GREEN  = Certified honest. Premium rate access.
  YELLOW = Warning. Overhead risk detected.
  RED    = Failed Metric. Excluded from marketplace.

### 4. MATERIAL BUY-AHEAD LOCK
Lock commodity prices at bid time.
Copper spike after your lock? BidTrueMetric absorbs variance.
Data: USGS commodity prices (copper, lumber, steel, concrete)
Solves: Super Walmart 8-month delay problem Brandon lived.

### 5. PERMIT INTELLIGENCE (NATIONAL DATABASE)
Every build/remodel in the US requires a city/county permit.
All public record. All scrapeable.

PERMIT DATA TELLS YOU:
  - Who is building (contractor name, license #)
  - What (scope of work, trade type)
  - Where (address, ZIP)
  - How much (estimated project value)
  - When (filed date, inspection dates)

USE CASES:
  - New permit filed → auto-contact homeowner via WorkBridge SMS
  - Contractor files 40 permits at 60% below market → Red Flag auto-triggered
  - License expired but still pulling permits → Alert fires
  - Worker registers in ZIP → matched to live active projects

DATA SOURCES:
  - City open data portals (Socrata API)
  - County assessor APIs
  - State contractor license databases
  - LA: data.lacity.org/resource/6q2s-9pnn.json
  - National: permits.socrata.com

### 6. INSURANCE + LICENSE VERIFICATION
Real-time contractor license check (CSLB CA + national)
Insurance certificate validation
Workers comp verification
"This contractor is licensed, bonded, and insured" = trust badge

---

## COMPETITION — WHY WE WIN

Procore / Buildertrend / Joist:
  Passive databases. No live prices. No worker protection.
  Contractor types data manually. Legacy ships moving slowly.

Togal.AI:
  Blueprint image estimation only.
  No financial integrity checks. No Skill Ledger.

Xactimate:
  Insurance industry standard. STATIC pricing.
  $150-400/month per adjuster. We replace it with live data.

NOBODY combines:
  Live commodity prices
  + ZIP-based labor floors (BLS data)
  + Worker protection (Backpack)
  + Contractor reputation ledger
  + Permit scanning + outreach
  + Insurance/license validation
  + WorkBridge ecosystem integration

THAT COMBINATION IS THE MOAT.

---

## REVENUE MODEL

| Tier | Who | Price | What |
|---|---|---|---|
| Worker | Tradesperson | FREE | Backpack Protection alerts |
| Homeowner | Homeowner | $9.99/report | Bid verification report |
| Contractor | Licensed | $49/mo | Full Skill Ledger + leads |
| Enterprise | Insurance/GC | $499/mo | API + bulk verification |
| OC JOC | County contractors | Per bid | Compliance verification |

---

## OC JOC CONTRACT OPPORTUNITY

6 JOC contracts all due June 2, 2026 on OC procurement portal.
Every contractor bidding needs BidTrueMetric to prove legitimacy.
First B2B sales targets: OC County JOC bidders.

JOC Roofing    RFP-080-2998901-GK2
JOC HVAC       RFP-080-2995001-JM2
JOC Painting   RFP-080-2968111-DEC3
JOC Plumbing   RFP-080-2968202-DR3
JOC Electrical RFP-080-2989904-TV2
JOC Paving     RFP-080-2999501-MG2

---

## WORKBRIDGE INTEGRATION

BidTrueMetric feeds leads INTO WorkBridge:
  New permit filed in ZIP → WorkBridge SMS to homeowner
  Contractor Red Flagged → worker gets warned via WorkBridge
  Job completed + paid → placement tracked in WorkBridge

WorkBridge feeds workers INTO BidTrueMetric:
  Job seeker completes employment mission → matched to active permits
  VetBridge veteran → flagged for construction veteran preference hiring

---

## BUILD SEQUENCE

Phase 0: WorkBridge Phase 1 complete (SMS-only, placement tracking, case manager)
Phase 1: BidTrueMetric landing page + waitlist (nomorebidwar.com + bidtruemetric.com)
Phase 2: Permit scanner — connect to 5 city APIs (LA, OC, SF, NYC, Houston)
Phase 3: Backpack Protection engine — BLS data + ZIP labor floor calculator
Phase 4: Contractor Skill Ledger database
Phase 5: Material Buy-Ahead Lock — USGS commodity prices
Phase 6: Insurance/license verification API
Phase 7: Homeowner report ($9.99) — first revenue
Phase 8: Contractor subscription ($49/mo) — recurring revenue
Phase 9: OC JOC contractor outreach via WorkBridge SMS blast

---

## DOMAINS
nomorebidwar.com  — GoDaddy — landing page (emotional brand)
bidtruemetric.com — GoDaddy — data platform (technical brand)
Both need Vercel deployment and DNS wiring (previously started, Vercel token expired)

---

## FILES IN REPO
BIDBRIDGE.md — this file (466 lines original + updates)
GitHub: github.com/BDeary7/workbridge/BIDBRIDGE.md
