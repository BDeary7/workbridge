'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const amber = '#F59E0B'; const green = '#10B981'; const dark = '#080C12'; const white = '#F0F4F8'

export default function Dashboard() {
  const router = useRouter()
  const [tab, setTab] = useState('find')
  const [name, setName] = useState('')
  const [credits, setCredits] = useState(0)
  const [zip, setZip] = useState('')
  const [category, setCategory] = useState('')
  const [position, setPosition] = useState('')
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [chatMsgs, setChatMsgs] = useState([{role:'assistant',content:"Hi! I'm Coach Ray 👋 Ready to help you find work. Tell me your job type and ZIP code!"}])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const [waking, setWaking] = useState(true)

  const getToken = () => typeof window!=='undefined' ? localStorage.getItem('wb_token') : null

  useEffect(()=>{
    const token = getToken()
    if(!token){router.push('/login');return}
    setName(localStorage.getItem('wb_name')||'there')
    // Wake up Render + fetch balance
    wakeAndInit(token)
  },[])

  const wakeAndInit = async (token: string) => {
    setWaking(true)
    try {
      // Wake up with timeout retry
      for(let i=0;i<3;i++){
        try{
          const r = await fetch(`${API}/health`,{signal:AbortSignal.timeout(10000)})
          if(r.ok){setApiReady(true);break}
        }catch{await new Promise(r=>setTimeout(r,2000))}
      }
      // Fetch balance
      const res = await fetch(`${API}/credits/balance`,{headers:{Authorization:`Bearer ${token}`}})
      const d = await res.json()
      setCredits(d.credits||0)
      // Fetch history
      const h = await fetch(`${API}/sms/history`,{headers:{Authorization:`Bearer ${token}`}})
      const hd = await h.json()
      setHistory(hd.history||[])
      // Fetch appointments
      const a = await fetch(`${API}/appointments`,{headers:{Authorization:`Bearer ${token}`}})
      const ad = await a.json()
      setAppointments(ad.appointments||[])
    }catch(e){console.log('Init error',e)}
    setWaking(false)
  }

  const searchBusinesses = async()=>{
    if(!zip||!category||!position){setSearchError('Please fill in ZIP, industry, and position.');return}
    setSearching(true); setBusinesses([]); setSelected([]); setSearchError(''); setSent(false)
    const token = getToken()
    try{
      const controller = new AbortController()
      const timeout = setTimeout(()=>controller.abort(),30000)
      const res = await fetch(`${API}/search/businesses`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({zip_code:zip,category,position,radius_miles:10}),
        signal:controller.signal
      })
      clearTimeout(timeout)
      const d = await res.json()
      const bizList = d.businesses||[]
      if(bizList.length===0){
        setSearchError('No businesses found for that area. Try a different ZIP or industry.')
      } else {
        setBusinesses(bizList)
        setMessage(`Hi, my name is ${name}. I'm looking for work as a ${position} in the ${zip} area. I have experience in ${category} and am available to start immediately. Would you be open to a quick call or interview? Thank you!`)
      }
    }catch(e:any){
      if(e.name==='AbortError'){
        setSearchError('Request timed out — Render is waking up. Please try again in 30 seconds.')
      } else {
        setSearchError(`Error: ${e.message}. Check your connection and try again.`)
      }
    }
    setSearching(false)
  }

  const sendBlast = async()=>{
    const targets = businesses.filter(b=>selected.includes(b.phone))
    if(!targets.length||!message)return
    setSending(true)
    const token = getToken()
    try{
      const res = await fetch(`${API}/sms/blast`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({businesses:targets,message,category,position,zip_code:zip})
      })
      const d = await res.json()
      if(d.status==='queued'){
        setSent(true)
        setCredits(d.credits_remaining||0)
        setSelected([])
        setTimeout(()=>{
          fetch(`${API}/sms/history`,{headers:{Authorization:`Bearer ${token||''}`}})
            .then(r=>r.json()).then(d=>setHistory(d.history||[]))
        },2000)
      }
    }catch(e){console.log('Blast error',e)}
    setSending(false)
  }

  const sendChat = async()=>{
    const text = chatInput.trim()
    if(!text||chatLoading)return
    setChatInput('')
    const newMsgs = [...chatMsgs,{role:'user',content:text}]
    setChatMsgs(newMsgs)
    setChatLoading(true)
    try{
      const res = await fetch(`${API}/coach/chat`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:newMsgs.map(m=>({role:m.role,content:m.content})),language:'en'})
      })
      const d = await res.json()
      setChatMsgs(m=>[...m,{role:'assistant',content:d.reply||'Here to help!'}])
    }catch{
      setChatMsgs(m=>[...m,{role:'assistant',content:'Connection issue — try again!'}])
    }
    setChatLoading(false)
  }

  const logout = ()=>{localStorage.clear();router.push('/')}

  const tabs = [
    {id:'find',label:'🔍 Find Jobs'},
    {id:'coach',label:'🤖 Coach Ray'},
    {id:'history',label:'📬 SMS History'},
    {id:'appointments',label:'📅 Interviews'},
    {id:'credits',label:'💳 Credits'}
  ]

  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,minHeight:'100vh'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}.btn:hover{opacity:0.88;cursor:pointer}input,textarea{outline:none}input::placeholder,textarea::placeholder{color:rgba(240,244,248,0.3)}`}</style>
      <nav style={{padding:'0 24px',background:'rgba(8,12,18,0.97)',borderBottom:'1px solid rgba(255,255,255,0.08)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',height:64}}>
          <div style={{fontSize:20,fontWeight:900,cursor:'pointer'}} onClick={()=>router.push('/')}>Work<span style={{color:amber}}>Bridge</span></div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            {waking&&<div style={{fontSize:12,color:'rgba(240,244,248,0.4)'}}>⏳ Waking API...</div>}
            {apiReady&&<div style={{fontSize:12,color:green}}>● API Ready</div>}
            <div style={{fontSize:13,color:'rgba(240,244,248,0.7)'}}>
              👋 {name} · <span style={{color:amber,fontWeight:700}}>{credits} credits</span>
            </div>
            <button onClick={logout} className="btn" style={{padding:'7px 16px',borderRadius:100,border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(240,244,248,0.6)',fontSize:13,cursor:'pointer'}}>
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'flex',gap:8,marginBottom:28,flexWrap:'wrap'}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="btn"
              style={{padding:'10px 20px',borderRadius:100,border:'none',fontWeight:700,fontSize:13,cursor:'pointer',
                background:tab===t.id?`linear-gradient(135deg,${amber},#D97706)`:'rgba(255,255,255,0.06)',
                color:tab===t.id?dark:white,transition:'all 0.2s'}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* FIND JOBS */}
        {tab==='find'&&(
          <div>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:6}}>Find Local Employers</h2>
            <p style={{color:'rgba(240,244,248,0.6)',marginBottom:24,fontSize:14}}>
              Coach Ray writes your message and contacts employers via SMS. Each text costs 1 credit.
            </p>
            {waking&&(
              <div style={{padding:'12px 18px',borderRadius:12,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',marginBottom:16,fontSize:14,color:amber}}>
                ⏳ Warming up the API — this takes ~15 seconds on first load. Please wait...
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:16}}>
              <input value={zip} onChange={e=>setZip(e.target.value)} placeholder="ZIP Code (e.g. 92651)"
                style={{padding:'14px 18px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:15}}/>
              <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Industry (e.g. Healthcare)"
                style={{padding:'14px 18px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:15}}/>
              <input value={position} onChange={e=>setPosition(e.target.value)} placeholder="Position (e.g. Caregiver)"
                onKeyDown={e=>{if(e.key==='Enter')searchBusinesses()}}
                style={{padding:'14px 18px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:15}}/>
            </div>
            <button onClick={searchBusinesses} disabled={searching||waking} className="btn"
              style={{padding:'14px 32px',borderRadius:12,border:'none',background:searching||waking?'rgba(255,255,255,0.1)':`linear-gradient(135deg,${amber},#D97706)`,
                color:searching||waking?'rgba(240,244,248,0.4)':dark,fontWeight:900,fontSize:15,cursor:searching||waking?'not-allowed':'pointer',marginBottom:16,transition:'all 0.2s'}}>
              {searching?'🔍 Searching...':(waking?'⏳ Waiting for API...':'🔍 Find Employers')}
            </button>

            {searchError&&(
              <div style={{padding:'12px 18px',borderRadius:12,background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.3)',marginBottom:16,fontSize:14,color:'#f87171'}}>
                ⚠️ {searchError}
              </div>
            )}

            {businesses.length>0&&(
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <h3 style={{fontSize:16,fontWeight:700}}>Found {businesses.length} employers near {zip}</h3>
                  <button onClick={()=>setSelected(businesses.map(b=>b.phone))} className="btn"
                    style={{fontSize:13,color:amber,background:'none',border:'none',cursor:'pointer',fontWeight:700}}>
                    Select All
                  </button>
                </div>
                <div style={{display:'grid',gap:8,marginBottom:20}}>
                  {businesses.map((b,i)=>(
                    <div key={i} onClick={()=>setSelected(s=>s.includes(b.phone)?s.filter(x=>x!==b.phone):[...s,b.phone])}
                      style={{padding:'14px 18px',borderRadius:12,
                        background:selected.includes(b.phone)?'rgba(245,158,11,0.12)':'rgba(255,255,255,0.04)',
                        border:`1px solid ${selected.includes(b.phone)?amber:'rgba(255,255,255,0.1)'}`,
                        cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all 0.15s'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:15}}>{b.name}</div>
                        <div style={{fontSize:13,color:'rgba(240,244,248,0.5)',marginTop:2}}>{b.address} · {b.phone}</div>
                      </div>
                      <div style={{fontSize:22,marginLeft:12}}>{selected.includes(b.phone)?'✅':'⭕'}</div>
                    </div>
                  ))}
                </div>

                {message&&(
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:13,color:'rgba(240,244,248,0.6)',display:'block',marginBottom:6,fontWeight:600}}>
                      ✏️ Coach Ray's message (edit to personalize):
                    </label>
                    <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
                      style={{width:'100%',padding:'14px 18px',borderRadius:12,background:'rgba(255,255,255,0.07)',
                        border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:14,resize:'vertical',fontFamily:'system-ui'}}/>
                  </div>
                )}

                {selected.length>0&&(
                  <button onClick={sendBlast} disabled={sending} className="btn"
                    style={{padding:'14px 32px',borderRadius:12,border:'none',
                      background:`linear-gradient(135deg,${green},#059669)`,
                      color:white,fontWeight:900,fontSize:15,cursor:'pointer',opacity:sending?0.7:1}}>
                    {sending?'📤 Sending...':`📱 Send to ${selected.length} employer${selected.length>1?'s':''} · ${selected.length} credit${selected.length>1?'s':''}`}
                  </button>
                )}

                {sent&&(
                  <div style={{marginTop:12,padding:'12px 18px',borderRadius:12,background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',color:green,fontWeight:700,fontSize:14}}>
                    ✅ Messages sent! Check SMS History tab for replies. Coach Ray is on the job!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* COACH RAY */}
        {tab==='coach'&&(
          <div style={{maxWidth:620}}>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:6}}>Coach Ray</h2>
            <p style={{color:'rgba(240,244,248,0.6)',marginBottom:20,fontSize:14}}>Your AI career coach — interview prep, resume tips, job search strategy, GED help.</p>
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:20,overflow:'hidden'}}>
              <div style={{height:420,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
                {chatMsgs.map((m,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',gap:8,alignItems:'flex-end'}}>
                    {m.role==='assistant'&&<div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🤖</div>}
                    <div style={{maxWidth:'82%',padding:'10px 14px',
                      borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                      background:m.role==='user'?`linear-gradient(135deg,${amber},#D97706)`:'rgba(255,255,255,0.07)',
                      fontSize:14,lineHeight:1.6,color:white}}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading&&(
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
                    <div style={{color:'rgba(240,244,248,0.5)',fontSize:13}}>Coach Ray is typing...</div>
                  </div>
                )}
              </div>
              <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',gap:8}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendChat()}}
                  placeholder="Ask Coach Ray anything about jobs, interviews, or your career..."
                  style={{flex:1,padding:'11px 16px',borderRadius:100,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:white,fontSize:14}}/>
                <button onClick={sendChat} className="btn"
                  style={{padding:'11px 22px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${green},#059669)`,color:white,fontWeight:700,fontSize:14,cursor:'pointer'}}>
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SMS HISTORY */}
        {tab==='history'&&(
          <div>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:20}}>SMS History</h2>
            {history.length===0?(
              <div style={{padding:'32px',textAlign:'center',color:'rgba(240,244,248,0.4)',fontSize:15,background:'rgba(255,255,255,0.03)',borderRadius:16,border:'1px solid rgba(255,255,255,0.08)'}}>
                No messages sent yet. Use Find Jobs to contact employers!
              </div>
            ):(
              <div style={{display:'grid',gap:8}}>
                {history.map((h,i)=>(
                  <div key={i} style={{padding:'16px 18px',borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                      <div style={{fontWeight:700,fontSize:15}}>{h.recipient_name}</div>
                      <div style={{fontSize:12,padding:'3px 10px',borderRadius:100,fontWeight:700,whiteSpace:'nowrap',
                        background:h.status==='replied'?'rgba(16,185,129,0.15)':h.status==='sent'?'rgba(245,158,11,0.15)':'rgba(255,255,255,0.08)',
                        color:h.status==='replied'?green:h.status==='sent'?amber:'rgba(240,244,248,0.5)'}}>
                        {h.status==='replied'?'💬 Replied':h.status==='sent'?'✅ Sent':'⏳ Pending'}
                      </div>
                    </div>
                    <div style={{fontSize:13,color:'rgba(240,244,248,0.45)',marginBottom:6}}>{h.recipient_address}</div>
                    <div style={{fontSize:13,color:'rgba(240,244,248,0.7)',lineHeight:1.5}}>{h.message_text?.slice(0,120)}...</div>
                    {h.reply_text&&(
                      <div style={{marginTop:10,padding:'8px 12px',borderRadius:8,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',fontSize:13,color:green,fontWeight:600}}>
                        💬 Reply: "{h.reply_text}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPOINTMENTS */}
        {tab==='appointments'&&(
          <div>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:20}}>Interview Schedule</h2>
            {appointments.length===0?(
              <div style={{padding:'32px',textAlign:'center',color:'rgba(240,244,248,0.4)',fontSize:15,background:'rgba(255,255,255,0.03)',borderRadius:16,border:'1px solid rgba(255,255,255,0.08)'}}>
                No interviews scheduled yet. Coach Ray will book them automatically when employers reply!
              </div>
            ):(
              <div style={{display:'grid',gap:8}}>
                {appointments.map((a,i)=>(
                  <div key={i} style={{padding:'18px 20px',borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(16,185,129,0.2)'}}>
                    <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{a.business_name}</div>
                    <div style={{fontSize:14,color:amber,fontWeight:700,marginBottom:6}}>📅 {new Date(a.appt_datetime).toLocaleString()}</div>
                    {a.notes&&<div style={{fontSize:13,color:'rgba(240,244,248,0.6)'}}>{a.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREDITS */}
        {tab==='credits'&&(
          <div style={{maxWidth:520}}>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:6}}>Credits & Subscription</h2>
            <p style={{color:'rgba(240,244,248,0.6)',fontSize:14,marginBottom:24}}>1 credit = 1 SMS to an employer. $9.99/month includes 50 credits + unlimited Coach Ray.</p>
            <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:16,padding:28,marginBottom:20,textAlign:'center'}}>
              <div style={{fontSize:52,fontWeight:900,color:amber,lineHeight:1}}>{credits}</div>
              <div style={{fontSize:15,color:'rgba(240,244,248,0.6)',marginTop:6}}>Credits remaining · $0.10 per SMS</div>
            </div>
            <div style={{display:'grid',gap:10}}>
              {[[10,'$1.00'],[50,'$4.50'],[100,'$8.00'],[250,'$18.00'],[500,'$30.00']].map(([c,p])=>(
                <div key={c} style={{padding:'16px 20px',borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:15}}>{c} SMS Credits</div>
                    <div style={{fontSize:13,color:'rgba(240,244,248,0.45)',marginTop:2}}>
                      ${(parseFloat(String(p).replace('$',''))/parseInt(String(c))*10).toFixed(1)}¢ per text
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div style={{color:amber,fontWeight:800,fontSize:16}}>{p}</div>
                    <button className="btn" style={{padding:'9px 20px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontWeight:800,fontSize:13,cursor:'pointer'}}>
                      Buy
                    </button>
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
