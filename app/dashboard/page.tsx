'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
const API='https://workbridge-api.onrender.com'
const A='#F59E0B',G='#10B981',D='#080C12',W='#F0F4F8'
const MISSIONS=[
{id:'veteran',icon:'⭐',label:'Veterans Hub',color:'#3B82F6',desc:'VA benefits, refi, home buying, tax breaks, disability claims',intro:'Hello! I am Coach Ray, your Veterans Specialist. I will make sure you get every benefit you have earned. Let me ask a few questions to get started.'},
{id:'job',icon:'🔍',label:'Find a Job',color:'#10B981',desc:'Get hired fast via SMS — no resume needed',intro:'Hi! I am Coach Ray. I get people hired fast — no resume needed. A few quick questions and I will connect you with employers hiring RIGHT NOW.'},
{id:'home',icon:'🔧',label:'Home Services',color:'#F97316',desc:'Plumber, electrician, handyman — fast local help',intro:'Hey! I am Coach Ray. Need something fixed at home? Tell me what is going on and I will find licensed local pros in your area fast.'},
{id:'senior',icon:'👴',label:'Senior Care',color:'#8B5CF6',desc:'In-home care, assisted living, memory care placement',intro:'Hello, I am Coach Ray. Finding the right care for a loved one is one of the most important decisions. I am here to help guide you through the best options.'},
{id:'education',icon:'📚',label:'Get Educated',color:'#F59E0B',desc:'GED, trade school, college, apprenticeships',intro:'Hi! I am Coach Ray. Whether you want your GED, a trade cert, or a degree — I can connect you with programs that fit your schedule and budget.'},
{id:'housing',icon:'🔑',label:'Find Housing',color:'#06B6D4',desc:'Rentals, Section 8, emergency housing, vouchers',intro:'Hi, I am Coach Ray. Finding stable housing is everything. Let me ask a few questions to connect you with the right landlords and programs today.'},
{id:'business',icon:'🏢',label:'Hire Workers',color:'#EC4899',desc:'Find qualified workers for your business fast',intro:'Welcome! I am Coach Ray, your staffing specialist. Tell me about your business and I will find qualified candidates in your area right away.'},
{id:'vehicle',icon:'🚗',label:'Buy a Vehicle',color:'#14B8A6',desc:'Military deals, USAA financing, civilian purchases',intro:'Hi! I am Coach Ray. Military or civilian — I can connect you with dealers offering the best deals in your area. Let me find the right fit for you.'},
{id:'debt',icon:'💰',label:'Debt and Tax Relief',color:'#A78BFA',desc:'Tax breaks, debt relief, financial counseling',intro:'Hello, I am Coach Ray. There are programs most people do not know about that can help significantly. Let me find what you qualify for right now.'},
{id:'chores',icon:'🧹',label:'Household Help',color:'#F59E0B',desc:'Cleaning, lawn care, recurring home services',intro:'Hi! I am Coach Ray. Need regular help around the house? I will find reliable local providers on your schedule and budget.'},
]
const QS={
veteran:[
{q:'Are you active duty, a veteran, or military family?',key:'military_status',options:['Active Duty','Veteran','Military Spouse/Family','Reservist/National Guard']},
{q:'Which branch did you serve in?',key:'branch',options:['Army','Navy','Marine Corps','Air Force','Coast Guard','Space Force','National Guard']},
{q:'What years did you serve? (e.g. 2005-2012)',key:'service_years'},
{q:'Do you have a VA disability rating?',key:'disability_rating',options:['No rating','10-30%','40-60%','70-90%','100% P&T','Not sure']},
{q:'Are you currently receiving VA benefits?',key:'va_benefits',options:['Yes full','Yes some','No never applied','No was denied','In process']},
{q:'What are you most interested in today?',key:'primary_need',options:['Home refinancing','Buying a home','VA disability claim','Tax breaks','Car purchase','Education/GED','Employment','Financial relief','All of the above']},
{q:'What is your ZIP code?',key:'zip'},
{q:'Approximate annual household income?',key:'income',options:['Under $30K','$30K-$50K','$50K-$75K','$75K-$100K','Over $100K','Prefer not to say']},
{q:'Do you own your home?',key:'home_owner',options:['Yes I own my home','No I rent','No homeless or in transition','No living with family']},
{q:'When did you last refinance your home?',key:'last_refi',options:['Never refinanced','Less than 1 year ago','1-2 years ago','3-5 years ago','More than 5 years ago','Currently in process']},
{q:'What interest rate are you currently paying?',key:'current_rate',options:['Below 4%','4-5%','5-6%','6-7%','7-8%','Above 8%','I do not know']},
{q:'Approximate home value?',key:'home_value',options:['Under $200K','$200K-$350K','$350K-$500K','$500K-$750K','Over $750K','Not sure']},
{q:'Remaining mortgage balance?',key:'mortgage_balance',options:['Under $100K','$100K-$200K','$200K-$350K','$350K-$500K','Over $500K','I rent']},
{q:'Best phone number to reach you?',key:'phone'},
{q:'Best email for follow-up resources?',key:'contact_email'},
],
job:[
{q:'What type of work are you looking for?',key:'job_type',options:['Healthcare / Caregiver','Construction / Labor','Retail / Customer Service','Food Service','Driving / Delivery','Office / Admin','Tech / IT','Education','Security','Other']},
{q:'What is your ZIP code?',key:'zip'},
{q:'Are you authorized to work in the US?',key:'work_auth',options:['Yes US Citizen','Yes Permanent Resident','Yes Work Visa','No']},
{q:'What is your availability?',key:'availability',options:['Full-time only','Part-time only','Either','Weekends only','Evenings only','Flexible']},
{q:'Do you have a valid drivers license?',key:'drivers_license',options:['Yes clean record','Yes some violations','No','In progress']},
{q:'Highest level of education?',key:'education',options:['Some high school','High school / GED','Some college','Associate degree','Bachelor degree','Graduate degree','Trade certification']},
{q:'How soon are you looking to start?',key:'start_date',options:['Immediately','Within 1 week','Within 2 weeks','Within a month','Just exploring']},
{q:'Are you a veteran or active military?',key:'is_veteran',options:['Yes','No']},
{q:'Hourly pay expectation?',key:'pay',options:['$15-18/hr','$18-22/hr','$22-28/hr','$28-35/hr','$35+/hr','Open']},
{q:'Best phone number to reach you?',key:'phone'},
],
home:[
{q:'What type of home service do you need?',key:'service_type',options:['Plumbing','Electrical','HVAC / AC','Roofing','Painting','Flooring','Landscaping','Cleaning','Pest Control','Handyman','Other']},
{q:'Describe the problem briefly.',key:'problem_desc'},
{q:'What is your ZIP code?',key:'zip'},
{q:'How urgent is this?',key:'urgency',options:['Emergency NOW','Today','This week','Within 2 weeks','Just getting quotes']},
{q:'Do you own or rent?',key:'own_or_rent',options:['Own','Rent landlord approval needed','Rent I will handle it']},
{q:'What is your budget?',key:'budget',options:['Under $200','$200-$500','$500-$1000','$1000-$3000','Over $3000','Need estimate first']},
{q:'Best time for a pro to come?',key:'timing',options:['Morning 8am-12pm','Afternoon 12pm-5pm','Evening 5pm-8pm','Weekend only','Flexible']},
{q:'Best phone number to reach you?',key:'phone'},
],
senior:[
{q:'Who is the care for?',key:'care_for',options:['Myself','My parent','My spouse','Other family member']},
{q:'What type of care is needed?',key:'care_type',options:['In-home a few hours/day','In-home full-time','Assisted living','Memory care / Dementia','Skilled nursing','Respite care','Companionship','Not sure']},
{q:'ZIP code where care is needed?',key:'zip'},
{q:'How soon is care needed?',key:'urgency',options:['Immediately','Within 1 week','Within 1 month','2-3 months','Just researching']},
{q:'Approximate age of the person?',key:'age_range',options:['60-69','70-79','80-89','90+']},
{q:'Monthly budget for care?',key:'budget',options:['Under $1500/mo','$1500-$3000/mo','$3000-$5000/mo','Over $5000/mo','Have long-term care insurance','Need to understand options']},
{q:'Is the person a veteran?',key:'is_veteran',options:['Yes','No','Not sure']},
{q:'Best phone number to reach you?',key:'phone'},
],
education:[
{q:'What educational goal are you working toward?',key:'goal',options:['GED / High School Equivalency','Trade / Vocational Certificate','Associate Degree','Bachelor Degree','Job certification','ESL English as Second Language','Learn a skill','Not sure']},
{q:'What is your ZIP code?',key:'zip'},
{q:'Preferred schedule?',key:'schedule',options:['Daytime','Evening','Weekend','Online self-paced','Hybrid','Flexible']},
{q:'Monthly budget for education?',key:'budget',options:['$0 need funded options','Under $100/mo','$100-$300/mo','Over $300/mo','Have GI Bill or financial aid']},
{q:'Are you a veteran?',key:'is_veteran',options:['Yes','No']},
{q:'Best phone number to reach you?',key:'phone'},
],
housing:[
{q:'What type of housing help do you need?',key:'need_type',options:['Looking to rent','Emergency shelter','Have Section 8 voucher','Facing eviction','Transitional housing','Help with deposit','Sober living','Other']},
{q:'What is your ZIP code?',key:'zip'},
{q:'How urgent is your housing need?',key:'urgency',options:['Tonight or tomorrow','Within 1 week','Within 1 month','Within 3 months','Planning ahead']},
{q:'Approximate monthly income?',key:'income',options:['$0 no income','Under $1000/mo','$1000-$2000/mo','$2000-$3500/mo','Over $3500/mo']},
{q:'Are you a veteran?',key:'is_veteran',options:['Yes','No']},
{q:'Best phone number to reach you?',key:'phone'},
],
business:[
{q:'What type of business do you run?',key:'biz_type',options:['Restaurant / Food','Retail','Healthcare','Construction','Cleaning','Transportation','Tech','Education','Beauty / Wellness','Other']},
{q:'What is your ZIP code?',key:'zip'},
{q:'What type of worker do you need?',key:'worker_type'},
{q:'How many workers?',key:'count',options:['1','2-3','4-10','10+','Ongoing staffing']},
{q:'Pay rate offering?',key:'pay_rate',options:['Minimum wage','$16-20/hr','$20-25/hr','$25-35/hr','Over $35/hr','Salary','Commission']},
{q:'When do you need them to start?',key:'start',options:['Immediately','Within 1 week','Within 2 weeks','Next month','Building pipeline']},
{q:'Best phone for candidates to call?',key:'phone'},
],
vehicle:[
{q:'Are you active military or a veteran?',key:'military',options:['Yes Active Duty','Yes Veteran','Yes Military Family','No Civilian']},
{q:'What type of vehicle?',key:'vehicle_type',options:['Sedan / Car','SUV / Crossover','Truck','Minivan','Electric Vehicle','Motorcycle','Commercial','Not sure']},
{q:'New or used?',key:'new_or_used',options:['New','Used','Either best deal','Certified Pre-Owned']},
{q:'What is your ZIP code?',key:'zip'},
{q:'Budget?',key:'budget',options:['Under $15K','$15K-$25K','$25K-$40K','$40K-$60K','Over $60K','Under $300/mo','$300-$500/mo','Over $500/mo']},
{q:'Credit score?',key:'credit',options:['Excellent 720+','Good 680-719','Fair 620-679','Poor below 620','No credit','Not sure']},
{q:'How soon to buy?',key:'timeline',options:['This week','This month','Within 3 months','Just researching']},
{q:'Best phone number to reach you?',key:'phone'},
],
debt:[
{q:'What type of financial help?',key:'help_type',options:['Credit card debt','Medical bills','Student loans','Tax / IRS issues','Mortgage relief','Bankruptcy consult','Veteran tax breaks','Full review']},
{q:'What is your ZIP code?',key:'zip'},
{q:'Total approximate debt?',key:'total_debt',options:['Under $5K','$5K-$15K','$15K-$30K','$30K-$60K','Over $60K','Not sure']},
{q:'Monthly income?',key:'income',options:['Under $1500','$1500-$3000','$3000-$5000','Over $5000','No income']},
{q:'Are you a veteran?',key:'is_veteran',options:['Yes','No']},
{q:'Best phone number to reach you?',key:'phone'},
],
chores:[
{q:'What type of help do you need?',key:'service',options:['House cleaning','Lawn mowing','Laundry','Grocery errands','Meal prep','Window washing','Organization','Moving help','Pool cleaning','Multiple']},
{q:'What is your ZIP code?',key:'zip'},
{q:'How often?',key:'frequency',options:['One-time','Weekly','Bi-weekly','Monthly','As needed']},
{q:'Budget per visit?',key:'budget',options:['Under $50','$50-$100','$100-$200','$200-$400','Open']},
{q:'Best phone number to reach you?',key:'phone'},
],
}
export default function Dashboard(){
const router=useRouter()
const[view,setView]=useState('missions')
const[mission,setMission]=useState(null)
const[uname,setUname]=useState('')
const[credits,setCredits]=useState(0)
const[waking,setWaking]=useState(true)
const[ready,setReady]=useState(false)
const[hist,setHist]=useState([])
const[appts,setAppts]=useState([])
const[msgs,setMsgs]=useState([])
const[inp,setInp]=useState('')
const[loading,setLoading]=useState(false)
const[qi,setQi]=useState(-1)
const[ans,setAns]=useState({})
const[done,setDone]=useState(false)
const ref=useRef(null)
const tok=()=>typeof window!=='undefined'?localStorage.getItem('wb_token'):null
useEffect(()=>{
const t=tok()
if(!t){router.push('/login');return}
setUname(localStorage.getItem('wb_name')||'there')
init(t)
},[])
useEffect(()=>{ref.current?.scrollIntoView({behavior:'smooth'})},[msgs])
const init=async(t)=>{
setWaking(true)
for(let i=0;i<3;i++){try{const r=await fetch(`${API}/health`,{signal:AbortSignal.timeout(10000)});if(r.ok){setReady(true);break}}catch{await new Promise(r=>setTimeout(r,2000))}}
try{
const[b,h,a]=await Promise.all([fetch(`${API}/credits/balance`,{headers:{Authorization:`Bearer ${t}`}}),fetch(`${API}/sms/history`,{headers:{Authorization:`Bearer ${t}`}}),fetch(`${API}/appointments`,{headers:{Authorization:`Bearer ${t}`}})])
setCredits((await b.json()).credits||0)
setHist((await h.json()).history||[])
setAppts((await a.json()).appointments||[])
}catch{}
setWaking(false)
}
const go=id=>{
const m=MISSIONS.find(x=>x.id===id)
if(!m)return
setMission(id);setQi(0);setAns({});setDone(false)
const q0=QS[id]?.[0]
setMsgs([{r:'a',c:m.intro},{r:'a',c:q0?.q||'How can I help?',o:q0?.options}])
setView('coach')
}
const next=val=>{
const qs=QS[mission]||[]
const cur=qs[qi]
if(!cur)return
const na={...ans,[cur.key]:val}
setAns(na)
setMsgs(m=>[...m,{r:'u',c:val}])
const ni=qi+1
if(ni<qs.length){
setQi(ni)
setTimeout(()=>setMsgs(m=>[...m,{r:'a',c:qs[ni].q,o:qs[ni].options}]),400)
}else{
setQi(-1);setDone(true)
const lb=MISSIONS.find(x=>x.id===mission)?.label
setTimeout(()=>setMsgs(m=>[...m,{r:'a',c:`Perfect ${uname}! Your ${lb} profile is complete and saved. A specialist will reach out to you shortly. Any questions?`}]),400)
try{fetch(`${API}/coach/save-profile`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${tok()||''}`},body:JSON.stringify({mission,answers:na})})}catch{}
}
}
const send=async()=>{
const t=inp.trim()
if(!t||loading)return
if(qi>=0&&!done){next(t);setInp('');return}
setInp('');setMsgs(m=>[...m,{r:'u',c:t}]);setLoading(true)
try{
const res=await fetch(`${API}/coach/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[...msgs.filter(m=>!m.o),{r:'u',c:t}].map(m=>({role:m.r==='a'?'assistant':'user',content:m.c})),language:'en'})})
const d=await res.json();setMsgs(m=>[...m,{r:'a',c:d.reply||'Here to help!'}])
}catch{setMsgs(m=>[...m,{r:'a',c:'Connection issue — try again!'}])}
setLoading(false)
}
const logout=()=>{localStorage.clear();router.push('/')}
const TABS=[{id:'missions',lb:'🎯 My Missions'},{id:'coach',lb:'🤖 Coach Ray'},{id:'history',lb:'📬 SMS History'},{id:'appointments',lb:'📅 Appointments'},{id:'credits',lb:'💳 Credits'}]
return(
<div style={{fontFamily:'system-ui,sans-serif',background:D,color:W,minHeight:'100vh'}}>
<style>{`*{box-sizing:border-box;margin:0;padding:0}.b:hover{opacity:.88;cursor:pointer}input{outline:none}input::placeholder{color:rgba(240,244,248,.3)}.mc:hover{transform:translateY(-2px);transition:all .2s}`}</style>
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
style={{padding:'10px 20px',borderRadius:100,border:'none',fontWeight:700,fontSize:13,cursor:'pointer',background:view===t.id?`linear-gradient(135deg,${A},#D97706)`:'rgba(255,255,255,.06)',color:view===t.id?D:W}}>
{t.lb}
</button>
))}
</div>
{view==='missions'&&(
<div>
<h2 style={{fontSize:26,fontWeight:900,marginBottom:6}}>What can Coach Ray help you with?</h2>
<p style={{color:'rgba(240,244,248,.55)',fontSize:14,marginBottom:28}}>Choose a mission — Coach Ray becomes a specialist and asks the right questions to connect you with results.</p>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14}}>
{MISSIONS.map(m=>(
<div key={m.id} className="mc" onClick={()=>go(m.id)}
style={{padding:'22px 24px',borderRadius:16,background:'rgba(255,255,255,.04)',border:`1px solid ${m.color}44`,borderLeft:`4px solid ${m.color}`,cursor:'pointer'}}>
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
<div style={{maxWidth:680}}>
<div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
{mission&&(<div style={{display:'flex',alignItems:'center',gap:10}}>
<span style={{fontSize:24}}>{MISSIONS.find(x=>x.id===mission)?.icon}</span>
<div>
<div style={{fontWeight:800,fontSize:16}}>{MISSIONS.find(x=>x.id===mission)?.label}</div>
<div style={{fontSize:12,color:done?G:A}}>{done?'✅ Profile complete':`Question ${qi+1} of ${QS[mission]?.length||0}`}</div>
</div>
</div>)}
{!mission&&<h2 style={{fontSize:22,fontWeight:900}}>Coach Ray</h2>}
<button onClick={()=>setView('missions')} className="b" style={{marginLeft:'auto',padding:'7px 14px',borderRadius:100,border:'1px solid rgba(255,255,255,.15)',background:'transparent',color:'rgba(240,244,248,.6)',fontSize:12,cursor:'pointer'}}>← Change Mission</button>
</div>
<div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(16,185,129,.2)',borderRadius:20,overflow:'hidden'}}>
<div style={{height:460,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
{msgs.length===0&&(<div style={{textAlign:'center',padding:'40px 20px',color:'rgba(240,244,248,.4)'}}>
<div style={{fontSize:40,marginBottom:12}}>🤖</div>
<div style={{fontSize:15,marginBottom:16}}>Choose a mission to activate Coach Ray as your specialist</div>
<button onClick={()=>setView('missions')} className="b" style={{padding:'10px 24px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${A},#D97706)`,color:D,fontWeight:700,cursor:'pointer'}}>Choose Mission →</button>
</div>)}
{msgs.map((m,i)=>(
<div key={i}>
<div style={{display:'flex',justifyContent:m.r==='u'?'flex-end':'flex-start',gap:8,alignItems:'flex-end'}}>
{m.r==='a'&&<div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${G},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>🤖</div>}
<div style={{maxWidth:'82%',padding:'11px 15px',borderRadius:m.r==='u'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.r==='u'?`linear-gradient(135deg,${A},#D97706)`:'rgba(255,255,255,.07)',fontSize:14,lineHeight:1.6,color:W,whiteSpace:'pre-wrap'}}>{m.c}</div>
</div>
{m.o&&m.r==='a'&&i===msgs.length-1&&!done&&(
<div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10,paddingLeft:36}}>
{m.o.map((opt,j)=>(
<button key={j} onClick={()=>next(opt)} className="b"
style={{padding:'8px 16px',borderRadius:100,border:'1px solid rgba(16,185,129,.4)',background:'rgba(16,185,129,.08)',color:W,fontSize:13,cursor:'pointer',fontWeight:600}}>{opt}</button>
))}
</div>
)}
</div>
))}
{loading&&<div style={{display:'flex',gap:8,alignItems:'center'}}><div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${G},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🤖</div><span style={{color:'rgba(240,244,248,.4)',fontSize:13}}>Coach Ray is typing...</span></div>}
<div ref={ref}/>
</div>
<div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:8}}>
<input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}}
placeholder={done?'Ask Coach Ray anything...':(mission?'Type your answer or tap an option...':'Choose a mission to start')}
style={{flex:1,padding:'11px 16px',borderRadius:100,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:W,fontSize:14}}/>
<button onClick={send} className="b" style={{padding:'11px 22px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${G},#059669)`,color:W,fontWeight:700,fontSize:14,cursor:'pointer'}}>Send</button>
</div>
</div>
{Object.keys(ans).length>0&&(
<div style={{marginTop:16,padding:'16px 20px',borderRadius:12,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.08)'}}>
<div style={{fontSize:11,fontWeight:700,color:'rgba(240,244,248,.4)',marginBottom:10,letterSpacing:'1px'}}>YOUR SAVED PROFILE</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
{Object.entries(ans).map(([k,v])=>(<div key={k} style={{fontSize:12}}><span style={{color:'rgba(240,244,248,.4)'}}>{k.replace(/_/g,' ')}: </span><span style={{fontWeight:600}}>{v}</span></div>))}
</div>
</div>
)}
</div>
)}
{view==='history'&&(
<div>
<h2 style={{fontSize:24,fontWeight:900,marginBottom:20}}>SMS History</h2>
{hist.length===0?<div style={{padding:32,textAlign:'center',color:'rgba(240,244,248,.4)',background:'rgba(255,255,255,.03)',borderRadius:16,border:'1px solid rgba(255,255,255,.08)'}}>No messages yet. Start a mission to connect!</div>
:<div style={{display:'grid',gap:8}}>{hist.map((h,i)=>(<div key={i} style={{padding:'16px 18px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)'}}>
<div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
<span style={{fontWeight:700}}>{h.recipient_name}</span>
<span style={{fontSize:12,padding:'3px 10px',borderRadius:100,fontWeight:700,background:h.status==='replied'?'rgba(16,185,129,.15)':'rgba(245,158,11,.15)',color:h.status==='replied'?G:A}}>{h.status==='replied'?'💬 Replied':'✅ Sent'}</span>
</div>
<div style={{fontSize:13,color:'rgba(240,244,248,.7)'}}>{h.message_text?.slice(0,120)}...</div>
{h.reply_text&&<div style={{marginTop:8,padding:'8px 12px',borderRadius:8,background:'rgba(16,185,129,.08)',fontSize:13,color:G,fontWeight:600}}>💬 "{h.reply_text}"</div>}
</div>))}</div>}
</div>
)}
{view==='appointments'&&(
<div>
<h2 style={{fontSize:24,fontWeight:900,marginBottom:20}}>Appointments</h2>
{appts.length===0?<div style={{padding:32,textAlign:'center',color:'rgba(240,244,248,.4)',background:'rgba(255,255,255,.03)',borderRadius:16,border:'1px solid rgba(255,255,255,.08)'}}>No appointments yet. Coach Ray books them automatically!</div>
:<div style={{display:'grid',gap:8}}>{appts.map((a,i)=>(<div key={i} style={{padding:'18px 20px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(16,185,129,.2)'}}>
<div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{a.business_name}</div>
<div style={{fontSize:14,color:A,fontWeight:700}}>📅 {new Date(a.appt_datetime).toLocaleString()}</div>
</div>))}</div>}
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
<div style={{display:'grid',gap:10}}>
{[[10,'$1.00'],[50,'$4.50'],[100,'$8.00'],[250,'$18.00'],[500,'$30.00']].map(([c,p])=>(
<div key={String(c)} style={{padding:'16px 20px',borderRadius:12,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div>
<div style={{fontWeight:700,fontSize:15}}>{c} SMS Credits</div>
<div style={{fontSize:13,color:'rgba(240,244,248,.45)',marginTop:2}}>{(parseFloat(String(p).replace('$',''))/parseInt(String(c))*10).toFixed(1)}c per text</div>
</div>
<div style={{display:'flex',alignItems:'center',gap:14}}>
<span style={{color:A,fontWeight:800,fontSize:16}}>{p}</span>
<button className="b" style={{padding:'9px 20px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${A},#D97706)`,color:D,fontWeight:800,fontSize:13,cursor:'pointer'}}>Buy</button>
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
