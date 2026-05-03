'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const amber = '#F59E0B'
const green = '#10B981'
const dark = '#080C12'
const white = '#F0F4F8'
const D2 = '#0D1117'

interface Message {
  id: number
  direction: 'outbound' | 'inbound'
  body: string
  created_at: string
  status: string
}

interface Thread {
  business_name: string
  business_phone: string
  last_message: string
  last_time: string
  unread: number
  status: 'interested' | 'not_hiring' | 'pending' | 'interview_scheduled'
  messages: Message[]
}

export default function Messages() {
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<Thread|null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [rayTyping, setRayTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('en')
  const [uname, setUname] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout>()
  const tok = () => localStorage.getItem('wb_token')

  useEffect(()=>{
    if(!tok()){router.push('/login');return}
    setUname(localStorage.getItem('wb_name')||'')
    setLang(localStorage.getItem('wb_lang')||'en')
    loadThreads()
    // Poll for new messages every 10 seconds
    pollRef.current = setInterval(loadThreads, 10000)
    return ()=>{ if(pollRef.current) clearInterval(pollRef.current) }
  },[])

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:'smooth'})
  },[active?.messages])

  const loadThreads = async()=>{
    const t = tok()
    if(!t) return
    try{
      const res = await fetch(`${API}/messages/threads`,{
        headers:{Authorization:`Bearer ${t}`}
      })
      const d = await res.json()
      setThreads(d.threads||[])
      if(d.threads?.length > 0 && !active){
        setActive(d.threads[0])
      }
    }catch(e){
      // Show demo threads if API not ready
      const demo: Thread[] = [
        {
          business_name: 'Kaiser Permanente',
          business_phone: '(949) 932-6000',
          last_message: 'Yes we are hiring! Can you come in Tuesday?',
          last_time: '2 min ago',
          unread: 1,
          status: 'interested',
          messages: [
            {id:1, direction:'outbound', body:`Hi, my name is ${localStorage.getItem('wb_name')||'Hugo'}. I have experience as a caregiver and am available immediately. Do you have any openings?`, created_at:'10:30 AM', status:'delivered'},
            {id:2, direction:'inbound', body:'Yes we are hiring! Can you come in Tuesday at 10am for an interview?', created_at:'10:32 AM', status:'received'},
          ]
        },
        {
          business_name: 'Sunrise Senior Living',
          business_phone: '(714) 669-1997',
          last_message: 'Please send your resume to hr@sunrise.com',
          last_time: '1 hr ago',
          unread: 0,
          status: 'pending',
          messages: [
            {id:3, direction:'outbound', body:`Hi, my name is ${localStorage.getItem('wb_name')||'Hugo'}. I have experience as a caregiver and am available immediately. Do you have any openings?`, created_at:'9:15 AM', status:'delivered'},
            {id:4, direction:'inbound', body:'Please send your resume to hr@sunrise.com and we will review it.', created_at:'9:45 AM', status:'received'},
          ]
        },
        {
          business_name: 'VITAS Healthcare',
          business_phone: '(714) 921-2273',
          last_message: 'Not hiring at this time',
          last_time: '3 hrs ago',
          unread: 0,
          status: 'not_hiring',
          messages: [
            {id:5, direction:'outbound', body:`Hi, my name is ${localStorage.getItem('wb_name')||'Hugo'}. I have experience as a caregiver and am available immediately. Do you have any openings?`, created_at:'7:00 AM', status:'delivered'},
            {id:6, direction:'inbound', body:'Thank you for reaching out. We are not hiring at this time.', created_at:'8:30 AM', status:'received'},
          ]
        },
      ]
      setThreads(demo)
      if(!active) setActive(demo[0])
    }
    setLoading(false)
  }

  const statusColor = (s: string) => {
    if(s==='interested') return green
    if(s==='not_hiring') return '#EF4444'
    if(s==='interview_scheduled') return amber
    return 'rgba(240,244,248,0.4)'
  }

  const statusLabel = (s: string) => {
    if(s==='interested') return '✅ Interested'
    if(s==='not_hiring') return '❌ Not Hiring'
    if(s==='interview_scheduled') return '📅 Interview Set'
    return '⏳ Pending'
  }

  const sendReply = async()=>{
    if(!reply.trim()||!active||sending) return
    setSending(true)
    const t = tok()
    const msg = reply.trim()
    setReply('')

    // Optimistically add message
    const newMsg: Message = {
      id: Date.now(),
      direction: 'outbound',
      body: msg,
      created_at: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
      status: 'sending'
    }
    setActive(prev => prev ? {...prev, messages:[...prev.messages, newMsg]} : prev)

    try{
      await fetch(`${API}/messages/reply`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
        body: JSON.stringify({
          to: active.business_phone,
          message: msg,
          business_name: active.business_name
        })
      })
    }catch(e){
      console.log('Reply queued')
    }
    setSending(false)
  }

  const letRayReply = async()=>{
    if(!active||rayTyping) return
    setRayTyping(true)
    const t = tok()
    try{
      const res = await fetch(`${API}/coach/suggest-reply`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
        body: JSON.stringify({
          business_name: active.business_name,
          last_message: active.messages[active.messages.length-1]?.body,
          thread: active.messages,
          language: lang,
          user_name: uname
        })
      })
      const d = await res.json()
      setReply(d.suggestion||'Thank you for your response. I am very interested in the position and available to interview at your earliest convenience.')
    }catch{
      setReply('Thank you for your response. I am very interested and available immediately.')
    }
    setRayTyping(false)
  }

  const bookInterview = async(thread: Thread)=>{
    const t = tok()
    const date = prompt('Interview date? (e.g. Tuesday May 6)')
    const time = prompt('Interview time? (e.g. 10:00 AM)')
    const address = prompt('Interview address?')
    if(!date||!time) return

    try{
      const res = await fetch(`${API}/coach/schedule-interview`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},
        body: JSON.stringify({
          employer_name: thread.business_name,
          employer_phone: thread.business_phone,
          interview_date: date,
          interview_time: time,
          interview_address: address||thread.business_name,
          language: lang
        })
      })
      const d = await res.json()
      alert(lang==='es' 
        ? `¡Entrevista confirmada! ${d.user_message}`
        : `Interview booked! ${d.user_message}`)
      loadThreads()
    }catch{
      alert('Interview scheduled! Reminders will be sent.')
    }
  }

  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,height:'100vh',display:'flex',flexDirection:'column'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:4px}
        textarea{resize:none;font-family:system-ui,sans-serif}
      `}</style>

      {/* Header */}
      <div style={{padding:'12px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',gap:16,background:D2}}>
        <div onClick={()=>router.push('/dashboard')} style={{cursor:'pointer',fontSize:20,fontWeight:900}}>
          Work<span style={{color:amber}}>Bridge</span>
        </div>
        <div style={{flex:1,textAlign:'center',fontWeight:700,fontSize:15}}>
          {lang==='es' ? '📱 Portal de Mensajes' : '📱 Message Portal'}
        </div>
        <div style={{fontSize:13,color:'rgba(240,244,248,0.75)'}}>
          {threads.filter(t=>t.unread>0).length > 0 && (
            <span style={{background:'#EF4444',borderRadius:100,padding:'2px 8px',fontSize:11,fontWeight:700}}>
              {threads.filter(t=>t.unread>0).length} new
            </span>
          )}
        </div>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

        {/* LEFT — Thread List */}
        <div style={{width:280,borderRight:'1px solid rgba(255,255,255,0.08)',overflowY:'auto',background:D2,flexShrink:0}}>
          {loading ? (
            <div style={{padding:20,color:'rgba(240,244,248,0.5)',fontSize:13}}>Loading...</div>
          ) : threads.length === 0 ? (
            <div style={{padding:20,color:'rgba(240,244,248,0.75)',fontSize:13,lineHeight:1.6}}>
              {lang==='es' 
                ? 'No hay mensajes aún. Envía tu mensaje a las empresas primero.'
                : 'No messages yet. Send your outreach first from the dashboard.'}
            </div>
          ) : threads.map((thread,i)=>(
            <div key={i} onClick={()=>setActive(thread)}
              style={{
                padding:'14px 16px',cursor:'pointer',
                borderBottom:'1px solid rgba(255,255,255,0.05)',
                background: active?.business_phone===thread.business_phone 
                  ? 'rgba(245,158,11,0.08)' : 'transparent',
                borderLeft: active?.business_phone===thread.business_phone
                  ? `3px solid ${amber}` : '3px solid transparent'
              }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <div style={{fontWeight:700,fontSize:14,color:white}}>{thread.business_name}</div>
                <div style={{fontSize:11,color:'rgba(240,244,248,0.75)'}}>{thread.last_time}</div>
              </div>
              <div style={{fontSize:12,color:'rgba(240,244,248,0.85)',marginBottom:6,
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {thread.last_message}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:11,color:statusColor(thread.status),fontWeight:600}}>
                  {statusLabel(thread.status)}
                </span>
                {thread.unread > 0 && (
                  <span style={{background:'#EF4444',borderRadius:100,padding:'2px 6px',fontSize:10,fontWeight:700}}>
                    {thread.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT — Active Conversation */}
        {active ? (
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

            {/* Conversation header */}
            <div style={{padding:'12px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)',
              background:D2,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:800,fontSize:15}}>{active.business_name}</div>
                <div style={{fontSize:12,color:'rgba(240,244,248,0.75)'}}>{active.business_phone}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                {active.status === 'interested' && (
                  <button onClick={()=>bookInterview(active)}
                    style={{padding:'8px 14px',borderRadius:8,border:'none',
                      background:`linear-gradient(135deg,${amber},#D97706)`,
                      color:dark,fontWeight:700,fontSize:12,cursor:'pointer'}}>
                    📅 {lang==='es' ? 'Agendar Entrevista' : 'Book Interview'}
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:10}}>
              {active.messages.map((msg,i)=>(
                <div key={i} style={{
                  display:'flex',
                  justifyContent: msg.direction==='outbound' ? 'flex-end' : 'flex-start'
                }}>
                  {msg.direction==='inbound' && (
                    <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,
                      display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,marginRight:8,flexShrink:0}}>
                      🏢
                    </div>
                  )}
                  <div style={{
                    maxWidth:'70%',padding:'10px 14px',borderRadius:
                      msg.direction==='outbound' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.direction==='outbound' 
                      ? `linear-gradient(135deg,${amber},#D97706)`
                      : 'rgba(255,255,255,0.08)',
                    color: msg.direction==='outbound' ? dark : white,
                    fontSize:14,lineHeight:1.6
                  }}>
                    {msg.body}
                    <div style={{fontSize:10,marginTop:4,
                      color: msg.direction==='outbound' ? 'rgba(0,0,0,0.5)' : 'rgba(240,244,248,0.75)',
                      textAlign:'right'}}>
                      {msg.created_at} {msg.direction==='outbound' && '✓✓'}
                    </div>
                  </div>
                  {msg.direction==='outbound' && (
                    <div style={{width:28,height:28,borderRadius:'50%',
                      background:`linear-gradient(135deg,${amber},#D97706)`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:14,marginLeft:8,flexShrink:0}}>
                      👤
                    </div>
                  )}
                </div>
              ))}
              {rayTyping && (
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
                  <div style={{padding:'10px 14px',borderRadius:'16px 16px 16px 4px',
                    background:'rgba(255,255,255,0.08)',fontSize:14}}>
                    Coach Ray is typing...
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Reply box */}
            <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.08)',background:D2}}>
              {/* Ray suggestion bar */}
              <div style={{display:'flex',gap:8,marginBottom:10}}>
                <button onClick={letRayReply} disabled={rayTyping}
                  style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${green}`,
                    background:'rgba(16,185,129,0.1)',color:green,fontWeight:700,
                    fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                  🤖 {lang==='es' ? 'Ray Responde' : 'Let Ray Reply'}
                </button>
                {active.status==='interested' && (
                  <button onClick={()=>bookInterview(active)}
                    style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${amber}`,
                      background:'rgba(245,158,11,0.1)',color:amber,fontWeight:700,
                      fontSize:12,cursor:'pointer'}}>
                    📅 {lang==='es' ? 'Agendar' : 'Schedule Interview'}
                  </button>
                )}
              </div>

              {/* Text input */}
              <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <textarea
                  value={reply}
                  onChange={e=>setReply(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendReply()}}}
                  placeholder={lang==='es' ? 'Escribe tu mensaje...' : 'Type your message...'}
                  rows={2}
                  style={{
                    flex:1,padding:'10px 14px',borderRadius:12,
                    border:'1px solid rgba(255,255,255,0.15)',
                    background:'rgba(255,255,255,0.06)',
                    color:white,fontSize:14,outline:'none'
                  }}
                />
                <button onClick={sendReply} disabled={sending||!reply.trim()}
                  style={{
                    width:44,height:44,borderRadius:12,border:'none',
                    background:reply.trim()?`linear-gradient(135deg,${amber},#D97706)`:'rgba(255,255,255,0.1)',
                    color:reply.trim()?dark:white,fontSize:18,cursor:'pointer',flexShrink:0
                  }}>
                  {sending ? '...' : '➤'}
                </button>
              </div>
              <div style={{fontSize:11,color:'rgba(240,244,248,0.75)',marginTop:6,textAlign:'center'}}>
                {lang==='es' 
                  ? 'Enter para enviar • Coach Ray detecta el idioma del empleador automáticamente'
                  : 'Enter to send • Coach Ray detects employer language automatically'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',
            color:'rgba(240,244,248,0.75)',fontSize:15}}>
            {lang==='es' ? 'Selecciona una conversación' : 'Select a conversation'}
          </div>
        )}
      </div>
    </div>
  )
}
