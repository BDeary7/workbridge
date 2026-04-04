'use client'
import { useState } from 'react'

export default function Home() {
  const [lang, setLang] = useState('en')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const content = {
    en: {
      badge: '🌉 Now Live — Built for Hugo',
      h1: ['Find work.', 'Send a text.', 'Get hired.'],
      sub: 'WorkBridge connects job seekers directly with local employers via SMS. No resume required. No middleman. No waiting.',
      story: 'Hugo is 66 years old. Spanish-speaking. Homeless. 20 years of healthcare experience in Mexico. He was writing business phone numbers on a piece of paper trying to find work. We built WorkBridge that day. He texted 8 businesses. He had a job offer in 48 hours.',
      steps: [['📍','Enter Your ZIP','Tell us your ZIP and job type. We find real local businesses that hire for your role.'],['🤖','AI Writes Your Message','Our AI profiles you in 4 questions and writes a professional intro in your language.'],['💬','Business Replies to You','Your message goes straight to the decision maker. No algorithm. No middleman. Direct.']],
      cta: 'Get Early Access',
      done: '✅ You\'re on the list!',
      free: '5 free SMS credits on signup. No credit card needed.',
    },
    es: {
      badge: '🌉 Ya Disponible — Construido para Hugo',
      h1: ['Encuentra trabajo.', 'Envía un texto.', 'Consigue empleo.'],
      sub: 'WorkBridge conecta a buscadores de empleo directamente con empleadores locales por SMS. Sin currículum. Sin intermediarios. Sin esperas.',
      story: 'Hugo tiene 66 años. Habla español. Está sin hogar. Tiene 20 años de experiencia en salud en México. Estaba anotando números de negocios a mano tratando de encontrar trabajo. Construimos WorkBridge ese día. Envió mensajes a 8 negocios. En 48 horas tenía una oferta de trabajo.',
      steps: [['📍','Ingresa tu ZIP','Dinos tu código postal y tipo de trabajo. Encontramos negocios reales cerca de ti.'],['🤖','La IA Escribe tu Mensaje','Nuestro asistente te hace 4 preguntas y escribe una presentación profesional en tu idioma.'],['💬','El Negocio te Responde','Tu mensaje va directo al tomador de decisiones. Sin algoritmos. Sin intermediarios.']],
      cta: 'Obtener Acceso',
      done: '✅ ¡Estás en la lista!',
      free: '5 créditos SMS gratis al registrarse. Sin tarjeta de crédito.',
    }
  }

  const t = content[lang]
  const amber = '#F59E0B'
  const green = '#00C9A7'
  const dark = '#080C12'
  const white = '#F0F4F8'
  const muted = 'rgba(240,244,248,0.55)'

  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,minHeight:'100vh',overflowX:'hidden'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.btn:hover{opacity:0.85}input::placeholder{color:rgba(240,244,248,0.3)}`}</style>
      <nav style={{padding:'0 24px',background:'rgba(8,12,18,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.07)',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',height:64}}>
          <div style={{fontSize:20,fontWeight:900}}>Work<span style={{color:amber}}>Bridge</span></div>
          <div style={{display:'flex',gap:6,background:'rgba(255,255,255,0.05)',borderRadius:100,padding:4}}>
            {['en','es'].map(l=><button key={l} onClick={()=>setLang(l as 'en'|'es')} style={{padding:'6px 14px',borderRadius:100,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,background:lang===l?amber:'transparent',color:lang===l?dark:muted}}>{l==='en'?'🇺🇸 EN':'🇲🇽 ES'}</button>)}
          </div>
          <button className="btn" onClick={()=>document.getElementById('signup')?.scrollIntoView({behavior:'smooth'})} style={{padding:'9px 22px',borderRadius:100,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontWeight:800,fontSize:13}}>
            {t.cta} →
          </button>
        </div>
      </nav>
      <section style={{minHeight:'88vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'80px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse 70% 50% at 50% 20%, rgba(245,158,11,0.09) 0%, transparent 70%)`}}/>
        <div style={{position:'relative',maxWidth:800,animation:'fadeUp 0.6s ease'}}>
          <div style={{display:'inline-flex',padding:'6px 18px',borderRadius:100,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',fontSize:13,fontWeight:700,color:amber,marginBottom:32}}>{t.badge}</div>
          <h1 style={{fontSize:'clamp(44px,9vw,92px)',fontWeight:900,lineHeight:0.95,letterSpacing:'-3px',marginBottom:28}}>
            {t.h1.map((line,i)=><span key={i} style={{display:'block',color:i===1?amber:white}}>{line}</span>)}
          </h1>
          <p style={{fontSize:'clamp(16px,2vw,20px)',color:muted,lineHeight:1.65,maxWidth:540,margin:'0 auto 40px'}}>{t.sub}</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:60}}>
            <button className="btn" onClick={()=>document.getElementById('signup')?.scrollIntoView({behavior:'smooth'})} style={{padding:'16px 36px',borderRadius:100,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontSize:16,fontWeight:800}}>{t.cta} →</button>
            <button className="btn" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})} style={{padding:'16px 36px',borderRadius:100,cursor:'pointer',background:'transparent',border:'1.5px solid rgba(255,255,255,0.15)',color:white,fontSize:16,fontWeight:700}}>{lang==='en'?'How It Works':'Cómo Funciona'}</button>
          </div>
          <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:40}}>
            {[['98%',lang==='en'?'SMS Open Rate':'Tasa de Apertura'],['48hrs',lang==='en'?'Hugo Got a Job':'Hugo Consiguió Trabajo'],['6',lang==='en'?'Languages':'Idiomas'],['0',lang==='en'?'Competitors':'Competidores']].map(([n,l],i,a)=>(
              <div key={l} style={{padding:'0 28px',textAlign:'center',borderRight:i<a.length-1?'1px solid rgba(255,255,255,0.08)':'none'}}>
                <div style={{fontSize:'clamp(22px,4vw,38px)',fontWeight:900,color:amber}}>{n}</div>
                <div style={{fontSize:11,color:muted,marginTop:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{padding:'80px 24px',background:'rgba(255,255,255,0.02)'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:24,padding:'clamp(32px,5vw,52px)'}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'3px',color:amber,marginBottom:16}}>{lang==='en'?'WHY WE BUILT THIS':'POR QUÉ LO CONSTRUIMOS'}</div>
            <div style={{fontSize:'clamp(20px,3vw,32px)',fontWeight:900,marginBottom:16}}>"{lang==='en'?'He was writing phone numbers on a piece of paper.':'Estaba escribiendo números de teléfono en un papel.'}"</div>
            <p style={{fontSize:16,color:muted,lineHeight:1.75,maxWidth:620,marginBottom:20}}>{t.story}</p>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:28}}>👴🏽</span>
              <span style={{fontSize:14,fontWeight:700,color:amber}}>Hugo — {lang==='en'?'The reason WorkBridge exists.':'La razón por la que existe WorkBridge.'}</span>
            </div>
          </div>
        </div>
      </section>
      <section id="how" style={{padding:'80px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'3px',color:green,marginBottom:12}}>HOW IT WORKS</div>
            <h2 style={{fontSize:'clamp(28px,5vw,52px)',fontWeight:900,letterSpacing:'-1.5px'}}>{lang==='en'?'Three steps. That\'s all.':'Tres pasos. Eso es todo.'}</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
            {t.steps.map(([icon,title,body],i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'28px 22px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${amber},transparent)`}}/>
                <div style={{fontSize:11,fontWeight:800,color:amber,letterSpacing:'3px',marginBottom:10}}>0{i+1}</div>
                <div style={{fontSize:32,marginBottom:12}}>{icon}</div>
                <div style={{fontSize:18,fontWeight:800,marginBottom:8}}>{title}</div>
                <div style={{fontSize:14,color:muted,lineHeight:1.6}}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="signup" style={{padding:'80px 24px',background:'rgba(255,255,255,0.02)',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{maxWidth:520,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'3px',color:amber,marginBottom:12}}>GET STARTED</div>
          <h2 style={{fontSize:'clamp(26px,4vw,44px)',fontWeight:900,letterSpacing:'-1px',marginBottom:10}}>{lang==='en'?'Ready to find work?':'¿Listo para encontrar trabajo?'}</h2>
          <p style={{fontSize:15,color:muted,marginBottom:28}}>{lang==='en'?'Free to start. No resume required.':'Gratis para empezar. Sin currículum.'}</p>
          {!submitted?(
            <div style={{display:'flex',gap:8,maxWidth:400,margin:'0 auto'}}>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={lang==='en'?'Your email':'Tu correo'} style={{flex:1,padding:'13px 16px',borderRadius:100,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:white,fontSize:14,outline:'none'}}/>
              <button className="btn" onClick={()=>{if(email)setSubmitted(true)}} style={{padding:'13px 22px',borderRadius:100,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontWeight:800,fontSize:13,whiteSpace:'nowrap'}}>{t.cta}</button>
            </div>
          ):(
            <div style={{fontSize:15,fontWeight:700,color:green,padding:'14px 24px',background:'rgba(0,201,167,0.1)',border:'1px solid rgba(0,201,167,0.25)',borderRadius:14,display:'inline-block'}}>{t.done}</div>
          )}
          <p style={{fontSize:12,color:'rgba(240,244,248,0.2)',marginTop:14}}>{t.free}</p>
        </div>
      </section>
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.07)',padding:'32px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:17,fontWeight:900,marginBottom:3}}>Work<span style={{color:amber}}>Bridge</span></div>
            <div style={{fontSize:12,color:muted}}>{lang==='en'?'Find work. Send a text. Get hired.':'Encuentra trabajo. Envía un texto. Consigue empleo.'}</div>
          </div>
          <div style={{fontSize:12,color:'rgba(240,244,248,0.2)'}}>© 2026 WorkBridge · {lang==='en'?'Built for Hugo and everyone like him.':'Construido para Hugo y todos como él.'}</div>
        </div>
      </footer>
    </div>
  )
}
