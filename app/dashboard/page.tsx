'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const A='#F59E0B',G='#10B981',D='#080C12',W='#F0F4F8'

const MISSIONS = [
  {id:'veteran',icon:'⭐',label:'Veterans Hub',color:'#3B82F6',desc:'VA benefits, refi, home buying, tax breaks, disability claims',intro:'Hello! I am Coach Ray, your Veterans Specialist. I am here to make sure you get every benefit you have earned. Let me ask a few questions to get started.'},
  {id:'job',icon:'🔍',label:'Find a Job',color:'#10B981',desc:'Get hired fast via SMS — no resume needed',intro:'Hi! I am Coach Ray. I get people hired fast — no resume needed. A few quick questions and I will connect you with employers hiring RIGHT NOW.'},
  {id:'home',icon:'🔧',label:'Home Services',color:'#F97316',desc:'Plumber, electrician, handyman — fast local help',intro:'Hey! I am Coach Ray. Need something fixed at home? Tell me what is going on and I will find licensed local pros in your area fast.'},
  {id:'senior',icon:'👴',label:'Senior Care',color:'#8B5CF6',desc:'In-home care, assisted living, memory care placement',intro:'Hello, I am Coach Ray. Finding the right care for a loved one is one of the most important decisions you will make. I am here to help.'},
  {id:'education',icon:'📚',label:'Get Educated',color:'#F59E0B',desc:'GED, trade school, college, apprenticeships',intro:'Hi! I am Coach Ray. Whether you want your GED, a trade cert, or a degree — I can connect you with programs that fit your schedule and budget.'},
  {id:'housing',icon:'🔑',label:'Find Housing',color:'#06B6D4',desc:'Rentals, Section 8, emergency housing, vouchers',intro:'Hi, I am Coach Ray. Finding stable housing is everything. Let me ask a few questions to connect you with the right resources today.'},
  {id:'business',icon:'🏢',label:'Hire Workers',color:'#EC4899',desc:'Find qualified workers for your business fast',intro:'Welcome! I am Coach Ray, your staffing specialist. Tell me about your business and I will find qualified candidates in your area.'},
  {id:'vehicle',icon:'🚗',label:'Buy a Vehicle',color:'#14B8A6',desc:'Military deals, USAA financing, civilian purchases',intro:'Hi! I am Coach Ray. Military or civilian — I can connect you with dealers offering the best deals in your area.'},
  {id:'debt',icon:'💰',label:'Debt and Tax Relief',color:'#A78BFA',desc:'Tax breaks, debt relief, financial counseling',intro:'Hello, I am Coach Ray. There are programs most people do not know about that can help significantly. Let me find what you qualify for.'},
  {id:'chores',icon:'🧹',label:'Household Help',color:'#F59E0B',desc:'Cleaning, lawn care, recurring home services',intro:'Hi! I am Coach Ray. Need regular help around the house? I will find reliable local providers on your schedule and budget.'},
]

// CONDITIONAL QUESTION TREES
const getQuestions = (mission: string, answers: Record<string,string>, userPhone: string, userEmail: string, userZip: string = '') => {
  const skipPhone = !!userPhone
  const skipEmail = !!userEmail
  const skipZip = !!userZip

  const phoneQ = skipPhone ? null : {q:'Best phone number to reach you?',key:'phone',type:'text'}
  const emailQ = skipEmail ? null : {q:'Best email for follow-up?',key:'contact_email',type:'text'}
  const zipQ = skipZip ? null : {q:'What is your ZIP code?',key:'zip',type:'text'}

  if (mission === 'veteran') {
    const base = [
      {q:'Are you active duty, a veteran, or military family?',key:'military_status',options:['Active Duty','Veteran','Military Spouse/Family','Reservist/National Guard']},
      {q:'Which branch did you serve in?',key:'branch',options:['Army','Navy','Marine Corps','Air Force','Coast Guard','Space Force','National Guard']},
      {q:'What years did you serve? (e.g. 2005-2012)',key:'service_years',type:'text'},
      {q:'Do you have a VA disability rating?',key:'disability_rating',options:['No rating','10-30%','40-60%','70-90%','100% P&T','Not sure']},
      {q:'Are you currently receiving VA benefits?',key:'va_benefits',options:['Yes — full','Yes — some','No — never applied','No — was denied','In process']},
      {q:'What are you most interested in today?',key:'primary_need',options:['Home refinancing','Buying a home','VA disability claim','Tax breaks','Car purchase','Education/GED','Employment','Financial relief','All of the above']},
      ...(zipQ ? [zipQ] : []),
      {q:'Approximate annual household income?',key:'income',options:['Under $30K','$30K-$50K','$50K-$75K','$75K-$100K','Over $100K','Prefer not to say']},
      {q:'Do you own your home?',key:'home_owner',options:['Yes — I own my home','No — I rent','No — homeless or in transition','No — living with family']},
    ]

    const homeOwner = answers['home_owner']
    const refiQs = homeOwner === 'Yes — I own my home' ? [
      {q:'When did you last refinance your home?',key:'last_refi',options:['Never refinanced','Less than 1 year ago','1-2 years ago','3-5 years ago','More than 5 years ago','Currently in process']},
      {q:'What interest rate are you currently paying?',key:'current_rate',options:['Below 4%','4-5%','5-6%','6-7%','7-8%','Above 8%','I do not know']},
      {q:'Approximate home value?',key:'home_value',options:['Under $200K','$200K-$350K','$350K-$500K','$500K-$750K','Over $750K','Not sure']},
      {q:'Remaining mortgage balance?',key:'mortgage_balance',options:['Under $100K','$100K-$200K','$200K-$350K','$350K-$500K','Over $500K']},
    ] : homeOwner && homeOwner !== 'Yes — I own my home' ? [
      {q:'Are you looking to buy a home in the next 6-12 months?',key:'home_buying_intent',options:['Yes — actively looking','Yes — within 6 months','Yes — within 12 months','No — not right now','Maybe — need more info']},
    ] : []

    // VetBridge Employment Track — fires when veteran selects Employment
    const primaryNeed = answers['primary_need'] || ''
    const employmentQs = primaryNeed.includes('Employment') || primaryNeed.includes('All of the above') ? [
      {q:'What was your Military Occupational Specialty (MOS), rate, or job code? (e.g. 11B, IT, 0311, 3P0X1)',key:'mos_code',type:'text'},
      {q:'What type of civilian work are you targeting?',key:'civilian_target',options:[
        'Security / Law Enforcement','Logistics / Supply Chain','IT / Cybersecurity',
        'Healthcare / Medic','Leadership / Management','Skilled Trades','Transportation / Driving',
        'Government / Defense Contractor','Education / Training','Not sure — help me translate my MOS'
      ]},
      {q:'How long have you been out of the military?',key:'time_since_service',options:[
        'Still active duty','Less than 6 months','6-12 months','1-2 years','2-5 years','Over 5 years'
      ]},
      {q:'Do you have a current resume?',key:'has_resume',options:[
        'Yes — updated','Yes — needs updating','No — need help building one','No — do not know how'
      ]},
      {q:'Are you enrolled in VA Vocational Rehabilitation (Voc Rehab / Chapter 31)?',key:'voc_rehab',options:[
        'Yes — currently enrolled','No — but I qualify','No — not sure if I qualify','Already completed'
      ]},
      {q:'What is your target pay range?',key:'target_pay',options:[
        '$15-20/hr','$20-28/hr','$28-35/hr','$35-45/hr','$45+/hr','Salary — open to discuss'
      ]},
      {q:'Are you open to veteran-preference federal jobs?',key:'federal_interest',options:[
        'Yes — actively interested','Yes — open to it','No — prefer private sector','Not sure'
      ]},
    ] : []

    const finalQs = [
      {q:'In your own words — tell me more about your situation. The more detail you share, the better I can match you with the right specialist and write your outreach message.',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
    return [...base, ...refiQs, ...employmentQs, ...finalQs]
  }

  if (mission === 'job') {
    const jobTypeQ = {q:'What type of work are you looking for?',key:'job_type',options:['Healthcare / Caregiver','Construction / Labor','Retail / Customer Service','Food Service','Driving / Delivery','Office / Admin','Tech / IT','Education / Teaching','Security','Other — I will describe below']}
    const jobFollowUp = answers['job_type'] === 'Other — I will describe below'
      ? [{q:'Please describe the type of work you are looking for:',key:'job_type_detail',type:'text'}]
      : []

    const educationLevel = answers['education']
    const gedRedirect = educationLevel === 'Some high school — no diploma'
      ? [{q:'I can help you get your GED first — this opens up many more job opportunities. Would you like me to connect you with a free GED program in your area as well?',key:'ged_interest',options:['Yes — help me get my GED too','No — I want to find work first','Tell me more about GED programs']}]
      : []

    const base = [
      jobTypeQ,
      ...jobFollowUp,
      ...(zipQ ? [zipQ] : []),
      {q:'Are you authorized to work in the US?',key:'work_auth',options:['Yes — US Citizen','Yes — Permanent Resident','Yes — Work Visa','No']},
      {q:'What is your availability?',key:'availability',options:['Full-time only','Part-time only','Either','Weekends only','Evenings only','Flexible']},
      {q:'Do you have a valid drivers license?',key:'drivers_license',options:['Yes — clean record','Yes — some violations','No','In progress']},
      {q:'Highest level of education?',key:'education',options:['Some high school — no diploma','High school diploma / GED','Some college','Associate degree','Bachelor degree','Graduate degree','Trade certification']},
      ...educationLevel ? gedRedirect : [],
      {q:'How soon are you looking to start?',key:'start_date',options:['Immediately','Within 1 week','Within 2 weeks','Within a month','Just exploring']},
      {q:'Are you a veteran or active military?',key:'is_veteran',options:['Yes','No']},
      {q:'Hourly pay expectation?',key:'pay',options:['$15-18/hr','$18-22/hr','$22-28/hr','$28-35/hr','$35+/hr','Open to discussion']},
      {q:'In your own words — describe your work experience and what makes you a great hire. The more detail, the better message Coach Ray can write for you!',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
    return base
  }

  if (mission === 'home') {
    return [
      {q:'What type of home service do you need?',key:'service_type',options:['Plumbing','Electrical','HVAC / AC','Roofing','Painting','Flooring','Landscaping','Cleaning','Pest Control','Handyman','Other']},
      {q:'Describe the problem briefly.',key:'problem_desc',type:'text'},
      ...(zipQ ? [zipQ] : []),
      {q:'How urgent is this?',key:'urgency',options:['Emergency — need help NOW','Today','This week','Within 2 weeks','Just getting quotes']},
      {q:'Do you own or rent?',key:'own_or_rent',options:['Own','Rent — landlord approval needed','Rent — I will handle it']},
      {q:'What is your budget?',key:'budget',options:['Under $200','$200-$500','$500-$1,000','$1,000-$3,000','Over $3,000','Need estimate first']},
      {q:'Best time for a pro to come?',key:'timing',options:['Morning 8am-12pm','Afternoon 12pm-5pm','Evening 5pm-8pm','Weekend only','Flexible']},
      {q:'Any other details that would help a pro prepare?',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
  }

  if (mission === 'senior') {
    return [
      {q:'Who is the care for?',key:'care_for',options:['Myself','My parent','My spouse','Other family member']},
      {q:'What type of care is needed?',key:'care_type',options:['In-home a few hours/day','In-home full-time','Assisted living','Memory care / Dementia','Skilled nursing','Respite care','Companionship','Not sure']},
      {q:'ZIP code where care is needed?',key:'zip',type:'text'},
      {q:'How soon is care needed?',key:'urgency',options:['Immediately','Within 1 week','Within 1 month','2-3 months','Just researching']},
      {q:'Approximate age of the person?',key:'age_range',options:['60-69','70-79','80-89','90+']},
      {q:'Monthly budget for care?',key:'budget',options:['Under $1,500/mo','$1,500-$3,000/mo','$3,000-$5,000/mo','Over $5,000/mo','Have long-term care insurance','Need to understand options']},
      {q:'Is the person a veteran?',key:'is_veteran',options:['Yes','No','Not sure']},
      {q:'Tell me more about the care situation and any specific needs or concerns:',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
  }

  if (mission === 'education') {
    return [
      {q:'What educational goal are you working toward?',key:'goal',options:['GED / High School Equivalency','Trade / Vocational Certificate','Associate Degree','Bachelor Degree','Job certification','ESL — English as Second Language','Learn a skill','Not sure']},
      ...(zipQ ? [zipQ] : []),
      {q:'Preferred schedule?',key:'schedule',options:['Daytime','Evening','Weekend','Online / self-paced','Hybrid','Flexible']},
      {q:'Monthly budget for education?',key:'budget',options:['$0 — need funded options','Under $100/mo','$100-$300/mo','Over $300/mo','Have GI Bill or financial aid']},
      {q:'Are you currently working?',key:'employed',options:['Yes — full time','Yes — part time','No — looking for work','No — staying home']},
      {q:'Are you a veteran?',key:'is_veteran',options:['Yes','No']},
      {q:'Tell me about your education goals and what you hope to achieve:',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
  }

  if (mission === 'housing') {
    return [
      {q:'What type of housing help do you need?',key:'need_type',options:['Looking to rent','Emergency shelter — tonight','Have Section 8 voucher','Facing eviction — need help now','Transitional housing','Help with deposit','Sober living','Other']},
      ...(zipQ ? [zipQ] : []),
      {q:'How urgent is your housing need?',key:'urgency',options:['Tonight or tomorrow','Within 1 week','Within 1 month','Within 3 months','Planning ahead']},
      {q:'Approximate monthly income?',key:'income',options:['$0 — no income','Under $1,000/mo','$1,000-$2,000/mo','$2,000-$3,500/mo','Over $3,500/mo']},
      {q:'Are you a veteran?',key:'is_veteran',options:['Yes','No']},
      {q:'Tell me more about your housing situation:',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
  }

  if (mission === 'business') {
    return [
      {q:'What type of business do you run?',key:'biz_type',options:['Restaurant / Food','Retail','Healthcare','Construction','Cleaning','Transportation','Tech','Education','Beauty / Wellness','Other']},
      ...(zipQ ? [zipQ] : []),
      {q:'What type of worker do you need?',key:'worker_type',type:'text'},
      {q:'How many workers?',key:'count',options:['1','2-3','4-10','10+','Ongoing staffing']},
      {q:'Pay rate offering?',key:'pay_rate',options:['Minimum wage','$16-20/hr','$20-25/hr','$25-35/hr','Over $35/hr','Salary','Commission']},
      {q:'When do you need them to start?',key:'start',options:['Immediately','Within 1 week','Within 2 weeks','Next month','Building pipeline']},
      {q:'Describe the ideal candidate and any specific requirements:',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
  }

  if (mission === 'vehicle') {
    return [
      {q:'Are you active military or a veteran?',key:'military',options:['Yes — Active Duty','Yes — Veteran','Yes — Military Family','No — Civilian']},
      {q:'What type of vehicle?',key:'vehicle_type',options:['Sedan / Car','SUV / Crossover','Truck','Minivan','Electric Vehicle','Motorcycle','Commercial','Not sure']},
      {q:'New or used?',key:'new_or_used',options:['New','Used','Either — best deal','Certified Pre-Owned']},
      ...(zipQ ? [zipQ] : []),
      {q:'Budget?',key:'budget',options:['Under $15K','$15K-$25K','$25K-$40K','$40K-$60K','Over $60K','Under $300/mo','$300-$500/mo','Over $500/mo']},
      {q:'Credit score?',key:'credit',options:['Excellent 720+','Good 680-719','Fair 620-679','Poor below 620','No credit','Not sure']},
      {q:'How soon to buy?',key:'timeline',options:['This week','This month','Within 3 months','Just researching']},
      {q:'Any specific features or requirements?',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
  }

  if (mission === 'debt') {
    return [
      {q:'What type of financial help?',key:'help_type',options:['Credit card debt','Medical bills','Student loans','Tax / IRS issues','Mortgage relief','Bankruptcy consult','Veteran tax breaks','Full review']},
      ...(zipQ ? [zipQ] : []),
      {q:'Total approximate debt?',key:'total_debt',options:['Under $5K','$5K-$15K','$15K-$30K','$30K-$60K','Over $60K','Not sure']},
      {q:'Monthly income?',key:'income',options:['Under $1,500','$1,500-$3,000','$3,000-$5,000','Over $5,000','No income']},
      {q:'Are you a veteran?',key:'is_veteran',options:['Yes','No']},
      {q:'Tell me more about your financial situation:',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
  }

  if (mission === 'chores') {
    return [
      {q:'What type of help do you need?',key:'service',options:['House cleaning','Lawn mowing','Laundry','Grocery / errands','Meal prep','Window washing','Organization','Moving help','Pool cleaning','Multiple']},
      ...(zipQ ? [zipQ] : []),
      {q:'How often?',key:'frequency',options:['One-time','Weekly','Bi-weekly','Monthly','As needed']},
      {q:'Budget per visit?',key:'budget',options:['Under $50','$50-$100','$100-$200','$200-$400','Open']},
      {q:'Any preferences or special instructions?',key:'narrative',type:'textarea'},
      ...(phoneQ ? [phoneQ] : []),
      ...(emailQ ? [emailQ] : []),
    ]
  }

  return []
}

const getBusinessHoursMessage = () => {
  const now = new Date()
  const pst = new Date(now.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'}))
  const hour = pst.getHours()
  const day = pst.getDay()
  const isWeekend = day === 0 || day === 6
  const isBusinessHours = hour >= 6 && hour < 18 && !isWeekend
  return isBusinessHours
    ? 'A specialist will contact you shortly via SMS — usually within 30 minutes during business hours.'
    : 'A specialist will contact you first thing during business hours (Mon-Fri 6am-6pm PST).'
}


const getMissionHelp = (mission: string, answers: Record<string,string>): string => {
  const zip = answers.zip || ''
  const narrative = answers.narrative || ''
  
  if (mission === 'education') {
    const goal = answers.goal || 'GED'
    const budget = answers.budget || ''
    const deadlineMatch = narrative.match(/june|july|august|september|by\s+\w+|deadline|scholarship/i)
    if (deadlineMatch) {
      return `I can see you have an urgent deadline. Let me help you prepare RIGHT NOW. Tell me: which subject feels hardest — Math, Science, Social Studies, or Language Arts? I will create a focused 30-day study plan for you immediately.`
    }
    return `Let me start helping you now. For your ${goal} goal, tell me which subject feels hardest — Math, Science, Social Studies, or Language Arts? I will quiz you and build a study plan around your schedule.`
  }
  if (mission === 'job') {
    const jobType = answers.job_type || 'the position'
    return `Let me write your outreach message right now. Based on your profile, here is a strong opening: "Hi, my name is ${uname}. I am experienced in ${jobType} and available to start immediately. Do you have any openings?" Want me to personalize this further?`
  }
  if (mission === 'veteran') {
    const mos = answers['mos_code'] || ''
    const civilianTarget = answers['civilian_target'] || ''
    const hasResume = answers['has_resume'] || ''
    const vocRehab = answers['voc_rehab'] || ''
    const primaryNeed = answers['primary_need'] || ''
    
    if (primaryNeed.includes('Employment') || primaryNeed.includes('All of the above')) {
      let msg = `VetBridge Employment Plan for ${uname}:\n\n`
      if (mos) msg += `🎖️ MOS ${mos} translates to civilian roles in ${civilianTarget || 'multiple fields'}. I am searching veteran-friendly employers near ${zip} now.\n\n`
      if (hasResume?.includes('No')) msg += `📄 No resume — I will help you build a military-to-civilian resume using your DD-214 experience. Tell me your top 3 duty assignments.\n\n`
      if (vocRehab?.includes('qualify')) msg += `💰 You may qualify for VA Voc Rehab (Chapter 31) — up to $2,800/month while you train or job search. I can connect you with a VA counselor.\n\n`
      msg += `🏛️ Federal jobs with veteran preference are available in your area — 10-point preference if you have a disability rating.\n\nWhich would you like to tackle first?`
      return msg
    }
    return `Based on your answers, here are your top 3 priorities: 1) File your VA disability claim if you have not — even 10% rating = $165/month tax-free. 2) Check your VA home loan eligibility — zero down payment. 3) Review your education benefits under the GI Bill. Which would you like to tackle first?`
  }
  if (mission === 'housing') {
    return `For your ZIP code ${zip}, here are immediate resources: 211 (dial or text) connects you to emergency housing tonight. The VA has SSVF grants for veterans facing homelessness. HUD.gov/find-shelter has same-day options. Which is most urgent right now?`
  }
  if (mission === 'debt') {
    return `Based on your situation, you may qualify for: IRS Fresh Start program (reduces tax debt), NFCC free credit counseling, and veteran-specific debt forgiveness programs. Which type of debt is most pressing right now?`
  }
  return `I am here to help you right now — not just later. What is the most urgent thing I can assist you with today?`
}


const SEED_STATEMENT = "Imagine having a personal assistant who knows every healthcare provider, contractor, financial advisor, employer, educator, and service professional in the country — 33 million resources in every ZIP code across 50 states — and can text them all on your behalf in seconds, connecting at a rate of 98% success. That is WorkBridge. Your entire support system, at your fingertips."

export default function Dashboard(){
  const router = useRouter()
  const [view, setView] = useState<string>('missions')
  const [activeMissions, setActiveMissions] = useState<string[]>([])
  const [showAddMission, setShowAddMission] = useState<boolean>(false)
  const [glowing, setGlowing] = useState<boolean>(false)
  const [mission, setMission] = useState<string|null>(null)
  const [uname, setUname] = useState<string>('')
  const [userPhone, setUserPhone] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userZip, setUserZip] = useState<string>('')
  const [credits, setCredits] = useState<number>(0)
  const [buyLoading, setBuyLoading] = useState<number|null>(null)
  const [buyError, setBuyError] = useState<string>('')
  const [waking, setWaking] = useState<boolean>(true)
  const [ready, setReady] = useState<boolean>(false)
  const [hist, setHist] = useState<any[]>([])
  const [activeThread, setActiveThread] = useState<number|null>(null)
  const [threadReply, setThreadReply] = useState<string>('')
  const [appts, setAppts] = useState<any[]>([])
  const [msgs, setMsgs] = useState<any[]>([])
  const [inp, setInp] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [qi, setQi] = useState<number>(-1)
  const [ans, setAns] = useState<Record<string,string>>({})
  const [done, setDone] = useState<boolean>(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [showContactOptions, setShowContactOptions] = useState<boolean>(false)
  const [outreachMessage, setOutreachMessage] = useState<string>('')
  const [waitingForNarrative, setWaitingForNarrative] = useState(false)
  const [sending, setSending] = useState<boolean>(false)
  const [gedMode, setGedMode] = useState<boolean>(false)
  const [gedSubject, setGedSubject] = useState<string>('')
  const [gedQuestions, setGedQuestions] = useState<any[]>([])
  const [gedAnswers, setGedAnswers] = useState<Record<number,string>>({})
  const [gedQi, setGedQi] = useState<number>(0)
  const [gedResults, setGedResults] = useState<any>(null)
  const [gedProgress, setGedProgress] = useState<any>(null)
  const [searchZip, setSearchZip] = useState<string>('')
  const [searchZipSaved, setSearchZipSaved] = useState(false)
  const [gedLoading, setGedLoading] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement>(null)
  const tok = () => typeof window !== 'undefined' ? localStorage.getItem('wb_token') : null

  useEffect(()=>{(async()=>{
    const token = tok()
    if(!token){router.push('/login');return}
    setUname(localStorage.getItem('wb_name')||'there')
    const savedMissions = localStorage.getItem('wb_missions')
    if(savedMissions){
      try{ 
        const parsed = JSON.parse(savedMissions)
        if(Array.isArray(parsed) && parsed.length > 0){
          setActiveMissions(parsed)
        }
      }catch(e){console.error('ZIP update error:',e);alert('Error updating ZIP: '+e.message)}
    } else {
      // Fetch from API for existing users who predate onboarding
      try{
        const t = localStorage.getItem('wb_token')
        if(t){
          const res = await fetch(`${API}/user/missions`,{
            headers:{Authorization:`Bearer ${t}`}
          })
          const d = await res.json()
          if(d.missions && d.missions.length > 0){
            setActiveMissions(d.missions)
            localStorage.setItem('wb_missions', JSON.stringify(d.missions))
          }
        }
      }catch(e){console.error('ZIP update error:',e);alert('Error updating ZIP: '+e.message)}
    }
    // Trigger glow on load
    setTimeout(()=>{setGlowing(true); setTimeout(()=>setGlowing(false),3000)},500)
    setUserPhone(localStorage.getItem('wb_phone')||'')
    setUserEmail(localStorage.getItem('wb_email')||'')
    setUserZip(localStorage.getItem('wb_zip')||'')
    initApp(token)
  })();
  },[])

  useEffect(()=>{ref.current?.scrollIntoView({behavior:'smooth'})},[msgs])

  const initApp = async(t:string)=>{
    setWaking(true)
    for(let i=0;i<3;i++){
      try{const r=await fetch(`${API}/health`,{signal:AbortSignal.timeout(10000)});if(r.ok){setReady(true);break}}
      catch{await new Promise(r=>setTimeout(r,2000))}
    }
    try{
      const[b,h,a]=await Promise.all([
        fetch(`${API}/credits/balance`,{headers:{Authorization:`Bearer ${t}`}}),
        fetch(`${API}/sms/history`,{headers:{Authorization:`Bearer ${t}`}}),
        fetch(`${API}/appointments`,{headers:{Authorization:`Bearer ${t}`}}),
      ])
      const bal = await b.json(); setCredits(bal.credits||0)
      const ph = bal.phone||''; const em = bal.email||''
      if(ph){setUserPhone(ph);localStorage.setItem('wb_phone',ph)}
      if(em){setUserEmail(em);localStorage.setItem('wb_email',em)}
      setHist((await h.json()).history||[])
      setAppts((await a.json()).appointments||[])
    }catch(e){console.error('ZIP update error:',e);alert('Error updating ZIP: '+e.message)}
    setWaking(false)
  }

  const startMission = (id:string)=>{
    const m = MISSIONS.find(x=>x.id===id)
    if(!m)return
    setMission(id);setQi(0);setAns({});setDone(false);setShowContactOptions(false)
    const qs = getQuestions(id, {}, userPhone, userEmail, userZip)
    setQuestions(qs)
    const q0 = qs[0]
    setMsgs([
      {r:'a',c:m.intro},
      {r:'a',c:q0?.q||'How can I help?',o:q0?.options,type:q0?.type}
    ])
    setView('coach')
  }

  const advance = (value:string)=>{
    const cur = questions[qi]
    if(!cur)return
    const na = {...ans,[cur.key]:value}
    setAns(na)
    setMsgs(m=>[...m,{r:'u',c:value}])

    // Conditional routing
    let newQuestions = getQuestions(mission||'', na, userPhone, userEmail, userZip)
    setQuestions(newQuestions)

    const ni = qi+1
    if(ni<newQuestions.length){
      setQi(ni)
      const nextQ = newQuestions[ni]

      // Smart adaptive responses
      let prefix = ''
      if(cur.key==='home_owner' && value.includes('homeless')){
        prefix = 'I understand — housing stability is the foundation of everything else. I will make sure we address this. '
      }
      if(cur.key==='education' && value.includes('Some high school')){
        prefix = 'A GED can significantly increase your earning potential and job opportunities. I will help you with that too. '
      }
      if(cur.key==='job_type' && value.includes('Other')){
        prefix = 'No problem — '
      }
      if(cur.key==='is_veteran' && value==='Yes'){
        prefix = 'Thank you for your service. As a veteran you may qualify for additional benefits. '
      }

      setTimeout(()=>setMsgs(m=>[...m,{r:'a',c:prefix+nextQ.q,o:nextQ.options,type:nextQ.type}]),400)
    } else {
      setQi(-1);setDone(true)
      const label = MISSIONS.find(x=>x.id===mission)?.label
      const hoursMsg = getBusinessHoursMessage()

      // Missions that HELP DIRECTLY (never blast businesses)
      const HELP_DIRECT = ['education','debt','housing','veteran']
      if (HELP_DIRECT.includes(mission||'')) {
        const directMission = mission
        const directAnswers = {...na}
        saveProfile(na, mission||'')
        setTimeout(()=>{
          if (directMission === 'education') {
            setMsgs(m=>[...m,{r:'a',c:`Perfect ${uname}! Your profile is saved.\n\n🎓 Before I build your study plan, let me see where you stand. Coach Ray uses a baseline GED Mock Test to find your exact weak spots — no wasted study time.\n\n📝 4 Subjects · 10 Questions Each · Scored Instantly\n\nWhich subject do you want to test FIRST?`}])
            setGedMode(true); setGedSubject(''); loadGedProgress()
          } else if (directMission === 'debt') {
            setMsgs(m=>[...m,{r:'a',c:`Perfect ${uname}! Your profile is saved.\n\n💳 I am pulling debt relief resources for ${directAnswers.state||'your state'} right now:\n\n🏛️ IRS Fresh Start — tax debt reduction\n📋 NFCC certified counselors — FREE in your area\n⚖️ Debt Management Plans — lower interest rates\n\nWhat type of debt is most urgent — credit cards, medical, tax, student loans, or collections? I will draft your hardship letter and find counselors near you.`}])
          } else if (directMission === 'housing') {
            setMsgs(m=>[...m,{r:'a',c:`Perfect ${uname}! Your profile is saved.\n\n🏠 I am pulling housing resources near ${directAnswers.zip_code||'your ZIP'} right now:\n\n📞 211 — same-day emergency shelter referrals\n🏢 Section 8 / HCV voucher office in your county\n🤝 Transitional housing + sober living\n💰 Emergency rental assistance (ERAP)\n\nIs this for tonight (emergency) or longer-term stable housing? I will find the right options and help you apply.`}])
          } else if (directMission === 'veteran') {
            setMsgs(m=>[...m,{r:'a',c:`Perfect ${uname}! Your profile is saved. 🎖️ Thank you for your service.\n\nHere is what Coach Ray is checking for you:\n\n1. 🩺 VA Disability Claim status\n2. 🎓 GI Bill / Voc Rehab (Ch. 31)\n3. 🏠 VA Home Loan eligibility\n4. 💼 Veteran-preference federal jobs (USAJOBS)\n\nWhat is your MOS / job code? I will translate it to civilian roles and pull your benefits.`}])
          }
        }, 600)
        return
      }

      setTimeout(()=>{
        // Generate outreach message and show preview (BLAST missions only)
    const currentAnswers = {...na}
    const currentMission = mission
    setMsgs(m=>[...m,{r:'a',c:`Perfect ${uname}! Your ${label} profile is complete and saved.\n\n${hoursMsg}\n\nI am writing your outreach message now...`}])
    
    // Fetch AI-generated message
    setTimeout(async()=>{
      // VetBridge — auto-translate MOS when veteran selects employment
      const currentMission2 = mission
      if (currentMission2 === 'veteran' && (na['primary_need']?.includes('Employment') || na['primary_need']?.includes('All'))) {
        try {
          const t = tok()
          const translateRes = await fetch(`${API}/coach/veteran-translate`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', Authorization: `Bearer ${t}`},
            body: JSON.stringify({mos_code: na['mos_code']||'', branch: na['branch']||'', narrative: na['narrative']||''})
          })
          const translateData = await translateRes.json()
          if (translateData.civilian_translation) {
            const resLines = (translateData.resources||[]).slice(0,3).map((r:any)=>' • '+r.name+' — '+r.desc).join('\n')
            const mosMsg = '🎖️ MOS Translation for '+(na['mos_code']?.toUpperCase()||'your service')+':\n\n'+translateData.civilian_translation+'\n\n📌 Key Resources:\n'+resLines
            setMsgs(m=>[...m,{r:'a',c:mosMsg}])
          }
        } catch {}
      }
      try{
        const t = tok()
        const msgRes = await fetch(`${API}/coach/generate-message`,{
          method:'POST',
          headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
          body:JSON.stringify({mission:currentMission, answers:currentAnswers, name:uname})
        })
        const msgData = await msgRes.json()
        const outreachMsg = msgData.message || `Hi, my name is ${uname}. I am looking for work in ${currentAnswers.category||currentMission} and am available immediately. Do you have any openings?`
        
        setOutreachMessage(outreachMsg)
        setMsgs(m=>[...m,{r:'a',c:`Here is your outreach message that I will send to local businesses on your behalf:\n\n"${outreachMsg}"\n\nYou will be contacted via SMS, email, or phone based on how businesses respond. I will manage all replies and notify you when someone is interested.\n\nReady to send to businesses in ${currentAnswers.zip_code||'your area'}? Coach Ray will text them in English and manage all replies for you.`,showSend:true}])
      }catch{
        setMsgs(m=>[...m,{r:'a',c:`Your profile is saved! I will start reaching out to businesses in your area now. You will receive responses directly via SMS.`}])
      }
    },1500)
      // Auto-send to Coach Ray for immediate help after contact selection
        setShowContactOptions(true)
        saveProfile(na, mission||'')
      },400)
    }
  }

  const handleContact = (method:string)=>{
    setShowContactOptions(false)
    const messages:Record<string,string> = {
      sms: '📱 Done! A specialist will text you shortly at '+( ans.phone||userPhone)+'. Keep an eye on your messages!',
      email: '📧 Done! Resources and specialist contact info will be emailed to '+(ans.contact_email||userEmail)+' shortly!',
      call: '📞 A specialist will call you shortly. Make sure your phone is on!',
      calendar: '📅 Opening calendar scheduling... A specialist will confirm your appointment via SMS.',
    }
    const snapAnswers = {...ans}
    const snapMission = mission
    setMsgs(m=>[...m,{r:'u',c:`Contact me via ${method}`},{r:'a',c:messages[method]||'A specialist will reach out shortly!'}])
    setTimeout(async()=>{
      const narrative = (snapAnswers.narrative||'').toLowerCase()
      const hasDeadline = /june|july|august|september|deadline|scholarship|asap|urgent|by\s+\w+/.test(narrative)
      let helpMsg = ''
      if(snapMission==='education'){
        helpMsg = `🎓 Before I build your study plan, let me see where you stand first!\n\nCoach Ray uses a baseline GED Mock Test to find your exact weak spots — no wasted study time.\n\n📝 4 Subjects · 10 Questions Each · Scored Instantly\n\nWhich subject do you want to test FIRST?`
        setGedMode(true)
        setGedSubject('')
      } else if(snapMission==='job'){
        helpMsg = `✅ Profile saved! Now let me write your outreach message.\n\nI am searching for employers hiring near ${snapAnswers.zip_code||'your area'} right now and will draft your personalized SMS.\n\nWhat is the main type of work you are looking for? I will craft something strong you can send today.`

      } else if(snapMission==='veteran'){
        helpMsg = `🎖️ Thank you for your service. Let me pull your benefits right now.\n\nHere is what I am checking for you:\n\n1. 🩺 VA Disability Claim — do you have a rating on file?\n2. 🎓 GI Bill / Voc Rehab (Ch. 31) — education + training benefits\n3. 🏠 VA Home Loan — zero down payment eligibility\n4. 💼 Veteran-preference federal jobs on USAJOBS\n\nWhat is your MOS / job code from service? I will translate it to civilian jobs and start your outreach immediately.`

      } else if(snapMission==='housing'){
        helpMsg = `🏠 I am searching for housing resources near ${snapAnswers.zip_code||'your ZIP'} right now.\n\nHere is what Coach Ray is pulling for you:\n\n📞 Text 211 — same-day emergency shelter referrals\n🏢 Section 8 / HCV voucher office in your county\n🤝 Transitional housing + sober living options\n💰 Emergency rental assistance (ERAP funds)\n\nIs this for tonight (emergency) or longer-term stable housing? I will tailor the outreach message Coach Ray sends on your behalf.`

      } else if(snapMission==='home'){
        helpMsg = `🔧 Got it. Before I connect you with a contractor, Coach Ray verifies credentials first — no unlicensed workers.\n\nHere is what I am checking:\n✅ CSLB license status (California contractors)\n✅ BBB rating + complaints\n✅ Insurance verification\n\nDescribe the problem in detail — is it plumbing, electrical, roofing, HVAC, or general repair? I will match you with the right licensed pro and draft your service request.`

      } else if(snapMission==='debt'){
        helpMsg = `💳 I am pulling debt relief resources for ${snapAnswers.state||'your state'} right now.\n\nCoach Ray is checking:\n\n🏛️ IRS Fresh Start — tax debt reduction program\n📋 NFCC certified counselors — FREE in your area\n⚖️ Debt Management Plans — reduce interest rates\n🎖️ Veteran debt forgiveness programs\n\nWhat type of debt is most urgent? (credit cards / medical / tax / student loans / collections) I will draft your hardship letter today.`

      } else if(snapMission==='senior'){
        helpMsg = `👴 I am searching for senior care options near ${snapAnswers.zip_code||'your area'} right now.\n\nCoach Ray is pulling:\n\n🏡 Licensed assisted living facilities\n🧠 Memory care / dementia specialist facilities\n🏠 In-home care agencies + cost estimates\n💊 Adult day programs + respite care\n💰 Medi-Cal / Medicare coverage options\n\nIs this for a parent, spouse, or yourself? And is in-home care preferred or a facility? I will draft the inquiry letters and send them today.`

      } else if(snapMission==='vehicle'){
        helpMsg = `🚗 I am searching for vehicle options near ${snapAnswers.zip_code||'your area'} right now.\n\nCoach Ray is checking:\n\n⭐ USAA car buying program (military/veterans — best pricing)\n🏪 CarMax / AutoNation — no-haggle certified pre-owned\n💳 Buy-here-pay-here dealers for credit challenges\n📊 Fair market value for your target vehicle\n\nWhat type of vehicle are you looking for and what is your budget range? I will find options and draft your inquiry messages.`

      } else if(snapMission==='chores'){
        helpMsg = `🧹 I am finding vetted home service providers near ${snapAnswers.zip_code||'your area'} right now.\n\nCoach Ray is pulling:\n\n✅ Background-checked cleaning services\n🌿 Licensed lawn care + landscaping\n🔨 Handyman services for small repairs\n📦 Moving + hauling help\n\nWhat services do you need most urgently? I will compare pricing, check reviews, and draft your booking request today.`

      } else if(snapMission==='business'){
        helpMsg = `💼 I am pulling qualified candidates from the WorkBridge job seeker pool right now.\n\nHere is what Coach Ray is doing for you:\n\n👥 Matching candidates to your job requirements\n📋 Screening based on skills + availability\n📱 Drafting your job posting SMS for rapid outreach\n📅 Setting up interview batch scheduling\n\nWhat position do you need to fill and when do you need someone to start? I will send outreach to matched candidates today.`

      } else {
        helpMsg = `I am pulling resources for your area right now. What is the single most urgent thing I can help you with today?`
      }
      if(helpMsg){
        setMsgs(m=>[...m,{r:'a',c:helpMsg}])
      }
    }, 1500)

  }

  const saveProfile = async(data:Record<string,string>, mis:string)=>{
    const t = tok()
    try{
      await fetch(`${API}/coach/save-profile`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${t||''}`},
        body:JSON.stringify({
          mission: mis,
          answers: {...data, phone: data.phone||userPhone, email: data.contact_email||userEmail},
          timestamp: new Date().toISOString()
        })
      })
    }catch(e){console.error('ZIP update error:',e);alert('Error updating ZIP: '+e.message)}
  }

  const buyCredits = async(amount:number)=>{
    const t = tok()
    if(!t){router.push('/login');return}
    setBuyLoading(amount)
    setBuyError('')
    try{
      const res = await fetch(`${API}/credits/purchase`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
        body:JSON.stringify({credits:amount})
      })
      const d = await res.json()
      console.log('Stripe response:', d)
      if(d.checkout_url){
        console.log('Redirecting to:', d.checkout_url)
        window.location.href = d.checkout_url
      } else if(d.message){
        setBuyError(d.message)
      } else {
        setBuyError('Payment setup error — check Stripe keys on Render')
      }
    }catch(e:any){
      setBuyError('Connection error: '+e.message)
    }
    setBuyLoading(null)
  }

  // ── GED TUTORING ENGINE ──────────────────────────────────────────────────
  const GED_SUBJECTS = [
    {id:'math', label:'📐 Math', desc:'Algebra, Geometry, Statistics'},
    {id:'rla', label:'📖 Language Arts', desc:'Grammar, Reading, Writing'},
    {id:'science', label:'🔬 Science', desc:'Biology, Chemistry, Physics'},
    {id:'social_studies', label:'🌎 Social Studies', desc:'History, Civics, Economics'},
  ]

  const loadGedProgress = async()=>{
    try {
      const t = tok()
      if(!t) return
      const res = await fetch(`${API}/coach/ged-progress`,{headers:{Authorization:`Bearer ${t}`}})
      const data = await res.json()
      if(data.progress && Object.keys(data.progress).length > 0){
        setGedProgress(data)
      }
    } catch(e){console.error('ZIP update error:',e);alert('Error updating ZIP: '+e.message)}
  }

  const startGedTest = async(subject:string)=>{
    setGedLoading(true)
    setGedSubject(subject)
    setGedAnswers({})
    setGedQi(0)
    setGedResults(null)
    try {
      const t = tok()
      const res = await fetch(`${API}/coach/ged-test/${subject}`,{headers:{Authorization:`Bearer ${t}`}})
      const data = await res.json()
      setGedQuestions(data.questions||[])
      setMsgs(m=>[...m,{r:'a',c:`📝 Starting ${subject.toUpperCase()} Mock Test — ${data.total} questions. Take your time. No pressure!`}])
    } catch(e) {
      setMsgs(m=>[...m,{r:'a',c:'Could not load test. Please try again.'}])
    }
    setGedLoading(false)
  }

  const submitGedAnswer = (answerIdx:number, answer:string)=>{
    const newAnswers = {...gedAnswers, [answerIdx]: answer}
    setGedAnswers(newAnswers)
    if(answerIdx < gedQuestions.length - 1){
      setGedQi(answerIdx + 1)
    } else {
      // All answered — submit for scoring
      scoreGedTest(newAnswers)
    }
  }

  const scoreGedTest = async(answers:Record<number,string>)=>{
    setGedLoading(true)
    try {
      const t = tok()
      const res = await fetch(`${API}/coach/ged-score`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
        body:JSON.stringify({subject:gedSubject, answers})
      })
      const data = await res.json()
      setGedResults(data)
      const emoji = data.percentage >= 75 ? '🎉' : data.percentage >= 60 ? '📈' : '📚'
      setMsgs(m=>[...m,{r:'a',c:`${emoji} ${gedSubject.toUpperCase()} Score: ${data.percentage}% (${data.score}/${data.total})

${data.status}

${data.weak_concepts.length>0 ? '⚠️ Weak areas: '+data.weak_concepts.join(', ') : '✅ Strong across all concepts!'}`}])
      if(data.tutoring_plan){
        setMsgs(m=>[...m,{r:'a',c:'📚 Coach Ray Tutoring Plan:\n\n'+data.tutoring_plan}])
      }
    } catch(e) {
      setMsgs(m=>[...m,{r:'a',c:'Scoring error — please try again.'}])
    }
    setGedLoading(false)
    setGedQuestions([])
  }

  const sendOutreach = async()=>{
    if(!outreachMessage||sending)return
    setSending(true)
    const t = tok()
    const lang = localStorage.getItem('wb_lang')||'en'
    setMsgs(m=>[...m,{r:'a',c:lang==='es'?'📤 Buscando empresas y enviando tu mensaje ahora...':'📤 Finding local businesses and firing off your messages now...'}])
    try{
      const res = await fetch(`${API}/coach/mission-search`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
        body:JSON.stringify({
          mission: activeMission||'job',
          answers: ans,
          zip_code: ans.zip_code||'90001',
          category: ans.job_type||ans.category||'general',
          position: ans.job_type||ans.position||'',
          language: lang
        })
      })
      const d = await res.json()
      const sent = d.messages_sent||0
      const found = d.businesses_found||0
      const confirm = d.user_confirmation||''
      const successMsg = lang==='es'
        ? (confirm || `✅ ¡Mensajes enviados a ${sent} empresas! Revisa tu portal para respuestas.`)
        : `✅ Sent to ${sent} of ${found} businesses! I will notify you the moment someone replies.`
      setMsgs(m=>[...m,{r:'a',c:successMsg},{r:'a',c:'',showPortal:true}])
    }catch{
      setMsgs(m=>[...m,{r:'a',c:lang==='es'?'Mensajes en cola. ¡Revisa tu portal!':'Messages queued! Check your Portal for replies.',showPortal:true}])
    }
    setSending(false)
    setOutreachMessage('')
  }

  const sendChat = async()=>{
    const text = inp.trim()
    if(!text||loading)return

    // NARRATIVE_INTERCEPT: capture free-text narrative answer
    if(waitingForNarrative){
      setWaitingForNarrative(false)
      const narrative = text.trim()
      setInp('')
      setLoading(true)
      const allAnswers = {...currentAnswers, narrative}
      setMsgs(m=>[...m,{r:'u',c:narrative}])
      try{
        const res = await fetch(`${API}/coach/generate-message`,{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':`Bearer ${tok()}`},
          body:JSON.stringify({
            generate_outreach: true,
            answers: allAnswers,
            language: localStorage.getItem('wb_lang')||'en'
          })
        })
        const d = await res.json()
        const outreachMsg = d.message || d.reply || ''
        if(outreachMsg){
          setOutreachMessage(outreachMsg)
          const lang = localStorage.getItem('wb_lang')||'en'
          const preview = lang==='es'
            ? `Aquí está tu mensaje de trabajo que enviaré a empleadores locales:

"${outreachMsg}"

Te contactarán por SMS, email o teléfono. ¿Listo para enviar?`
            : `Here is your outreach message I will send to local employers on your behalf:

"${outreachMsg}"

Employers will contact you by SMS, email, or phone when interested.

Ready to send to businesses in ${allAnswers.zip_code||'your area'}?`
          setMsgs(m=>[...m,{r:'a',c:preview,showSend:true}])
        } else {
          setMsgs(m=>[...m,{r:'a',c:'I had trouble writing your message — let me try again. Tell me a bit more about your experience!'}])
          setWaitingForNarrative(true)
        }
      }catch{
        setMsgs(m=>[...m,{r:'a',c:'Connection issue — please try again!'}])
        setWaitingForNarrative(true)
      }
      setLoading(false)
      return
    }
    if(qi>=0&&!done){advance(text);setInp('');return}
    setInp('')
    setMsgs(m=>[...m,{r:'u',c:text}])
    setLoading(true)
    try{
      const res = await fetch(`${API}/coach/chat`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          messages:[...msgs.filter(m=>!m.o),{r:'u',c:text}].map(m=>({role:m.r==='a'?'assistant':'user',content:m.c})),
          language:localStorage.getItem('wb_lang')||'en'
        })
      })
      const d = await res.json()
      setMsgs(m=>[...m,{r:'a',c:d.reply||'Coach Ray is connecting... please try again.'}])
    }catch{setMsgs(m=>[...m,{r:'a',c:'Connection issue — try again!'}])}
    setLoading(false)
  }

  const logout = ()=>{localStorage.clear();router.push('/')}

  const TABS=[
    {id:'missions',lb:'🎯 My Missions'},
    {id:'coach',lb:'🤖 Coach Ray'},
    {id:'messages',lb:'📬 SMS History'},
    {id:'appointments',lb:'📅 Appointments'},
    {id:'credits',lb:'💳 Credits'},
  ]

  return(
    <div style={{fontFamily:'system-ui,sans-serif',background:D,color:W,minHeight:'100vh'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}.b:hover{opacity:.88;cursor:pointer}input,textarea{outline:none;color:#FFFFFF !important;}input::placeholder,textarea::placeholder{color:rgba(240,244,248,.6) !important;}.mc:hover{transform:translateY(-2px);transition:all .2s}textarea{resize:vertical;font-family:system-ui}`}</style>

      <nav style={{padding:'0 24px',background:'rgba(8,12,18,.97)',borderBottom:'1px solid rgba(255,255,255,.08)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',height:64}}>
          <div style={{fontSize:20,fontWeight:900,cursor:'pointer'}} onClick={()=>router.push('/')}>Work<span style={{color:A}}>Bridge</span></div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            {waking&&<span style={{fontSize:12,color:'rgba(240,244,248,.4)'}}>⏳ Connecting...</span>}
            {ready&&!waking&&<span style={{fontSize:12,color:G}}>● Live</span>}
            <span style={{fontSize:13}}>👋 {uname} · <span style={{color:A,fontWeight:700}}>{credits} credits</span></span>
            <button onClick={logout} className="b" style={{padding:'7px 16px',borderRadius:100,border:'1px solid rgba(255,255,255,.15)',background:'transparent',color:'rgba(240,244,248,.6)',fontSize:13,cursor:'pointer'}}>Log Out</button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'28px 24px'}}>
        <div style={{display:'flex',gap:8,marginBottom:28,flexWrap:'wrap'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setView(t.id)} className="b"
              style={{padding:'10px 20px',borderRadius:100,border:'none',fontWeight:700,fontSize:13,cursor:'pointer',
                background:view===t.id?`linear-gradient(135deg,${A},#D97706)`:'rgba(255,255,255,.06)',
                color:view===t.id?D:W}}>
              {t.lb}
            </button>
          ))}
        </div>

        {view==='missions'&&(
          <div>
            <h2 style={{fontSize:26,fontWeight:900,marginBottom:6}}>What can Coach Ray help you with?</h2>
            <p style={{color:'rgba(240,244,248,.85)',fontSize:14,marginBottom:28}}>{activeMissions.length > 0 ? `${activeMissions.length} mission${activeMissions.length>1?'s':''} active — your Coach Ray specialist${activeMissions.length>1?' s':''} ready.` : 'Choose a mission — Coach Ray becomes your specialist.'}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14}}>
              {(activeMissions.length > 0 ? MISSIONS.filter(m=>activeMissions.includes(m.id)) : MISSIONS).map(m=>(
                <div key={m.id} className="mc" onClick={()=>startMission(m.id)}
                  style={{padding:'22px 24px',borderRadius:16,background:'rgba(255,255,255,.04)',
                    border:`1px solid ${m.color}44`,borderLeft:`4px solid ${m.color}`,cursor:'pointer',transition:'all .2s'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                    <span style={{fontSize:28}}>{m.icon}</span>
                    <div>
                      <div style={{fontWeight:800,fontSize:16}}>{m.label}</div>
                      <div style={{fontSize:11,color:m.color,fontWeight:700}}>COACH RAY SPECIALIST</div>
                    </div>
                  </div>
                  <div style={{fontSize:13,color:'rgba(240,244,248,.6)',lineHeight:1.5,marginBottom:12}}>{m.desc}</div>
                  <div style={{fontSize:13,color:m.color,fontWeight:700}}>Start Mission →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view==='coach'&&(
          <div style={{maxWidth:700}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              {mission&&(
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:24}}>{MISSIONS.find(x=>x.id===mission)?.icon}</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:16}}>{MISSIONS.find(x=>x.id===mission)?.label}</div>
                    <div style={{fontSize:12,color:done?G:A}}>{done?'✅ Profile complete':`Question ${qi+1} of ${questions.length}`}</div>
                  </div>
                </div>
              )}
              {!mission&&<h2 style={{fontSize:22,fontWeight:900}}>Coach Ray</h2>}
              <button onClick={()=>setView('missions')} className="b"
                style={{marginLeft:'auto',padding:'7px 14px',borderRadius:100,border:'1px solid rgba(255,255,255,.15)',background:'transparent',color:'rgba(240,244,248,.6)',fontSize:12,cursor:'pointer'}}>
                ← Change Mission
              </button>
            </div>

            <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(16,185,129,.2)',borderRadius:20,overflow:'hidden'}}>
              <div style={{height:500,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
                {msgs.length===0&&(
                  <div style={{textAlign:'center',padding:'40px 20px',color:'rgba(240,244,248,.4)'}}>
                    <div style={{fontSize:40,marginBottom:12}}>🤖</div>
                    <div style={{fontSize:15,marginBottom:16}}>Choose a mission to activate Coach Ray as your specialist</div>
                    <button onClick={()=>setView('missions')} className="b"
                      style={{padding:'10px 24px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${A},#D97706)`,color:D,fontWeight:700,cursor:'pointer'}}>
                      Choose Mission →
                    </button>
                  </div>
                )}
                {msgs.map((m,i)=>(
                  <div key={i}>
                    <div style={{display:'flex',justifyContent:m.r==='u'?'flex-end':'flex-start',gap:8,alignItems:'flex-end'}}>
                      {m.r==='a'&&<div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${G},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>🤖</div>}
                      <div style={{maxWidth:'82%',padding:'11px 15px',
                        borderRadius:m.r==='u'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                        background:m.r==='u'?`linear-gradient(135deg,${A},#D97706)`:'rgba(255,255,255,.07)',
                        fontSize:14,lineHeight:1.6,color:W,whiteSpace:'pre-wrap'}}>
                        {m.c}
                      </div>
                    </div>
                    {m.o&&m.r==='a'&&i===msgs.length-1&&!done&&(
                      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10,paddingLeft:36}}>
                        {m.o.map((opt:string,j:number)=>(
                          <button key={j} onClick={()=>advance(opt)} className="b"
                            style={{padding:'8px 16px',borderRadius:100,border:'1px solid rgba(16,185,129,.4)',
                              background:'rgba(16,185,129,.08)',color:W,fontSize:13,cursor:'pointer',fontWeight:600}}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {m.type==='textarea'&&m.r==='a'&&i===msgs.length-1&&!done&&(
                      <div style={{marginTop:10,paddingLeft:36}}>
                        <textarea rows={4} value={inp} onChange={e=>setInp(e.target.value)}
                          placeholder="Type your response here..."
                          style={{width:'100%',padding:'12px 16px',borderRadius:12,background:'rgba(255,255,255,.07)',
                            border:'1px solid rgba(255,255,255,.15)',color:W,fontSize:14}}/>
                        <button onClick={()=>{if(inp.trim()){advance(inp.trim());setInp('')}}} className="b"
                          style={{marginTop:8,padding:'10px 24px',borderRadius:100,border:'none',
                            background:`linear-gradient(135deg,${G},#059669)`,color:W,fontWeight:700,cursor:'pointer'}}>
                          Submit →
                        </button>
                      </div>
                    )}
                    {m.showSend&&(
                      <div style={{paddingLeft:36,marginTop:12}}>
                        <button onClick={sendOutreach} disabled={sending} className="b"
                          style={{padding:'13px 28px',borderRadius:100,border:'none',
                            background:sending?`rgba(16,185,129,.4)`:`linear-gradient(135deg,${G},#059669)`,
                            color:W,fontWeight:800,fontSize:15,cursor:sending?'default':'pointer',
                            boxShadow:sending?'none':'0 4px 20px rgba(16,185,129,.4)',
                            display:'flex',alignItems:'center',gap:8,transition:'all .2s'}}>
                          {sending?'📤 Sending...':'📤 Send to Businesses'}
                        </button>
                      </div>
                    )}
                    {m.showPortal&&(
                      <div style={{paddingLeft:36,marginTop:12}}>
                        <button onClick={()=>router.push('/messages')} className="b"
                          style={{padding:'13px 28px',borderRadius:100,border:`2px solid ${A}`,
                            background:`rgba(245,158,11,.12)`,
                            color:A,fontWeight:800,fontSize:15,cursor:'pointer',
                            boxShadow:'0 4px 20px rgba(245,158,11,.25)',
                            display:'flex',alignItems:'center',gap:8}}>
                          💬 Open Message Portal
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* GED TEST UI */}
                {/* ZIP Override */}
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,padding:'8px 12px',background:'rgba(255,255,255,.03)',borderRadius:10}}>
                  <span style={{fontSize:12,color:'rgba(240,244,248,.5)'}}>📍 Search area:</span>
                  <input placeholder="ZIP code" value={searchZip}
                    onChange={e=>{setSearchZip(e.target.value);setSearchZipSaved(false)}}
                    style={{padding:'6px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.05)',color:'#F0F4F8',fontSize:13,width:80}}/>
                  <button onClick={async()=>{
                    if(!searchZip||searchZip.length<3){alert('Enter a valid ZIP code');return}
                    try{
                      const t=tok();if(!t){alert('Please log in first');return}
                      const r=await fetch(`${API}/profile/search-zip`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${t}`},body:JSON.stringify({search_zip:searchZip})})
                      if(r.ok){setSearchZipSaved(true)}else{const d=await r.json();alert('Error: '+(d.detail||'Failed to update ZIP'))}
                    }catch(e){alert('Network error: '+e.message)}
                  }} style={{padding:'6px 12px',borderRadius:8,background:searchZipSaved?'rgba(16,185,129,.2)':'rgba(245,158,11,.15)',border:'1px solid '+(searchZipSaved?'rgba(16,185,129,.3)':'rgba(245,158,11,.3)'),color:searchZipSaved?'#10B981':'#F59E0B',fontSize:12,cursor:'pointer'}}>
                    {searchZipSaved?'✓ Saved':'Update'}
                  </button>
                </div>
                {gedMode&&!gedResults&&gedQuestions.length===0&&(
                  <div style={{padding:'16px',background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.3)',borderRadius:14,margin:'8px 0'}}>
                    <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>🎓 GED Baseline Mock Test</div>
                    {gedProgress&&gedProgress.progress&&Object.keys(gedProgress.progress).length>0&&(
                      <div style={{marginBottom:14,padding:12,background:'rgba(255,255,255,.04)',borderRadius:10}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#F59E0B',marginBottom:8}}>📊 Your Progress ({gedProgress.subjects_passed}/4 subjects passed)</div>
                        {Object.entries(gedProgress.progress).map(([sub,data]:any)=>(
                          <div key={sub} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0',fontSize:13}}>
                            <span>{sub==='rla'?'Language Arts':sub==='social_studies'?'Social Studies':sub.charAt(0).toUpperCase()+sub.slice(1)}</span>
                            <span style={{color:data.passed?'#10B981':'#F59E0B',fontWeight:700}}>{data.latest_score}% {data.passed?'✅':'⚠️'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{fontSize:13,color:'rgba(240,244,248,.7)',marginBottom:16}}>{gedProgress&&Object.keys(gedProgress.progress||{}).length>0?'Pick a subject to test or retry:':'Pick a subject to start your 10-question mock test. Coach Ray will score it and build your study plan.'}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {GED_SUBJECTS.map(s=>(
                        <button key={s.id} onClick={()=>startGedTest(s.id)}
                          disabled={gedLoading}
                          style={{padding:'12px 16px',borderRadius:10,border:'1px solid rgba(245,158,11,.3)',
                            background:'rgba(255,255,255,.04)',color:W,cursor:'pointer',
                            display:'flex',justifyContent:'space-between',alignItems:'center',textAlign:'left' as const}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:14}}>{s.label}</div>
                            <div style={{fontSize:11,color:'rgba(240,244,248,.5)',marginTop:2}}>{s.desc}</div>
                          </div>
                          <span style={{color:A,fontSize:13}}>Start →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* GED QUESTION */}
                {gedMode&&gedQuestions.length>0&&!gedResults&&(
                  <div style={{padding:'16px',background:'rgba(16,185,129,.06)',border:'1px solid rgba(16,185,129,.25)',borderRadius:14,margin:'8px 0'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                      <div style={{fontWeight:700,fontSize:14}}>📝 Question {gedQi+1} of {gedQuestions.length}</div>
                      <div style={{fontSize:12,color:'rgba(240,244,248,.5)'}}>{gedSubject.toUpperCase()}</div>
                    </div>
                    {/* Progress bar */}
                    <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2,marginBottom:14}}>
                      <div style={{height:4,background:G,borderRadius:2,width:`${((gedQi)/gedQuestions.length)*100}%`,transition:'width .3s'}}/>
                    </div>
                    <div style={{fontSize:15,fontWeight:600,marginBottom:16,lineHeight:1.5}}>
                      {gedQuestions[gedQi]?.q}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {gedQuestions[gedQi]?.options.map((opt:string,oi:number)=>(
                        <button key={oi} onClick={()=>submitGedAnswer(gedQi,opt)}
                          style={{padding:'12px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,.15)',
                            background:'rgba(255,255,255,.04)',color:W,cursor:'pointer',
                            textAlign:'left' as const,fontSize:14,fontWeight:400}}>
                          <span style={{color:A,fontWeight:700,marginRight:8}}>
                            {String.fromCharCode(65+oi)}.
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* GED RESULTS */}
                {gedMode&&gedResults&&(
                  <div style={{padding:'16px',background:gedResults.passed?'rgba(16,185,129,.08)':'rgba(245,158,11,.08)',
                    border:`1px solid ${gedResults.passed?'rgba(16,185,129,.3)':'rgba(245,158,11,.3)'}`,borderRadius:14,margin:'8px 0'}}>
                    <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>
                      {gedResults.passed?'🎉':'📚'} {gedSubject.toUpperCase()} — {gedResults.percentage}%
                    </div>
                    <div style={{fontSize:13,color:'rgba(240,244,248,.7)',marginBottom:12}}>{gedResults.status}</div>
                    {gedResults.weak_concepts.length>0&&(
                      <div style={{marginBottom:12}}>
                        <div style={{fontSize:12,fontWeight:700,color:A,marginBottom:4}}>⚠️ Focus on these:</div>
                        <div style={{display:'flex',flexWrap:'wrap' as const,gap:6}}>
                          {gedResults.weak_concepts.map((c:string,i:number)=>(
                            <span key={i} style={{padding:'3px 10px',borderRadius:20,fontSize:11,
                              background:'rgba(245,158,11,.15)',color:A,border:'1px solid rgba(245,158,11,.3)'}}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                      {GED_SUBJECTS.filter(s=>s.id!==gedSubject).map(s=>(
                        <button key={s.id} onClick={()=>startGedTest(s.id)}
                          style={{padding:'8px 14px',borderRadius:20,border:'1px solid rgba(255,255,255,.2)',
                            background:'rgba(255,255,255,.06)',color:W,cursor:'pointer',fontSize:12,fontWeight:600}}>
                          Test {s.label}
                        </button>
                      ))}
                      <button onClick={()=>startGedTest(gedSubject)}
                        style={{padding:'8px 14px',borderRadius:20,border:`1px solid ${G}44`,
                          background:`rgba(16,185,129,.1)`,color:G,cursor:'pointer',fontSize:12,fontWeight:600}}>
                        Retry {gedSubject.toUpperCase()}
                      </button>
                    </div>
                  </div>
                )}

                {showContactOptions&&(
                  <div style={{paddingLeft:36}}>
                    <div style={{fontSize:13,color:'rgba(240,244,248,.6)',marginBottom:10}}>How would you like to be contacted?</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                      {[['sms','📱 Text me'],['email','📧 Email me'],['call','📞 Call me'],['calendar','📅 Book appointment']].map(([method,label])=>(
                        <button key={method} onClick={()=>handleContact(method)} className="b"
                          style={{padding:'10px 18px',borderRadius:100,border:`1px solid ${A}66`,
                            background:`rgba(245,158,11,.1)`,color:W,fontSize:13,cursor:'pointer',fontWeight:700}}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading&&<div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${G},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🤖</div>
                  <span style={{color:'rgba(240,244,248,.4)',fontSize:13}}>Coach Ray is typing...</span>
                </div>}
                <div ref={ref}/>
              </div>
              <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:8}}>
                <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendChat()}}
                  placeholder={done?'Ask Coach Ray anything...':(mission?'Type your answer or tap an option...':'Choose a mission to start')}
                  style={{flex:1,padding:'11px 16px',borderRadius:100,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:W,fontSize:14}}/>
                <button onClick={sendChat} className="b"
                  style={{padding:'11px 22px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${G},#059669)`,color:W,fontWeight:700,fontSize:14,cursor:'pointer'}}>
                  Send
                </button>
              </div>
            </div>

            {Object.keys(ans).length>0&&(
              <div style={{marginTop:16,padding:'16px 20px',borderRadius:12,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.08)'}}>
                <div style={{fontSize:11,fontWeight:700,color:'rgba(240,244,248,.4)',marginBottom:10,letterSpacing:'1px'}}>YOUR SAVED PROFILE</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {Object.entries(ans).map(([k,v])=>(
                    <div key={k} style={{fontSize:12}}>
                      <span style={{color:'rgba(240,244,248,.4)'}}>{k.replace(/_/g,' ')}: </span>
                      <span style={{fontWeight:600}}>{String(v).slice(0,50)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view==='messages'&&(
          <div style={{height:'calc(100vh - 180px)',display:'flex',gap:0,borderRadius:16,overflow:'hidden',border:'1px solid rgba(255,255,255,.08)'}}>
            {/* LEFT PANEL — threads */}
            <div style={{width:260,flexShrink:0,borderRight:'1px solid rgba(255,255,255,.08)',overflowY:'auto',background:'rgba(255,255,255,.02)'}}>
              <div style={{padding:'16px 14px 10px',fontSize:11,fontWeight:800,color:'rgba(240,244,248,.4)',letterSpacing:'1.5px'}}>CONVERSATIONS</div>
              {hist.length===0
                ? <div style={{padding:24,textAlign:'center',color:'rgba(240,244,248,.8)',fontSize:13}}>No outreach sent yet.<br/>Start a mission!</div>
                : hist.map((h,i)=>(
                  <div key={i} onClick={()=>setActiveThread(i)}
                    style={{padding:'12px 14px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.05)',
                      background:activeThread===i?'rgba(16,185,129,.08)':'transparent',
                      borderLeft:activeThread===i?'3px solid #10B981':'3px solid transparent'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <span style={{fontWeight:700,fontSize:13,color:'#F0F4F8'}}>{h.recipient_name?.slice(0,20)}</span>
                      <span style={{fontSize:10,color:'rgba(240,244,248,.8)'}}>
                        {h.replied_at?'replied':h.status==='sent'?'sent':'pending'}
                      </span>
                    </div>
                    <div style={{fontSize:11,color:h.reply_text?'#10B981':'rgba(240,244,248,.4)',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                      {h.reply_text?'💬 '+h.reply_text.slice(0,30):h.message_text?.slice(0,30)}...
                    </div>
                  </div>
                ))
              }
            </div>
            {/* RIGHT PANEL — conversation */}
            <div style={{flex:1,display:'flex',flexDirection:'column',background:'#080C12'}}>
              {activeThread===null
                ? <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(240,244,248,.8)',fontSize:14}}>
                    Select a conversation →
                  </div>
                : <>
                  <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(16,185,129,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🏢</div>
                    <div>
                      <div style={{fontWeight:800,fontSize:14}}>{hist[activeThread]?.recipient_name}</div>
                      <div style={{fontSize:11,color:'rgba(240,244,248,.4)'}}>{hist[activeThread]?.recipient_phone}</div>
                    </div>
                    <div style={{marginLeft:'auto',padding:'4px 12px',borderRadius:100,fontSize:11,fontWeight:700,
                      background:hist[activeThread]?.reply_text?'rgba(16,185,129,.15)':'rgba(245,158,11,.12)',
                      color:hist[activeThread]?.reply_text?'#10B981':'#F59E0B'}}>
                      {hist[activeThread]?.reply_text?'● Replied':'● Sent'}
                    </div>
                  </div>
                  <div style={{flex:1,overflowY:'auto',padding:'20px 16px',display:'flex',flexDirection:'column',gap:10}}>
                    {/* Outbound message */}
                    <div style={{display:'flex',justifyContent:'flex-end'}}>
                      <div style={{maxWidth:'72%',padding:'11px 15px',borderRadius:'16px 16px 4px 16px',
                        background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'#080C12',fontSize:13,fontWeight:600,lineHeight:1.5}}>
                        {hist[activeThread]?.message_text}
                        <div style={{fontSize:10,marginTop:4,opacity:.6,textAlign:'right'}}>
                          ✓✓ {hist[activeThread]?.sent_at?new Date(hist[activeThread].sent_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'Sent'}
                        </div>
                      </div>
                    </div>
                    {/* Inbound reply */}
                    {hist[activeThread]?.reply_text&&(
                      <div style={{display:'flex',justifyContent:'flex-start',gap:8}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(16,185,129,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>🏢</div>
                        <div style={{maxWidth:'72%',padding:'11px 15px',borderRadius:'16px 16px 16px 4px',
                          background:'rgba(255,255,255,.09)',color:'#F0F4F8',fontSize:13,lineHeight:1.5}}>
                          {hist[activeThread]?.reply_text}
                          <div style={{fontSize:10,marginTop:4,opacity:.5}}>
                            {hist[activeThread]?.replied_at?new Date(hist[activeThread].replied_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Let Ray Reply button */}
                    {hist[activeThread]?.reply_text&&(
                      <div style={{display:'flex',justifyContent:'flex-end',marginTop:4}}>
                        <button className="b" onClick={async()=>{
                          const h = hist[activeThread]
                          const t = tok()
                          const res = await fetch(`${API}/coach/suggest-reply`,{
                            method:'POST',
                            headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
                            body:JSON.stringify({business_name:h.recipient_name,last_message:h.reply_text,user_name:uname})
                          })
                          const d = await res.json()
                          setThreadReply(d.suggestion||'')
                        }} style={{padding:'8px 16px',borderRadius:100,border:'1px solid rgba(16,185,129,.4)',
                          background:'rgba(16,185,129,.08)',color:'#10B981',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                          🤖 Let Ray Reply
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:8}}>
                    <input value={threadReply} onChange={e=>setThreadReply(e.target.value)}
                      onKeyDown={async e=>{
                        if(e.key==='Enter'&&threadReply.trim()){
                          const h = hist[activeThread]; const t = tok()
                          await fetch(`${API}/messages/reply`,{method:'POST',
                            headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
                            body:JSON.stringify({to:h.recipient_phone,message:threadReply,business_name:h.recipient_name})})
                          setThreadReply('')
                        }
                      }}
                      placeholder="Reply to employer..."
                      style={{flex:1,padding:'10px 14px',borderRadius:100,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'#F0F4F8',fontSize:13}}/>
                    <button className="b" onClick={async()=>{
                      if(!threadReply.trim())return
                      const h = hist[activeThread]; const t = tok()
                      await fetch(`${API}/messages/reply`,{method:'POST',
                        headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
                        body:JSON.stringify({to:h.recipient_phone,message:threadReply,business_name:h.recipient_name})})
                      setThreadReply('')
                    }} style={{padding:'10px 20px',borderRadius:100,border:'none',
                      background:'linear-gradient(135deg,#10B981,#059669)',color:'#F0F4F8',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                      Send
                    </button>
                  </div>
                </>
              }
            </div>
          </div>
        )}
        {view==='appointments'&&(
          <div>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:20}}>Appointments</h2>
            {appts.length===0?<div style={{padding:32,textAlign:'center',color:'rgba(240,244,248,.4)',background:'rgba(255,255,255,.03)',borderRadius:16,border:'1px solid rgba(255,255,255,.08)'}}>No appointments yet. Coach Ray books them automatically!</div>
            :<div style={{display:'grid',gap:8}}>{appts.map((a,i)=>(
              <div key={i} style={{padding:'18px 20px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(16,185,129,.2)'}}>
                <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{a.business_name}</div>
                <div style={{fontSize:14,color:A,fontWeight:700}}>📅 {new Date(a.appt_datetime).toLocaleString()}</div>
              </div>
            ))}</div>}
          </div>
        )}

        {view==='credits'&&(
          <div style={{maxWidth:520}}>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:6}}>Credits and Billing</h2>
            <p style={{color:'rgba(240,244,248,.6)',fontSize:14,marginBottom:24}}>Each SMS costs 1 credit. $9.99/month includes 50 credits and unlimited Coach Ray.</p>
            <div style={{background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.25)',borderRadius:16,padding:28,marginBottom:20,textAlign:'center'}}>
              <div style={{fontSize:52,fontWeight:900,color:A}}>{credits}</div>
              <div style={{fontSize:15,color:'rgba(240,244,248,.6)',marginTop:6}}>Credits remaining</div>
            </div>
            {buyError&&<div style={{padding:'12px 16px',borderRadius:12,background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.3)',color:'#f87171',fontSize:13,marginBottom:12}}>{buyError}</div>}
            <div style={{display:'grid',gap:10}}>
              {[[50,'$5.00'],[100,'$10.00'],[200,'$20.00'],[400,'$40.00'],[600,'$60.00']].map(([c,p])=>(
                <div key={String(c)} style={{padding:'16px 20px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:15}}>{c} SMS Credits</div>
                    <div style={{fontSize:13,color:'rgba(240,244,248,.45)',marginTop:2}}>{(parseFloat(String(p).replace('$',''))/parseInt(String(c))*10).toFixed(1)}c per text</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <span style={{color:A,fontWeight:800,fontSize:16}}>{p}</span>
                    <button className="b" onClick={()=>buyCredits(parseInt(String(c)))} disabled={buyLoading===parseInt(String(c))} style={{padding:'9px 20px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${A},#D97706)`,color:D,fontWeight:800,fontSize:13,cursor:'pointer',opacity:buyLoading===parseInt(String(c))?0.6:1}}>{buyLoading===parseInt(String(c))?'...' :'Buy'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
