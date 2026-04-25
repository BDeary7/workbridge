'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const amber = '#F59E0B'
const green = '#10B981'
const dark = '#080C12'
const white = '#F0F4F8'

export default function Dashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<'search'|'history'|'appointments'|'credits'>('search')
  const [token, setToken] = useState('')
  const [userName, setUserName] = useState('')
  const [credits, setCredits] = useState(0)
  const [zip, setZip] = useState('')
  const [category, setCategory] = useState('')
  const [position, setPosition] = useState('')
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [sentMsg, setSentMsg] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([{role:'assistant',content:"Hi! I'm Coach Ray 👋 How can I help you find work today?"}])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('wb_token') || ''
    const n = localStorage.getItem('wb_name') || ''
    const c = parseInt(localStorage.getItem('wb_credits') || '0')
    if (!t) { router.push('/login'); return }
    setToken(t); setUserName(n); setCredits(c)
    fetchBalance(t)
  }, [])

  const fetchBalance = async (t: string) => {
    try {
      const res = await fetch(API + '/credits/balance', { headers: { Authorization: `Bearer ${t}` } })
      const data = await res.json()
      setCredits(data.credits)
    } catch {}
  }

  const logout = () => {
    localStorage.clear()
    router.push('/')
  }

  const searchBusinesses = async () => {
    if (!zip || !category || !position) return
    setSearching(true); setBusinesses([]); setSelected([])
    try {
      const res = await fetch(API + '/search/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ zip_code: zip, category, position, radius_miles: 10 })
      })
      const data = await res.json()
      setBusinesses(data.businesses || [])
      // Auto-generate message
      setMessage(`Hi, I'm ${userName}. I have experience in ${position} and I'm looking for work in the ${zip} area. I'd love to discuss any opportunities you may have. Please feel free to reply to this message. Thank you!`)
    } catch { setBusinesses([]) }
    setSearching(false)
  }

  const toggleSelect = (phone: string) => {
    setSelected(s => s.includes(phone) ? s.filter(p => p !== phone) : [...s, phone])
  }

  const sendBlast = async () => {
    if (!selected.length || !message) return
    setSending(true); setSentMsg('')
    try {
      const bizToSend = businesses.filter(b => selected.includes(b.phone))
      const res = await fetch(API + '/sms/blast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ businesses: bizToSend, message, category, position, zip_code: zip })
      })
      const data = await res.json()
      setSentMsg(`✅ Sent to ${data.count} businesses! ${data.credits_remaining} credits remaining.`)
      setCredits(data.credits_remaining)
      setSelected([])
      fetchHistory()
    } catch (e: any) {
      setSentMsg('❌ Error sending. Check your credits.')
    }
    setSending(false)
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch(API + '/sms/history', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setHistory(data.history || [])
    } catch {}
  }

  const fetchAppointments = async () => {
    try {
      const res = await fetch(API + '/appointments', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch {}
  }

  useEffect(() => {
    if (tab === 'history') fetchHistory()
    if (tab === 'appointments') fetchAppointments()
  }, [tab])

  const sendChat = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    setChatInput('')
    const newMsgs = [...messages, { role: 'user', content: text }]
    setMessages(newMsgs)
    setChatLoading(true)
    try {
      const res = await fetch(API + '/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), language: 'en' })
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply || "I'm here to help!" }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Connection issue — try again!" }])
    }
    setChatLoading(false)
  }

  const tabs = [
    { id: 'search', label: '🔍 Find Jobs' },
    { id: 'history', label: '📨 SMS History' },
    { id: 'appointments', label: '📅 Interviews' },
    { id: 'credits', label: '💳 Credits' },
  ]

  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,minHeight:'100vh'}}>
      {/* NAV */}
      <nav style={{padding:'0 24px',background:'rgba(8,12,18,0.97)',borderBottom:'1px solid rgba(255,255,255,0.08)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',height:64}}>
          <div style={{fontSize:20,fontWeight:900}}>Work<span style={{color:amber}}>Bridge</span></div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{padding:'6px 16px',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:100,fontSize:13,fontWeight:700,color:amber}}>
              {credits} credits
            </div>
            <div style={{fontSize:13,color:'rgba(240,244,248,0.6)'}}>👤 {userName}</div>
            <button onClick={logout} style={{padding:'7px 16px',borderRadius:100,border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'rgba(240,244,248,0.6)',fontSize:13,cursor:'pointer'}}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px'}}>
        {/* TABS */}
        <div style={{display:'flex',gap:8,marginBottom:28,flexWrap:'wrap'}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{padding:'10px 20px',borderRadius:100,border:'none',background:tab===t.id?amber:'rgba(255,255,255,0.07)',color:tab===t.id?dark:white,fontWeight:700,fontSize:13,cursor:'pointer',transition:'all 0.2s'}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* SEARCH TAB */}
        {tab === 'search' && (
          <div>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:20}}>Find Local Employers</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginBottom:16}}>
              <input value={zip} onChange={e=>setZip(e.target.value)}
                placeholder="ZIP code (e.g. 92651)"
                style={{padding:'13px 16px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:14,outline:'none'}}/>
              <input value={category} onChange={e=>setCategory(e.target.value)}
                placeholder="Industry (e.g. Healthcare)"
                style={{padding:'13px 16px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:14,outline:'none'}}/>
              <input value={position} onChange={e=>setPosition(e.target.value)}
                placeholder="Position (e.g. Caregiver)"
                style={{padding:'13px 16px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:14,outline:'none'}}/>
              <button onClick={searchBusinesses} disabled={searching}
                style={{padding:'13px 20px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontWeight:900,fontSize:14,cursor:'pointer',opacity:searching?0.7:1}}>
                {searching ? 'Searching...' : '🔍 Search'}
              </button>
            </div>

            {businesses.length > 0 && (
              <div>
                <div style={{marginBottom:12,fontSize:14,color:'rgba(240,244,248,0.6)'}}>
                  Found {businesses.length} businesses — select to SMS blast
                </div>
                <div style={{display:'grid',gap:8,marginBottom:20}}>
                  {businesses.map((b, i) => (
                    <div key={i} onClick={() => toggleSelect(b.phone)}
                      style={{padding:'14px 18px',borderRadius:14,background:selected.includes(b.phone)?'rgba(245,158,11,0.1)':'rgba(255,255,255,0.04)',border:`1px solid ${selected.includes(b.phone)?amber:'rgba(255,255,255,0.08)'}`,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all 0.15s'}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{b.name}</div>
                        <div style={{fontSize:12,color:'rgba(240,244,248,0.55)',marginTop:2}}>{b.phone} · {b.address}</div>
                      </div>
                      <div style={{fontSize:20}}>{selected.includes(b.phone) ? '✅' : '⭕'}</div>
                    </div>
                  ))}
                </div>

                {selected.length > 0 && (
                  <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:16,padding:20}}>
                    <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Your SMS Message ({selected.length} selected · {selected.length} credits)</div>
                    <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
                      style={{width:'100%',padding:'12px 16px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:13,outline:'none',resize:'vertical',lineHeight:1.6}}/>
                    {sentMsg && (
                      <div style={{margin:'10px 0',padding:'10px 14px',background:sentMsg.startsWith('✅')?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${sentMsg.startsWith('✅')?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`,borderRadius:10,fontSize:13}}>
                        {sentMsg}
                      </div>
                    )}
                    <button onClick={sendBlast} disabled={sending||credits<selected.length}
                      style={{marginTop:12,padding:'12px 28px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${green},#059669)`,color:white,fontWeight:900,fontSize:14,cursor:'pointer',opacity:(sending||credits<selected.length)?0.5:1}}>
                      {sending ? 'Sending...' : `📨 Send to ${selected.length} businesses`}
                    </button>
                    {credits < selected.length && (
                      <div style={{marginTop:8,fontSize:12,color:'#EF4444'}}>Not enough credits. Go to Credits tab to buy more.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:20}}>SMS History</h2>
            {history.length === 0 ? (
              <div style={{textAlign:'center',padding:60,color:'rgba(240,244,248,0.4)'}}>No messages sent yet. Use Find Jobs to get started.</div>
            ) : (
              <div style={{display:'grid',gap:8}}>
                {history.map((h, i) => (
                  <div key={i} style={{padding:'14px 18px',borderRadius:14,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                      <div style={{fontWeight:700}}>{h.recipient_name}</div>
                      <div style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:h.status==='replied'?'rgba(16,185,129,0.15)':h.status==='sent'?'rgba(245,158,11,0.15)':'rgba(255,255,255,0.08)',color:h.status==='replied'?green:h.status==='sent'?amber:'rgba(240,244,248,0.5)',fontWeight:700}}>
                        {h.status?.toUpperCase()}
                      </div>
                    </div>
                    <div style={{fontSize:12,color:'rgba(240,244,248,0.55)',marginBottom:6}}>{h.recipient_phone} · {h.position} · {h.zip_code}</div>
                    <div style={{fontSize:13,color:'rgba(240,244,248,0.75)',marginBottom:h.reply_text?8:0}}>{h.message_text}</div>
                    {h.reply_text && (
                      <div style={{padding:'8px 12px',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,fontSize:12,color:green}}>
                        💬 Reply: {h.reply_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {tab === 'appointments' && (
          <div>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:20}}>Interview Appointments</h2>
            {appointments.length === 0 ? (
              <div style={{textAlign:'center',padding:60,color:'rgba(240,244,248,0.4)'}}>No interviews scheduled yet. Coach Ray schedules these when businesses reply.</div>
            ) : (
              <div style={{display:'grid',gap:8}}>
                {appointments.map((a, i) => (
                  <div key={i} style={{padding:'16px 20px',borderRadius:14,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{a.business_name}</div>
                    <div style={{fontSize:13,color:amber,marginBottom:4}}>📅 {new Date(a.appt_datetime).toLocaleString()}</div>
                    <div style={{fontSize:12,color:'rgba(240,244,248,0.55)'}}>{a.business_phone}</div>
                    {a.notes && <div style={{marginTop:8,fontSize:13,color:'rgba(240,244,248,0.75)'}}>{a.notes}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREDITS TAB */}
        {tab === 'credits' && (
          <div>
            <h2 style={{fontSize:24,fontWeight:900,marginBottom:8}}>SMS Credits</h2>
            <div style={{fontSize:14,color:'rgba(240,244,248,0.6)',marginBottom:24}}>You have <span style={{color:amber,fontWeight:700}}>{credits} credits</span> remaining. Each credit = 1 SMS to 1 business.</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
              {[[10,'$1.00'],[50,'$4.50'],[100,'$8.00'],[250,'$18.00'],[500,'$30.00']].map(([c,p]) => (
                <div key={c} style={{padding:'20px',borderRadius:16,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',textAlign:'center'}}>
                  <div style={{fontSize:28,fontWeight:900,color:amber,marginBottom:4}}>{c}</div>
                  <div style={{fontSize:13,color:'rgba(240,244,248,0.6)',marginBottom:12}}>credits · {p}</div>
                  <button style={{padding:'9px 20px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontWeight:800,fontSize:13,cursor:'pointer'}}>
                    Buy
                  </button>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:'14px 18px',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:12,fontSize:13,color:'rgba(240,244,248,0.7)'}}>
              💡 Your subscription includes <strong style={{color:green}}>$9.99/month</strong> for unlimited Coach Ray access. Credits are used for SMS blasts at $0.10 each.
            </div>
          </div>
        )}
      </div>

      {/* COACH RAY FLOAT */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          style={{position:'fixed',bottom:24,right:24,width:60,height:60,borderRadius:'50%',border:'none',background:`linear-gradient(135deg,${green},#059669)`,color:white,fontSize:26,zIndex:200,boxShadow:'0 8px 24px rgba(16,185,129,0.4)',cursor:'pointer'}}>
          🤖
        </button>
      )}
      {chatOpen && (
        <div style={{position:'fixed',bottom:24,right:24,width:340,height:480,background:'#0D1117',border:'1px solid rgba(16,185,129,0.25)',borderRadius:20,display:'flex',flexDirection:'column',zIndex:200,boxShadow:'0 24px 60px rgba(0,0,0,0.6)',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(16,185,129,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:white}}>Coach Ray</div>
                <div style={{fontSize:10,color:green}}>● Online · WorkBridge AI</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{background:'none',border:'none',color:'rgba(240,244,248,0.4)',cursor:'pointer',fontSize:20}}>✕</button>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:10}}>
            {messages.map((m, i) => (
              <div key={i} style={{display:'flex',gap:8,justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end'}}>
                {m.role==='assistant' && <div style={{width:24,height:24,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>🤖</div>}
                <div style={{maxWidth:'80%',padding:'10px 13px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?`linear-gradient(135deg,${amber},#D97706)`:'rgba(255,255,255,0.06)',fontSize:13,lineHeight:1.55,color:white}}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>🤖</div>
                <div style={{padding:'10px 14px',background:'rgba(255,255,255,0.06)',borderRadius:'16px 16px 16px 4px'}}>...</div>
              </div>
            )}
          </div>
          <div style={{padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{display:'flex',gap:8}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')sendChat()}}
                placeholder="Ask Coach Ray..."
                style={{flex:1,padding:'10px 14px',borderRadius:100,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:white,fontSize:13,outline:'none'}}/>
              <button onClick={sendChat}
                style={{width:38,height:38,borderRadius:'50%',border:'none',background:`linear-gradient(135deg,${green},#059669)`,cursor:'pointer',fontSize:16,color:white}}>→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
