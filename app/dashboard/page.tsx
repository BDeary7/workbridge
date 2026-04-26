'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const amber = '#F59E0B'
const green = '#10B981'
const dark = '#080C12'
const white = '#F0F4F8'

const MISSIONS = [
  { id:'veteran', icon:'⭐', label:'Veterans Hub', color:'#3B82F6', desc:'VA benefits, refi, home buying, tax breaks, disability claims', coachIntro:"Hello! I am Coach Ray, your dedicated Veterans Specialist. I am here to make sure you get every benefit you have earned. I will ask you a few questions to find the best opportunities for you. Ready?" },
  { id:'job', icon:'🔍', label:'Find a Job', color:'#10B981', desc:'Get hired fast via SMS — no resume needed', coachIntro:"Hi! I am Coach Ray. I specialize in getting people hired fast. No resume needed. Let me ask you a few quick questions and I will connect you with local employers who are hiring RIGHT NOW." },
  { id:'home', icon:'🔧', label:'Home Services', color:'#F97316', desc:'Plumber, electrician, handyman — fast local help', coachIntro:"Hey there! I am Coach Ray. Need something fixed at home? Tell me what is going on and I will find licensed local pros in your area fast." },
  { id:'senior', icon:'👴', label:'Senior Care', color:'#8B5CF6', desc:'In-home care, assisted living, memory care placement', coachIntro:"Hello, I am Coach Ray. Finding the right care for a loved one is one of the most important decisions you will make. I am here to help guide you through the options available in your area." },
  { id:'education', icon:'📚', label:'Get Educated', color:'#F59E0B', desc:'GED, trade school, college, apprenticeships', coachIntro:"Hi! I am Coach Ray. Whether you want your GED, a trade certification, or a college degree — I can connect you with programs in your area that fit your schedule and budget." },
  { id:'housing', icon:'🔑', label:'Find Housing', color:'#06B6D4', desc:'Rentals, Section 8, emergency housing, vouchers', coachIntro:"Hi, I am Coach Ray. Finding stable housing is everything. I will ask you a few questions about your situation so I can connect you with the right landlords and programs available today." },
  { id:'business', icon:'🏢', label:'Hire Workers', color:'#EC4899', desc:'Find qualified workers for your business fast', coachIntro:"Welcome! I am Coach Ray, your business staffing specialist. Tell me about your business and what kind of help you need — I will find qualified candidates in your area." },
  { id:'vehicle', icon:'🚗', label:'Buy a Vehicle', color:'#14B8A6', desc:'Military deals, USAA financing, civilian purchases', coachIntro:"Hi! I am Coach Ray. Whether you are military or civilian, I can connect you with dealers offering the best deals in your area. Let me find the right vehicle and financing for you." },
  { id:'debt', icon:'💰', label:'Debt and Tax Relief', color:'#A78BFA', desc:'Tax breaks, debt relief, financial counseling', coachIntro:"Hello, I am Coach Ray. Financial stress is real — but there are programs most people do not know about that can help significantly. Let me find what relief options you qualify for." },
  { id:'chores', icon:'🧹', label:'Household Help', color:'#F59E0B', desc:'Cleaning, lawn care, recurring home services', coachIntro:"Hi! I am Coach Ray. Need regular help around the house? I will find reliable local service providers who can help on your schedule and budget." },
]

const QUESTIONS = {
  veteran: [
    {q:"Are you currently active duty, a veteran, or a military family member?", key:"military_status", options:["Active Duty","Veteran","Military Spouse/Family","Reservist/National Guard"]},
    {q:"Which branch did you serve in?", key:"branch", options:["Army","Navy","Marine Corps","Air Force","Coast Guard","Space Force","National Guard"]},
    {q:"What years did you serve? (e.g. 2005-2012)", key:"service_years"},
    {q:"Do you have a VA disability rating?", key:"disability_rating", options:["No rating","10-30%","40-60%","70-90%","100% P&T","Not sure / haven't applied"]},
    {q:"Are you currently receiving VA benefits?", key:"va_benefits", options:["Yes — full benefits","Yes — some benefits","No — never applied","No — was denied","In process"]},
    {q:"What are you most interested in getting help with today?", key:"primary_need", options:["Home refinancing","Buying a home","VA disability claim","Tax breaks","Car purchase","Education/GED","Employment","Financial relief","All of the above"]},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"What is your approximate annual household income?", key:"income", options:["Under $30K","$30K-$50K","$50K-$75K","$75K-$100K","Over $100K","Prefer not to say"]},
    {q:"Do you own your home?", key:"home_owner", options:["Yes — I own my home","No — I rent","No — homeless or in transition","No — living with family"]},
    {q:"When did you last refinance your home?", key:"last_refi", options:["Never refinanced","Less than 1 year ago","1-2 years ago","3-5 years ago","More than 5 years ago","Currently in process"]},
    {q:"What interest rate are you currently paying on your mortgage?", key:"current_rate", options:["Below 4%","4-5%","5-6%","6-7%","7-8%","Above 8%","I don't know"]},
    {q:"What is your approximate home value?", key:"home_value", options:["Under $200K","$200K-$350K","$350K-$500K","$500K-$750K","Over $750K","Not sure"]},
    {q:"What is your remaining mortgage balance?", key:"mortgage_balance", options:["Under $100K","$100K-$200K","$200K-$350K","$350K-$500K","Over $500K","I rent / no mortgage"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
    {q:"What is the best email address for follow-up resources?", key:"contact_email"},
  ],
  job: [
    {q:"What type of work are you looking for?", key:"job_type", options:["Healthcare / Caregiver","Construction / Labor","Retail / Customer Service","Food Service","Driving / Delivery","Office / Admin","Tech / IT","Education","Security","Other"]},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"Are you authorized to work in the United States?", key:"work_auth", options:["Yes — US Citizen","Yes — Permanent Resident","Yes — Work Visa","No"]},
    {q:"What is your availability?", key:"availability", options:["Full-time only","Part-time only","Either","Weekends only","Evenings only","Flexible"]},
    {q:"Do you have a valid driver's license?", key:"drivers_license", options:["Yes — clean record","Yes — some violations","No","In progress"]},
    {q:"What is your highest level of education?", key:"education", options:["Some high school","High school diploma / GED","Some college","Associate degree","Bachelor degree","Graduate degree","Trade certification"]},
    {q:"How soon are you looking to start?", key:"start_date", options:["Immediately","Within 1 week","Within 2 weeks","Within a month","Just exploring"]},
    {q:"Are you a veteran or active military?", key:"is_veteran", options:["Yes","No"]},
    {q:"What is your approximate hourly pay expectation?", key:"pay_expectation", options:["$15-18/hr","$18-22/hr","$22-28/hr","$28-35/hr","$35+/hr","Open to discussion"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
  ],
  home: [
    {q:"What type of home service do you need?", key:"service_type", options:["Plumbing","Electrical","HVAC / AC","Roofing","Painting","Flooring","Landscaping","Cleaning","Pest Control","Handyman","Other"]},
    {q:"Describe the problem briefly — what is happening?", key:"problem_desc"},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"How urgent is this?", key:"urgency", options:["Emergency — need help NOW","Today if possible","This week","Within 2 weeks","Just getting quotes"]},
    {q:"Do you own or rent your home?", key:"own_or_rent", options:["Own","Rent — landlord approval needed","Rent — I will handle it","Other"]},
    {q:"What is your approximate budget for this job?", key:"budget", options:["Under $200","$200-$500","$500-$1,000","$1,000-$3,000","$3,000-$10,000","Over $10,000","Need estimate first"]},
    {q:"What is the best time for a pro to come?", key:"availability", options:["Morning (8am-12pm)","Afternoon (12pm-5pm)","Evening (5pm-8pm)","Weekend only","Flexible"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
  ],
  senior: [
    {q:"Who is the care for?", key:"care_for", options:["Myself","My parent","My spouse/partner","Other family member"]},
    {q:"What type of care is needed?", key:"care_type", options:["In-home care (a few hours/day)","In-home care (full-time)","Assisted living","Memory care / Dementia","Skilled nursing / Rehab","Respite care","Companionship only","Not sure yet"]},
    {q:"What is the ZIP code where care is needed?", key:"zip"},
    {q:"How soon is care needed?", key:"urgency", options:["Immediately","Within 1 week","Within 1 month","2-3 months","Just researching"]},
    {q:"What is the person's approximate age?", key:"age_range", options:["60-69","70-79","80-89","90+"]},
    {q:"What is the approximate monthly budget for care?", key:"budget", options:["Under $1,500/mo","$1,500-$3,000/mo","$3,000-$5,000/mo","Over $5,000/mo","Need to understand options first","Have long-term care insurance"]},
    {q:"Is the person a veteran?", key:"is_veteran", options:["Yes","No","Not sure"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
  ],
  education: [
    {q:"What educational goal are you working toward?", key:"goal", options:["GED / High School Equivalency","Trade / Vocational Certificate","Associate Degree","Bachelor Degree","Job-specific certification","ESL — English as Second Language","Learn a skill","Not sure yet"]},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"What is your preferred schedule?", key:"schedule", options:["Daytime classes","Evening classes","Weekend only","Online / self-paced","Hybrid","Flexible"]},
    {q:"What is your approximate budget per month for education?", key:"budget", options:["$0 — need fully funded options","Under $100/mo","$100-$300/mo","$300-$500/mo","Over $500/mo","Have financial aid / GI Bill"]},
    {q:"Are you a veteran or military family member?", key:"is_veteran", options:["Yes","No"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
  ],
  housing: [
    {q:"What type of housing help do you need?", key:"need_type", options:["Looking to rent","Emergency shelter","Have a Section 8 voucher","Facing eviction — need help now","Transitional housing","Help with deposit","Sober living","Other"]},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"How urgent is your housing need?", key:"urgency", options:["Emergency — tonight or tomorrow","Within 1 week","Within 1 month","Within 3 months","Just planning ahead"]},
    {q:"What is your approximate monthly income?", key:"income", options:["$0 — no income","Under $1,000/mo","$1,000-$2,000/mo","$2,000-$3,500/mo","Over $3,500/mo"]},
    {q:"Are you a veteran?", key:"is_veteran", options:["Yes","No"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
  ],
  business: [
    {q:"What type of business do you run?", key:"biz_type", options:["Restaurant / Food Service","Retail","Healthcare","Construction","Cleaning","Transportation","Tech","Education","Beauty / Wellness","Other"]},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"What type of worker do you need?", key:"worker_type"},
    {q:"How many workers do you need?", key:"count", options:["1 person","2-3 people","4-10 people","10+ people","Ongoing staffing partner"]},
    {q:"What is the pay rate you are offering?", key:"pay_rate", options:["Minimum wage","$16-$20/hr","$20-$25/hr","$25-$35/hr","Over $35/hr","Salary","Commission-based"]},
    {q:"When do you need workers to start?", key:"start", options:["Immediately","Within 1 week","Within 2 weeks","Next month","Building a pipeline"]},
    {q:"What is the best phone number for candidates to reach you?", key:"phone"},
  ],
  vehicle: [
    {q:"Are you active military or a veteran?", key:"military", options:["Yes — Active Duty","Yes — Veteran","Yes — Military Family","No — Civilian"]},
    {q:"What type of vehicle are you looking for?", key:"vehicle_type", options:["Sedan / Car","SUV / Crossover","Truck","Minivan","Electric Vehicle","Motorcycle","Commercial vehicle","Not sure yet"]},
    {q:"New or used?", key:"new_or_used", options:["New only","Used only","Either — best deal wins","Certified Pre-Owned preferred"]},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"What is your approximate budget?", key:"budget", options:["Under $15,000","$15K-$25K","$25K-$40K","$40K-$60K","Over $60K","Under $300/mo payment","$300-$500/mo","Over $500/mo"]},
    {q:"What is your approximate credit score?", key:"credit", options:["Excellent (720+)","Good (680-719)","Fair (620-679)","Poor (below 620)","No credit history","Not sure"]},
    {q:"How soon are you looking to buy?", key:"timeline", options:["This week","This month","Within 3 months","Just researching"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
  ],
  debt: [
    {q:"What type of financial help are you looking for?", key:"help_type", options:["Credit card debt relief","Medical bill negotiation","Student loan help","Tax debt / IRS issues","Mortgage relief","Bankruptcy consultation","Veteran tax breaks","Full financial review"]},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"What is your approximate total debt amount?", key:"total_debt", options:["Under $5,000","$5K-$15K","$15K-$30K","$30K-$60K","Over $60K","Not sure"]},
    {q:"What is your approximate monthly income?", key:"income", options:["Under $1,500","$1,500-$3,000","$3,000-$5,000","Over $5,000","No current income"]},
    {q:"Are you a veteran or active military?", key:"is_veteran", options:["Yes","No"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
  ],
  chores: [
    {q:"What type of home help do you need?", key:"service", options:["House cleaning","Lawn mowing","Laundry / ironing","Grocery / errands","Meal prep","Window washing","Organization","Moving help","Pool cleaning","Multiple services"]},
    {q:"What is your ZIP code?", key:"zip"},
    {q:"How often do you need this service?", key:"frequency", options:["One-time only","Weekly","Bi-weekly","Monthly","As needed"]},
    {q:"What is your approximate budget per visit?", key:"budget", options:["Under $50","$50-$100","$100-$200","$200-$400","Open — depends on quote"]},
    {q:"What is the best phone number to reach you?", key:"phone"},
  ],
}

export default function Dashboard() {
  const router = useRouter()
  const [view, setView] = useState('missions')
  const [activeMission, setActiveMission] = useState(null)
  const [name, setName] = useState('')
  const [credits, setCredits] = useState(0)
  const [waking, setWaking] = useState(true)
  const [apiReady, setApiReady] = useState(false)
  const [history, setHistory] = useState([])
  const [appointments, setAppointments] = useState([])
  const [chatMsgs, setChatMsgs] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [qIndex, setQIndex] = useState(-1)
  const [answers, setAnswers] = useState({})
  const [qualifyingDone, setQualifyingDone] = useState(false)
  const bottomRef = useRef(null)
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('wb_token') : null

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    setName(localStorage.getItem('wb_name') || 'there')
    wakeAPI(token)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs])

  const wakeAPI = async (token) => {
    setWaking(true)
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch(`${API}/health`, { signal: AbortSignal.timeout(10000) })
        if (r.ok) { setApiReady(true); break }
      } catch { await new Promise(r => setTimeout(r, 2000)) }
    }
    try {
      const [balRes, histRes, apptRes] = await Promise.all([
        fetch(`${API}/credits/balance`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/sms/history`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const bal = await balRes.json(); setCredits(bal.credits || 0)
      const hist = await histRes.json(); setHistory(hist.history || [])
      const appt = await apptRes.json(); setAppointments(appt.appointments || [])
    } catch {}
    setWaking(false)
  }

  const startMission = (missionId) => {
    const mission = MISSIONS.find(m => m.id === missionId)
    if (!mission) return
    setActiveMission(missionId)
    setQIndex(0)
    setAnswers({})
    setQualifyingDone(false)
    const firstQ = QUESTIONS[missionId]?.[0]
    setChatMsgs([
      { role: 'assistant', content: mission.coachIntro },
      { role: 'assistant', content: firstQ?.q || 'How can I help you today?', options: firstQ?.options }
    ])
    setView('coach')
  }

  const handleOption = (option) => {
    if (qIndex < 0 || qualifyingDone) return
    const qs = QUESTIONS[activeMission] || []
    const currentQ = qs[qIndex]
    if (!currentQ) return
    const newAnswers = { ...answers, [currentQ.key]: option }
    setAnswers(newAnswers)
    setChatMsgs(m => [...m, { role: 'user', content: option }])
    const nextIndex = qIndex + 1
    if (nextIndex < qs.length) {
      setQIndex(nextIndex)
      const nextQ = qs[nextIndex]
      setTimeout(() => {
        setChatMsgs(m => [...m, { role: 'assistant', content: nextQ.q, options: nextQ.options }])
      }, 400)
    } else {
      setQIndex(-1)
      setQualifyingDone(true)
      const missionLabel = MISSIONS.find(m => m.id === activeMission)?.label || activeMission
      setTimeout(() => {
        setChatMsgs(m => [...m, {
          role: 'assistant',
          content: `Perfect ${name}! I have everything I need.\n\nYour ${missionLabel} profile is complete and saved. A specialist will be reaching out to you shortly at the number you provided.\n\nDo you have any questions I can help with right now?`
        }])
        saveProfile(newAnswers, activeMission)
      }, 400)
    }
  }

  const handleTextAnswer = () => {
    if (!chatInput.trim() || qIndex < 0 || qualifyingDone) return
    handleOptionOrText(chatInput.trim())
    setChatInput('')
  }

  const handleOptionOrText = (value) => {
    if (qIndex < 0 || qualifyingDone) return
    const qs = QUESTIONS[activeMission] || []
    const currentQ = qs[qIndex]
    if (!currentQ) return
    const newAnswers = { ...answers, [currentQ.key]: value }
    setAnswers(newAnswers)
    setChatMsgs(m => [...m, { role: 'user', content: value }])
    const nextIndex = qIndex + 1
    if (nextIndex < qs.length) {
      setQIndex(nextIndex)
      const nextQ = qs[nextIndex]
      setTimeout(() => {
        setChatMsgs(m => [...m, { role: 'assistant', content: nextQ.q, options: nextQ.options }])
      }, 400)
    } else {
      setQIndex(-1)
      setQualifyingDone(true)
      const missionLabel = MISSIONS.find(m => m.id === activeMission)?.label || activeMission
      setTimeout(() => {
        setChatMsgs(m => [...m, {
          role: 'assistant',
          content: `Perfect ${name}! Profile complete.\n\nYour ${missionLabel} profile has been saved. A specialist will reach out shortly. Any questions?`
        }])
        saveProfile(newAnswers, activeMission)
      }, 400)
    }
  }

  const saveProfile = async (data, mission) => {
    const token = getToken()
    try {
      await fetch(`${API}/coach/save-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ mission, answers: data, timestamp: new Date().toISOString() })
      })
    } catch {}
  }

  const sendFreeChat = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    if (qIndex >= 0 && !qualifyingDone) { handleOptionOrText(text); setChatInput(''); return }
    setChatInput('')
    setChatMsgs(m => [...m, { role: 'user', content: text }])
    setChatLoading(true)
    try {
      const res = await fetch(`${API}/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMsgs.filter(m => !m.options), { role: 'user', content: text }].map(m => ({ role: m.role, content: m.content })),
          language: 'en'
        })
      })
      const d = await res.json()
      setChatMsgs(m => [...m, { role: 'assistant', content: d.reply || 'Here to help!' }])
    } catch {
      setChatMsgs(m => [...m, { role: 'assistant', content: 'Connection issue — try again!' }])
    }
    setChatLoading(false)
  }

  const logout = () => { localStorage.clear(); router.push('/') }

  const tabs = [
    { id: 'missions', label: '🎯 My Missions' },
    { id: 'coach', label: '🤖 Coach Ray' },
    { id: 'history', label: '📬 SMS History' },
    { id: 'appointments', label: '📅 Appointments' },
    { id: 'credits', label: '💳 Credits' },
  ]

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', background: dark, color: white, minHeight: '100vh' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}.btn:hover{opacity:0.88;cursor:pointer}input,textarea{outline:none}input::placeholder,textarea::placeholder{color:rgba(240,244,248,0.3)}.mc:hover{transform:translateY(-2px)}`}</style>
      <nav style={{ padding: '0 24px', background: 'rgba(8,12,18,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ fontSize: 20, fontWeight: 900, cursor: 'pointer' }} onClick={() => router.push('/')}>Work<span style={{ color: amber }}>Bridge</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {waking && <div style={{ fontSize: 12, color: 'rgba(240,244,248,0.4)' }}>⏳ Connecting...</div>}
            {apiReady && !waking && <div style={{ fontSize: 12, color: green }}>● Live</div>}
            <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.7)' }}>👋 {name} · <span style={{ color: amber, fontWeight: 700 }}>{credits} credits</span></div>
            <button onClick={logout} className="btn" style={{ padding: '7px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(240,244,248,0.6)', fontSize: 13, cursor: 'pointer' }}>Log Out</button>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} className="btn"
              style={{ padding: '10px 20px', borderRadius: 100, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: view === t.id ? `linear-gradient(135deg,${amber},#D97706)` : 'rgba(255,255,255,0.06)', color: view === t.id ? dark : white, transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {view === 'missions' && (
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>What can Coach Ray help you with?</h2>
            <p style={{ color: 'rgba(240,244,248,0.55)', fontSize: 14, marginBottom: 28 }}>Choose a mission and Coach Ray becomes a specialist — asking the right questions to connect you with the best results.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
              {MISSIONS.map(m => (
                <div key={m.id} className="mc" onClick={() => startMission(m.id)}
                  style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: `1px solid ${m.color}44`, borderLeft: `4px solid ${m.color}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 28 }}>{m.icon}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: white }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: m.color, fontWeight: 700, marginTop: 1 }}>COACH RAY SPECIALIST</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.6)', lineHeight: 1.5, marginBottom: 12 }}>{m.desc}</div>
                  <div style={{ fontSize: 13, color: m.color, fontWeight: 700 }}>Start Mission →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'coach' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              {activeMission && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{MISSIONS.find(m => m.id === activeMission)?.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{MISSIONS.find(m => m.id === activeMission)?.label}</div>
                    <div style={{ fontSize: 12, color: qualifyingDone ? green : amber }}>{qualifyingDone ? '✅ Profile complete' : `Question ${qIndex + 1} of ${QUESTIONS[activeMission]?.length || 0}`}</div>
                  </div>
                </div>
              )}
              {!activeMission && <h2 style={{ fontSize: 22, fontWeight: 900 }}>Coach Ray</h2>}
              <button onClick={() => setView('missions')} className="btn"
                style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(240,244,248,0.6)', fontSize: 12, cursor: 'pointer' }}>
                ← Change Mission
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ height: 460, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatMsgs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(240,244,248,0.4)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                    <div style={{ fontSize: 15, marginBottom: 16 }}>Choose a mission to activate Coach Ray as your specialist</div>
                    <button onClick={() => setView('missions')} className="btn"
                      style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: `linear-gradient(135deg,${amber},#D97706)`, color: dark, fontWeight: 700, cursor: 'pointer' }}>
                      Choose Mission →
                    </button>
                  </div>
                )}
                {chatMsgs.map((m, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                      {m.role === 'assistant' && (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${green},#059669)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</div>
                      )}
                      <div style={{ maxWidth: '82%', padding: '11px 15px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? `linear-gradient(135deg,${amber},#D97706)` : 'rgba(255,255,255,0.07)', fontSize: 14, lineHeight: 1.6, color: white, whiteSpace: 'pre-wrap' }}>
                        {m.content}
                      </div>
                    </div>
                    {m.options && m.role === 'assistant' && i === chatMsgs.length - 1 && !qualifyingDone && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingLeft: 36 }}>
                        {m.options.map((opt, j) => (
                          <button key={j} onClick={() => handleOption(opt)} className="btn"
                            style={{ padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.08)', color: white, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${green},#059669)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
                    <div style={{ color: 'rgba(240,244,248,0.4)', fontSize: 13 }}>Coach Ray is typing...</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendFreeChat() }}
                  placeholder={qualifyingDone ? 'Ask Coach Ray anything...' : (activeMission ? 'Type your answer or tap an option above...' : 'Choose a mission to start')}
                  style={{ flex: 1, padding: '11px 16px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: white, fontSize: 14 }} />
                <button onClick={sendFreeChat} className="btn"
                  style={{ padding: '11px 22px', borderRadius: 100, border: 'none', background: `linear-gradient(135deg,${green},#059669)`, color: white, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Send
                </button>
              </div>
            </div>
            {Object.keys(answers).length > 0 && (
              <div style={{ marginTop: 16, padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,244,248,0.4)', marginBottom: 10, letterSpacing: '1px' }}>YOUR PROFILE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {Object.entries(answers).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 12 }}>
                      <span style={{ color: 'rgba(240,244,248,0.4)' }}>{k.replace(/_/g, ' ')}: </span>
                      <span style={{ color: white, fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>SMS History</h2>
            {history.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(240,244,248,0.4)', fontSize: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>No messages sent yet. Start a mission to connect with providers!</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{h.recipient_name}</div>
                      <div style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, fontWeight: 700, background: h.status === 'replied' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: h.status === 'replied' ? green : amber }}>
                        {h.status === 'replied' ? '💬 Replied' : '✅ Sent'}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.7)' }}>{h.message_text?.slice(0, 120)}...</div>
                    {h.reply_text && <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', fontSize: 13, color: green, fontWeight: 600 }}>💬 "{h.reply_text}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'appointments' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>Appointments</h2>
            {appointments.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(240,244,248,0.4)', fontSize: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>No appointments yet. Coach Ray books them automatically when providers respond!</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {appointments.map((a, i) => (
                  <div key={i} style={{ padding: '18px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{a.business_name}</div>
                    <div style={{ fontSize: 14, color: amber, fontWeight: 700 }}>📅 {new Date(a.appt_datetime).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'credits' && (
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Credits and Billing</h2>
            <p style={{ color: 'rgba(240,244,248,0.6)', fontSize: 14, marginBottom: 24 }}>Each SMS to a provider costs 1 credit. $9.99/month includes 50 credits and unlimited Coach Ray.</p>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 16, padding: 28, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: amber }}>{credits}</div>
              <div style={{ fontSize: 15, color: 'rgba(240,244,248,0.6)', marginTop: 6 }}>Credits remaining</div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[[10, '$1.00'], [50, '$4.50'], [100, '$8.00'], [250, '$18.00'], [500, '$30.00']].map(([c, p]) => (
                <div key={c} style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c} SMS Credits</div>
                    <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.45)', marginTop: 2 }}>${(parseFloat(String(p).replace('$', '')) / parseInt(String(c)) * 10).toFixed(1)}c per text</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ color: amber, fontWeight: 800, fontSize: 16 }}>{p}</div>
                    <button className="btn" style={{ padding: '9px 20px', borderRadius: 100, border: 'none', background: `linear-gradient(135deg,${amber},#D97706)`, color: dark, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Buy</button>
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
