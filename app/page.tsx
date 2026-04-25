'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'

export default function Home() {
  const [lang, setLang] = useState('en')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([{role:'assistant',content:"Hi! I'm Coach Ray 👋 I help people find jobs. What can I help you with today?"}])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const isEs = lang === 'es'
  const amber = '#F59E0B'
  const green = '#10B981'
  const dark = '#080C12'
  const white = '#F0F4F8'

  const handleSignup = async () => {
    if (!email.trim() || !name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({name, email, password: Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2), language: lang})
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('wb_token', data.token)
        localStorage.setItem('wb_name', name)
        setSubmitted(true)
        setTimeout(() => router.push('/dashboard'), 1200)
      } else {
        router.push('/login')
      }
    } catch {
      setSubmitted(true)
      setTimeout(() => router.push('/dashboard'), 1200)
    }
    setSubmitting(false)
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newMsgs = [...messages, {role:'user',content:text}]
    setMessages(newMsgs)
    setLoading(true)
    bottomRef.current?.scrollIntoView({behavior:'smooth'})
    try {
      const res = await fetch(`${API}/coach/chat`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages: newMsgs.map(m=>({role:m.role,content:m.content})), language: lang})
      })
      const data = await res.json()
      setMessages(m=>[...m,{role:'assistant',content:data.reply||"Let me help you find work!"}])
    } catch {
      setMessages(m=>[...m,{role:'assistant',content:"Connection issue — try again!"}])
    }
    setLoading(false)
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}),100)
  }

  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,minHeight:'100vh',overflowX:'hidden'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}.btn:hover{opacity:0.88;transform:translateY(-1px);cursor:pointer}input::placeholder{color:rgba(240,244,248,0.3)}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.3)}`}</style>
      <nav style={{padding:'0 24px',background:'rgba(8,12,18,0.97)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.08)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',height:64}}>
          <div style={{fontSize:22,fontWeight:900}}>Work<span style={{color:amber}}>Bridge</span></div>
          <div style={{display:'flex',gap:4,background:'rgba(255,255,255,0.06)',borderRadius:100,padding:4}}>
            {['en','es'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} className="btn" style={{padding:'6px 16px',borderRadius:100,border:'none',fontWeight:700,fontSize:13,background:lang===l?amber:'transparent',color:lang===l?dark:'rgba(240,244,248,0.6)'}}>
                {l==='en'?'🇺🇸 EN':'🇲🇽 ES'}
              </button>
            ))}
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <button className="btn" onClick={()=>router.push('/login')} style={{padding:'9px 18px',borderRadius:100,border:'1px solid rgba(255,255,255,0.2)',background:'transparent',color:white,fontWeight:700,fontSize:13}}>
              {isEs?'Iniciar Sesión':'Log In'}
            </button>
            <button className="btn" onClick={()=>setChatOpen(true)} style={{padding:'9px 18px',borderRadius:100,border:'1px solid rgba(16,185,129,0.4)',background:'rgba(16,185,129,0.1)',color:green,fontWeight:700,fontSize:13}}>
              🤖 Coach Ray
            </button>
            <button className="btn" onClick={()=>document.getElementById('signup')?.scrollIntoView({behavior:'smooth'})} style={{padding:'9px 22px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontWeight:800,fontSize:13}}>
              {isEs?'Empieza Gratis →':'Start Free →'}
            </button>
          </div>
        </div>
      </nav>
      <section style={{minHeight:'90vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'80px 24px',animation:'fadeUp 0.5s ease'}}>
        <div style={{maxWidth:820}}>
          <div style={{display:'inline-flex',padding:'7px 20px',borderRadius:100,background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',fontSize:13,fontWeight:700,color:amber,marginBottom:32}}>
            🌉 {isEs?'Ya Disponible — Construido para Hugo':'Now Live — Built for Hugo'}
          </div>
          <h1 style={{fontSize:'clamp(48px,9vw,96px)',fontWeight:900,lineHeight:0.92,letterSpacing:'-3px',marginBottom:28}}>
            <span style={{display:'block'}}>{isEs?'Encuentra trabajo.':'Find work.'}</span>
            <span style={{display:'block',color:amber}}>{isEs?'Envía un texto.':'Send a text.'}</span>
            <span style={{display:'block'}}>{isEs?'Consigue empleo.':'Get hired.'}</span>
          </h1>
          <p style={{fontSize:'clamp(17px,2.2vw,21px)',color:'rgba(240,244,248,0.82)',lineHeight:1.65,maxWidth:560,margin:'0 auto 44px'}}>
            {isEs?'WorkBridge conecta a buscadores de empleo directamente con empleadores locales por SMS. Sin currículum. Sin intermediarios.':'WorkBridge connects job seekers directly with local employers via SMS. No resume required. No middleman. No waiting.'}
          </p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:70}}>
            <button className="btn" onClick={()=>document.getElementById('signup')?.scrollIntoView({behavior:'smooth'})} style={{padding:'17px 40px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontSize:17,fontWeight:900,boxShadow:'0 8px 24px rgba(245,158,11,0.3)'}}>
              {isEs?'Empieza Gratis →':'Start Free →'}
            </button>
            <button className="btn" onClick={()=>setChatOpen(true)} style={{padding:'17px 40px',borderRadius:100,background:'transparent',border:'1.5px solid rgba(255,255,255,0.2)',color:white,fontSize:17,fontWeight:700}}>
              🤖 {isEs?'Habla con Coach Ray':'Talk to Coach Ray'}
            </button>
          </div>
          <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:44}}>
            {[['98%',isEs?'Tasa Apertura SMS':'SMS Open Rate'],['48hrs',isEs?'Hugo Consiguió Trabajo':'Hugo Got a Job'],['$9.99',isEs?'Por Mes':'Per Month'],['$0',isEs?'Comisión Agente':'Agency Cut']].map(([n,l],i,a)=>(
              <div key={l} style={{padding:'0 36px',textAlign:'center',borderRight:i<a.length-1?'1px solid rgba(255,255,255,0.1)':'none'}}>
                <div style={{fontSize:'clamp(26px,4vw,42px)',fontWeight:900,color:amber}}>{n}</div>
                <div style={{fontSize:12,color:'rgba(240,244,248,0.65)',marginTop:5,fontWeight:600,textTransform:'uppercase',letterSpacing:'1px'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{padding:'80px 24px',background:'rgba(255,255,255,0.025)'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.03))',border:'1px solid rgba(245,158,11,0.22)',borderRadius:24,padding:'clamp(32px,5vw,56px)'}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'3px',color:amber,marginBottom:18}}>{isEs?'POR QUÉ LO CONSTRUIMOS':'WHY WE BUILT THIS'}</div>
            <div style={{fontSize:'clamp(22px,3.5vw,36px)',fontWeight:900,marginBottom:18,lineHeight:1.2}}>
              "{isEs?'Estaba escribiendo números de teléfono en un papel.':'He was writing phone numbers on a piece of paper.'}"
            </div>
            <p style={{fontSize:'clamp(15px,1.8vw,17px)',color:'rgba(240,244,248,0.78)',lineHeight:1.8,maxWidth:640,marginBottom:24}}>
              {isEs?'Hugo tiene 66 años. Habla español. Está sin hogar. 20 años de experiencia en salud en México. Construimos WorkBridge ese día. Envió mensajes a 8 negocios locales. En 48 horas tenía una oferta de trabajo.':'Hugo is 66 years old. Spanish-speaking. Homeless. 20 years of healthcare experience in Mexico. We built WorkBridge that day. He texted 8 local businesses. He had a job offer in 48 hours.'}
            </p>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:32}}>👴🏽</span>
              <span style={{fontSize:15,fontWeight:800,color:amber}}>Hugo — {isEs?'La razón por la que existe WorkBridge.':'The reason WorkBridge exists.'}</span>
            </div>
          </div>
        </div>
      </section>
      <section id="how" style={{padding:'80px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'3px',color:green,marginBottom:14}}>HOW IT WORKS</div>
            <h2 style={{fontSize:'clamp(30px,5vw,54px)',fontWeight:900,letterSpacing:'-1.5px'}}>{isEs?'Tres pasos. Eso es todo.':'Three steps. That\'s all.'}</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18}}>
            {(isEs
              ?[['📍','Ingresa tu ZIP','Dinos tu código postal y tipo de trabajo. Encontramos negocios reales cerca de ti.'],
                ['🤖','Coach Ray Escribe tu Mensaje','Te hace 4 preguntas, escribe tu mensaje profesional Y agenda la entrevista en el calendario del empleador.'],
                ['💬','El Negocio te Responde','Tu mensaje va directo al tomador de decisiones. Coach Ray te prepara para la entrevista.']]
              :[['📍','Enter Your ZIP','Tell us your ZIP and job type. We find real local businesses hiring right now.'],
                ['🤖','Coach Ray Writes Your Message','4 questions, one professional message — and he books the interview directly on the employer\'s calendar.'],
                ['💬','Business Replies to You','Straight to the decision maker. No middleman. Coach Ray preps you for the interview.']]
            ).map(([icon,title,body],i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.045)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:'30px 24px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${amber},transparent)`}}/>
                <div style={{fontSize:11,fontWeight:800,color:amber,letterSpacing:'3px',marginBottom:12}}>0{i+1}</div>
                <div style={{fontSize:34,marginBottom:14}}>{icon}</div>
                <div style={{fontSize:19,fontWeight:800,marginBottom:10}}>{title}</div>
                <div style={{fontSize:15,color:'rgba(240,244,248,0.75)',lineHeight:1.65}}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="signup" style={{padding:'80px 24px',background:'rgba(255,255,255,0.025)',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{maxWidth:540,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'3px',color:amber,marginBottom:14}}>GET STARTED FREE</div>
          <h2 style={{fontSize:'clamp(28px,4.5vw,48px)',fontWeight:900,letterSpacing:'-1px',marginBottom:12}}>{isEs?'¿Listo para encontrar trabajo?':'Ready to find work?'}</h2>
          <p style={{fontSize:16,color:'rgba(240,244,248,0.72)',marginBottom:4}}>{isEs?'$9.99/mes — 5 créditos SMS gratis al registrarse.':'$9.99/month — 5 free SMS credits on signup.'}</p>
          <p style={{fontSize:13,color:green,marginBottom:28,fontWeight:700}}>{isEs?'Coach Ray maneja todo — búsqueda, mensajes, entrevistas, seguimiento.':'Coach Ray handles everything — search, messages, interviews, follow-ups.'}</p>
          {!submitted?(
            <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:420,margin:'0 auto 16px'}}>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder={isEs?'Tu nombre completo':'Your full name'}
                style={{padding:'14px 18px',borderRadius:100,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:15,outline:'none'}}/>
              <div style={{display:'flex',gap:10}}>
                <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleSignup()}}
                  placeholder={isEs?'Tu correo electrónico':'Your email address'}
                  style={{flex:1,padding:'14px 18px',borderRadius:100,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:15,outline:'none'}}/>
                <button className="btn" onClick={handleSignup} disabled={submitting||!email.trim()||!name.trim()}
                  style={{padding:'14px 24px',borderRadius:100,border:'none',background:email.trim()&&name.trim()?`linear-gradient(135deg,${amber},#D97706)`:'rgba(255,255,255,0.1)',color:dark,fontWeight:900,fontSize:14,whiteSpace:'nowrap',opacity:submitting?0.7:1,cursor:'pointer'}}>
                  {submitting?'...':(isEs?'Empezar':'Get Access')}
                </button>
              </div>
            </div>
          ):(
            <div style={{fontSize:16,fontWeight:700,color:green,padding:'16px 28px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:14,display:'inline-block',marginBottom:16}}>
              {isEs?'✅ ¡Bienvenido! Abriendo tu dashboard...':'✅ Welcome to WorkBridge! Opening your dashboard...'}
            </div>
          )}
          <button onClick={()=>router.push('/login')} style={{display:'block',margin:'12px auto 0',color:'rgba(240,244,248,0.45)',background:'none',border:'none',fontSize:14,cursor:'pointer'}}>
            {isEs?'¿Ya tienes cuenta? Iniciar sesión':'Already have an account? Log in'}
          </button>
        </div>
      </section>
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.08)',padding:'36px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,marginBottom:4}}>Work<span style={{color:amber}}>Bridge</span></div>
            <div style={{fontSize:13,color:'rgba(240,244,248,0.55)'}}>{isEs?'Encuentra trabajo. Envía un texto. Consigue empleo.':'Find work. Send a text. Get hired.'}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13,color:'rgba(240,244,248,0.55)',marginBottom:4}}>
              API: <a href="https://workbridge-api.onrender.com/docs" target="_blank" style={{color:green,textDecoration:'none'}}>Live ✅</a>
            </div>
            <div style={{fontSize:12,color:'rgba(240,244,248,0.25)'}}>© 2026 WorkBridge · Built for Hugo. 🌉</div>
          </div>
        </div>
      </footer>
      {!chatOpen&&<button className="btn" onClick={()=>setChatOpen(true)} style={{position:'fixed',bottom:24,right:24,width:60,height:60,borderRadius:'50%',border:'none',background:`linear-gradient(135deg,${green},#059669)`,color:white,fontSize:26,zIndex:200,boxShadow:'0 8px 24px rgba(16,185,129,0.4)'}}>🤖</button>}
      {chatOpen&&(
        <div style={{position:'fixed',bottom:24,right:24,width:340,height:480,background:'#0D1117',border:'1px solid rgba(16,185,129,0.25)',borderRadius:20,display:'flex',flexDirection:'column',zIndex:200,boxShadow:'0 24px 60px rgba(0,0,0,0.6)',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(16,185,129,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
              <div>
                <div style={{fontSize:13,fontWeight:800}}>Coach Ray</div>
                <div style={{fontSize:10,color:green}}>● {isEs?'En línea':'Online'} · WorkBridge AI</div>
              </div>
            </div>
            <button onClick={()=>setChatOpen(false)} style={{background:'none',border:'none',color:'rgba(240,244,248,0.4)',cursor:'pointer',fontSize:20}}>✕</button>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
            {messages.map((m,i)=>(
              <div key={i} style={{display:'flex',gap:8,justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end'}}>
                {m.role==='assistant'&&<div style={{width:24,height:24,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>🤖</div>}
                <div style={{maxWidth:'80%',padding:'10px 13px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?`linear-gradient(135deg,${amber},#D97706)`:'rgba(255,255,255,0.06)',fontSize:13,lineHeight:1.55,color:white}}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading&&<div style={{display:'flex',gap:8,alignItems:'flex-end'}}><div style={{width:24,height:24,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>🤖</div><div style={{padding:'10px 14px',background:'rgba(255,255,255,0.06)',borderRadius:'16px 16px 16px 4px',display:'flex',gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:green,animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}</div></div>}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{display:'flex',gap:8}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendMessage()}}
                placeholder={isEs?'Escribe tu pregunta...':'Ask me anything...'}
                style={{flex:1,padding:'10px 14px',borderRadius:100,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:white,fontSize:13,outline:'none'}}/>
              <button onClick={sendMessage} style={{width:38,height:38,borderRadius:'50%',border:'none',background:input.trim()?`linear-gradient(135deg,${green},#059669)`:'rgba(255,255,255,0.08)',cursor:input.trim()?'pointer':'default',fontSize:16}}>→</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
