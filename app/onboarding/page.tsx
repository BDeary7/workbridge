'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const A='#F59E0B', G='#10B981', D='#080C12', W='#F0F4F8'

const T = {
  en: {
    welcome_title: "Welcome to WorkBridge",
    welcome_sub: "Find work. No resume needed. Just a text.",
    choose_lang: "Choose your language",
    hey: "Hey",
    coach_intro: "I'm Coach Ray — your personal AI job specialist.",
    coach_power: "I have access to 33 million businesses across all 50 states. I text them for you.",
    coach_ask: "What can I help you with today?",
    coach_select: "Select everything that applies — I'll activate a specialist for each one.",
    ready: "Let's Go →",
    select_one: "Select at least one",
    adding: "Setting up your dashboard...",
    more: "You can add more missions anytime from your dashboard",
    great: "Great choice! I'm activating your",
    perfect: "Perfect! I'm activating",
    specialists: "specialists for you. I'll prioritize your most urgent need first. Ready?",
  },
  es: {
    welcome_title: "Bienvenido a WorkBridge",
    welcome_sub: "Encuentra trabajo. Sin currículum. Solo un mensaje.",
    choose_lang: "Elige tu idioma",
    hey: "¡Hola",
    coach_intro: "Soy Coach Ray — tu especialista personal de empleo con IA.",
    coach_power: "Tengo acceso a 33 millones de empresas en los 50 estados. Les envío mensajes por ti.",
    coach_ask: "¿En qué puedo ayudarte hoy?",
    coach_select: "Selecciona todo lo que aplique — activaré un especialista para cada uno.",
    ready: "¡Vamos! →",
    select_one: "Selecciona al menos uno",
    adding: "Configurando tu panel...",
    more: "Puedes agregar más misiones desde tu panel en cualquier momento",
    great: "¡Excelente! Estoy activando tu especialista de",
    perfect: "¡Perfecto! Estoy activando",
    specialists: "especialistas para ti. Priorizaré tu necesidad más urgente primero. ¿Listo?",
  }
}

const MISSIONS = [
  {id:'job',      icon:'🔍', en:'Find a Job',          es:'Buscar Trabajo',      desc_en:'Get hired fast — no resume needed',                desc_es:'Consigue trabajo rápido — sin currículum'},
  {id:'veteran',  icon:'⭐', en:'Veterans Hub',         es:'Centro de Veteranos', desc_en:'VA benefits, refi, disability, home buying',        desc_es:'Beneficios VA, refinanciamiento, discapacidad'},
  {id:'housing',  icon:'🔑', en:'Find Housing',         es:'Encontrar Vivienda',  desc_en:'Rentals, Section 8, emergency housing',             desc_es:'Rentas, Sección 8, vivienda de emergencia'},
  {id:'debt',     icon:'💰', en:'Debt & Tax Relief',    es:'Alivio de Deudas',    desc_en:'Tax breaks, debt relief, counseling',               desc_es:'Reducción de impuestos, alivio de deudas'},
  {id:'education',icon:'📚', en:'Get Educated',         es:'Educación',           desc_en:'GED, trade school, college, apprenticeships',       desc_es:'GED, escuela técnica, universidad'},
  {id:'home',     icon:'🔧', en:'Home Services',        es:'Servicios del Hogar', desc_en:'Plumber, electrician, handyman',                    desc_es:'Plomero, electricista, reparaciones'},
  {id:'senior',   icon:'👴', en:'Senior Care',          es:'Cuidado de Mayores',  desc_en:'In-home care, assisted living, memory care',        desc_es:'Cuidado en casa, vida asistida'},
  {id:'vehicle',  icon:'🚗', en:'Buy a Vehicle',        es:'Comprar un Vehículo', desc_en:'Military deals, USAA, civilian purchases',          desc_es:'Ofertas militares, USAA, compras civiles'},
  {id:'chores',   icon:'🧹', en:'Household Help',       es:'Ayuda en el Hogar',   desc_en:'Cleaning, lawn care, home services',                desc_es:'Limpieza, jardinería, servicios del hogar'},
  {id:'business', icon:'🏢', en:'I Need to Hire',       es:'Necesito Contratar',  desc_en:'Post jobs, receive pre-qualified candidates',       desc_es:'Publicar empleos, recibir candidatos calificados'},
]

export default function Onboarding() {
  const router = useRouter()
  const [lang, setLang]         = useState<'en'|'es'>('en')
  const [step, setStep]         = useState<'lang'|'welcome'|'select'>('lang')
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading]   = useState(false)
  const [name, setName]         = useState('there')

  const t = T[lang]
  const tok = () => typeof window !== 'undefined' ? localStorage.getItem('wb_token') : null

  useEffect(() => {
    if (!tok()) { router.push('/login'); return }
    if (localStorage.getItem('wb_onboarding_done')) { router.push('/dashboard'); return }
    const n = localStorage.getItem('wb_name') || 'there'
    setName(n)
    const savedLang = localStorage.getItem('wb_language') || 'en'
    if (savedLang === 'es') { setLang('es') }
  }, [])

  const chooseLang = async (l: 'en'|'es') => {
    setLang(l)
    localStorage.setItem('wb_language', l)
    try {
      await fetch(`${API}/profile/update`, {
        method: 'POST',
        headers: {'Content-Type':'application/json', Authorization:`Bearer ${tok()}`},
        body: JSON.stringify({language: l})
      })
    } catch {}
    setStep('welcome')
    setTimeout(() => setStep('select'), 2200)
  }

  const toggle = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id])

  const handleContinue = async () => {
    if (selected.length === 0) return
    setLoading(true)
    try {
      await fetch(`${API}/user/missions`, {
        method: 'POST',
        headers: {'Content-Type':'application/json', Authorization:`Bearer ${tok()}`},
        body: JSON.stringify({missions: selected})
      })
    } catch {}
    localStorage.setItem('wb_missions', JSON.stringify(selected))
    localStorage.setItem('wb_onboarding_done', 'true')
    router.push('/dashboard')
    setLoading(false)
  }

  // ── LANGUAGE SELECTION SCREEN ─────────────────────────────────────────────
  if (step === 'lang') return (
    <div style={{fontFamily:'system-ui,sans-serif',background:D,color:W,
      minHeight:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .langbtn{transition:all .2s;cursor:pointer}
        .langbtn:hover{transform:scale(1.03)}`}
      </style>
      <div style={{textAlign:'center',marginBottom:40,animation:'fadeUp .5s ease'}}>
        <div style={{fontSize:52,marginBottom:12}}>🌉</div>
        <div style={{fontSize:26,fontWeight:900}}>Work<span style={{color:A}}>Bridge</span></div>
      </div>
      <div style={{fontSize:18,fontWeight:700,marginBottom:28,textAlign:'center',opacity:.8}}>
        🌐 Choose your language / Elige tu idioma
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16,width:'100%',maxWidth:360}}>
        <button className="langbtn" onClick={()=>chooseLang('en')}
          style={{padding:'22px 28px',borderRadius:16,border:`2px solid rgba(255,255,255,.15)`,
            background:'rgba(255,255,255,.06)',color:W,cursor:'pointer',
            display:'flex',alignItems:'center',gap:16,fontSize:18,fontWeight:700}}>
          <span style={{fontSize:36}}>🇺🇸</span>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:20,fontWeight:900}}>English</div>
            <div style={{fontSize:13,opacity:.6,fontWeight:400}}>Continue in English</div>
          </div>
        </button>
        <button className="langbtn" onClick={()=>chooseLang('es')}
          style={{padding:'22px 28px',borderRadius:16,border:`2px solid rgba(245,158,11,.4)`,
            background:'rgba(245,158,11,.08)',color:W,cursor:'pointer',
            display:'flex',alignItems:'center',gap:16,fontSize:18,fontWeight:700}}>
          <span style={{fontSize:36}}>🇲🇽</span>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:20,fontWeight:900}}>Español</div>
            <div style={{fontSize:13,opacity:.6,fontWeight:400,color:A}}>Continuar en Español</div>
          </div>
        </button>
      </div>
    </div>
  )

  // ── WELCOME + MISSION SELECT ──────────────────────────────────────────────
  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:D,color:W,
      minHeight:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',padding:'32px 20px'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .bubble{animation:fadeUp 0.4s ease forwards}
        .opt:active{transform:scale(0.98)}
      `}</style>

      <div style={{width:'100%',maxWidth:560}}>
        <div style={{fontSize:22,fontWeight:900,marginBottom:28,textAlign:'center'}}>
          Work<span style={{color:A}}>Bridge</span>
        </div>

        <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:20}}>
          <div style={{width:52,height:52,borderRadius:'50%',flexShrink:0,
            background:`linear-gradient(135deg,${G},#059669)`,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:24,boxShadow:`0 0 20px rgba(16,185,129,.3)`}}>
            🤖
          </div>
          <div>
            <div className="bubble" style={{background:'rgba(255,255,255,.07)',
              borderRadius:'4px 18px 18px 18px',padding:'16px 20px',
              fontSize:16,lineHeight:1.7,marginBottom:10,maxWidth:460}}>
              {t.hey} <strong>{name}</strong>! 👋 {t.coach_intro}
            </div>
            <div className="bubble" style={{background:'rgba(255,255,255,.07)',
              borderRadius:'4px 18px 18px 18px',padding:'16px 20px',
              fontSize:16,lineHeight:1.7,marginBottom:10,maxWidth:460,
              animationDelay:'.3s',opacity:0}}>
              {t.coach_power}
            </div>
            {step === 'select' && (
              <div className="bubble" style={{background:`rgba(245,158,11,.1)`,
                border:`1px solid rgba(245,158,11,.3)`,
                borderRadius:'4px 18px 18px 18px',padding:'16px 20px',
                fontSize:16,lineHeight:1.7,marginBottom:20,maxWidth:460}}>
                <strong style={{color:A}}>{t.coach_ask}</strong><br/>
                <span style={{fontSize:14,opacity:.8}}>{t.coach_select}</span>
              </div>
            )}
            {step === 'welcome' && (
              <div style={{display:'flex',gap:6,paddingLeft:4,paddingTop:4}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:10,height:10,borderRadius:'50%',
                    background:G,animation:`blink 1.2s ${i*.2}s infinite`}}/>
                ))}
              </div>
            )}
          </div>
        </div>

        {step === 'select' && (
          <div style={{paddingLeft:0}}>
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
              {MISSIONS.map((m,i) => {
                const sel = selected.includes(m.id)
                const label = lang==='es' ? m.es : m.en
                const desc  = lang==='es' ? m.desc_es : m.desc_en
                return (
                  <div key={m.id} className="opt" onClick={()=>toggle(m.id)}
                    style={{display:'flex',alignItems:'center',gap:14,
                      padding:'16px 18px',borderRadius:14,cursor:'pointer',
                      border:`2px solid ${sel?A:'rgba(255,255,255,.1)'}`,
                      background:sel?`rgba(245,158,11,.08)`:'rgba(255,255,255,.03)',
                      transition:'all .15s',
                      animation:`fadeUp .3s ${i*.04}s ease forwards`,opacity:0}}>
                    <span style={{fontSize:26,flexShrink:0}}>{m.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,fontSize:15,color:sel?A:W}}>{label}</div>
                      <div style={{fontSize:13,color:'rgba(240,244,248,.65)',marginTop:3}}>{desc}</div>
                    </div>
                    <div style={{width:24,height:24,borderRadius:'50%',flexShrink:0,
                      border:`2px solid ${sel?A:'rgba(255,255,255,.25)'}`,
                      background:sel?A:'transparent',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:13,color:D,fontWeight:900,transition:'all .15s'}}>
                      {sel?'✓':''}
                    </div>
                  </div>
                )
              })}
            </div>

            {selected.length > 0 && (
              <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:20}}>
                <div style={{width:52,height:52,borderRadius:'50%',flexShrink:0,
                  background:`linear-gradient(135deg,${G},#059669)`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>
                  🤖
                </div>
                <div className="bubble" style={{background:'rgba(16,185,129,.1)',
                  border:'1px solid rgba(16,185,129,.3)',
                  borderRadius:'4px 18px 18px 18px',padding:'16px 20px',
                  fontSize:15,lineHeight:1.7,maxWidth:460}}>
                  {selected.length===1
                    ? <>{t.great} <strong style={{color:G}}>{lang==='es'?MISSIONS.find(m=>m.id===selected[0])?.es:MISSIONS.find(m=>m.id===selected[0])?.en}</strong>! ✅</>
                    : <>{t.perfect} <strong style={{color:G}}>{selected.length}</strong> {t.specialists} {selected.map(id=>MISSIONS.find(m=>m.id===id)?.icon).join(' ')}</>
                  }
                </div>
              </div>
            )}

            <button onClick={handleContinue}
              disabled={loading||selected.length===0}
              style={{width:'100%',padding:'18px',borderRadius:14,border:'none',
                background:selected.length>0?`linear-gradient(135deg,${A},#D97706)`:'rgba(255,255,255,.07)',
                color:selected.length>0?D:'rgba(240,244,248,.5)',
                fontWeight:900,fontSize:17,
                cursor:selected.length>0?'pointer':'not-allowed',
                transition:'all .2s',marginBottom:12}}>
              {loading?t.adding:selected.length===0?t.select_one:t.ready}
            </button>

            <p style={{textAlign:'center',fontSize:12,color:'rgba(240,244,248,.5)'}}>
              {t.more}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
