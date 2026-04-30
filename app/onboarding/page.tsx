'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const amber = '#F59E0B'
const green = '#10B981'
const dark = '#080C12'
const white = '#F0F4F8'

const MISSIONS = [
  {id:'job', icon:'🔍', label:'Find a Job', desc:'Get hired fast — no resume needed'},
  {id:'veteran', icon:'⭐', label:'Veterans Hub', desc:'VA benefits, refi, disability, home buying'},
  {id:'housing', icon:'🔑', label:'Find Housing', desc:'Rentals, Section 8, emergency housing'},
  {id:'debt', icon:'💰', label:'Debt and Tax Relief', desc:'Tax breaks, debt relief, counseling'},
  {id:'education', icon:'📚', label:'Get Educated', desc:'GED, trade school, college, apprenticeships'},
  {id:'home', icon:'🔧', label:'Home Services', desc:'Plumber, electrician, handyman'},
  {id:'senior', icon:'👴', label:'Senior Care', desc:'In-home care, assisted living, memory care'},
  {id:'vehicle', icon:'🚗', label:'Buy a Vehicle', desc:'Military deals, USAA, civilian purchases'},
  {id:'chores', icon:'🧹', label:'Household Help', desc:'Cleaning, lawn care, home services'},
  {id:'business', icon:'🏢', label:'I own a business — I need to hire', desc:'Post jobs, receive pre-qualified candidates'},
]

export default function Onboarding() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [step, setStep] = useState<'welcome'|'select'|'confirm'>('welcome')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const tok = () => typeof window !== 'undefined' ? localStorage.getItem('wb_token') : null

  useEffect(() => {
    if (!tok()) { router.push('/login'); return }
    const done = localStorage.getItem('wb_onboarding_done')
    if (done) { router.push('/dashboard'); return }
    setName(localStorage.getItem('wb_name') || 'there')
    setTimeout(() => setStep('select'), 2500)
  }, [])

  const toggle = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const handleContinue = async () => {
    if (selected.length === 0) return
    setLoading(true)
    const token = tok()
    try {
      await fetch(`${API}/user/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ missions: selected })
      })
    } catch {}
    localStorage.setItem('wb_missions', JSON.stringify(selected))
    localStorage.setItem('wb_onboarding_done', 'true')
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:'40px 24px'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .bubble{animation:fadeUp 0.4s ease forwards}
        .opt:hover{border-color:${amber}!important;background:rgba(245,158,11,0.08)!important;cursor:pointer}
      `}</style>

      <div style={{width:'100%',maxWidth:600}}>
        {/* WorkBridge logo */}
        <div style={{fontSize:22,fontWeight:900,marginBottom:32,textAlign:'center'}}>
          Work<span style={{color:amber}}>Bridge</span>
        </div>

        {/* Coach Ray avatar + speech */}
        <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:24}}>
          <div style={{width:48,height:48,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:`0 0 20px rgba(16,185,129,0.3)`}}>
            🤖
          </div>
          <div>
            {/* Bubble 1 — always shown */}
            <div className="bubble" style={{background:'rgba(255,255,255,0.07)',borderRadius:'4px 16px 16px 16px',padding:'14px 18px',fontSize:15,lineHeight:1.7,marginBottom:10,maxWidth:480}}>
              Hey {name}! 👋 I am <strong style={{color:green}}>Coach Ray</strong> — your personal AI specialist here at WorkBridge.
            </div>

            {/* Bubble 2 */}
            <div className="bubble" style={{background:'rgba(255,255,255,0.07)',borderRadius:'4px 16px 16px 16px',padding:'14px 18px',fontSize:15,lineHeight:1.7,marginBottom:10,maxWidth:480,animationDelay:'0.3s',opacity:0}}>
              I have access to <strong style={{color:amber}}>33 million businesses</strong> across all 50 states — and I can text them on your behalf in seconds.
            </div>

            {/* Bubble 3 — shows after delay */}
            {step === 'select' && (
              <div className="bubble" style={{background:`rgba(245,158,11,0.1)`,border:`1px solid rgba(245,158,11,0.3)`,borderRadius:'4px 16px 16px 16px',padding:'14px 18px',fontSize:15,lineHeight:1.7,marginBottom:20,maxWidth:480}}>
                <strong style={{color:amber}}>What can I help you with today?</strong><br/>
                <span style={{color:'rgba(240,244,248,0.7)',fontSize:13}}>Select everything that applies — I will activate a specialist for each one.</span>
              </div>
            )}

            {step === 'welcome' && (
              <div style={{display:'flex',gap:6,paddingLeft:4,paddingTop:4}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:8,height:8,borderRadius:'50%',background:green,animation:`blink 1.2s ${i*0.2}s infinite`}}/>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mission Options as speech-bubble style buttons */}
        {step === 'select' && (
          <div style={{paddingLeft:62}}>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
              {MISSIONS.map((m,i) => {
                const isSelected = selected.includes(m.id)
                return (
                  <div key={m.id} className="opt"
                    onClick={() => toggle(m.id)}
                    style={{
                      display:'flex',alignItems:'center',gap:12,
                      padding:'12px 16px',borderRadius:12,
                      border:`1.5px solid ${isSelected ? m.color || amber : 'rgba(255,255,255,0.1)'}`,
                      background: isSelected ? `rgba(245,158,11,0.08)` : 'rgba(255,255,255,0.03)',
                      transition:'all 0.15s',
                      animation:`fadeUp 0.3s ${i*0.05}s ease forwards`,
                      opacity:0
                    }}>
                    <span style={{fontSize:20,flexShrink:0}}>{m.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14,color: isSelected ? amber : white}}>{m.label}</div>
                      <div style={{fontSize:12,color:'rgba(240,244,248,0.5)',marginTop:2}}>{m.desc}</div>
                    </div>
                    <div style={{
                      width:20,height:20,borderRadius:'50%',flexShrink:0,
                      border:`2px solid ${isSelected ? amber : 'rgba(255,255,255,0.2)'}`,
                      background: isSelected ? amber : 'transparent',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:11,color:dark,fontWeight:900,transition:'all 0.15s'
                    }}>
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Coach Ray response based on selection */}
            {selected.length > 0 && (
              <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:`linear-gradient(135deg,${green},#059669)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                  🤖
                </div>
                <div className="bubble" style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'4px 16px 16px 16px',padding:'14px 18px',fontSize:14,lineHeight:1.7,maxWidth:480}}>
                  {selected.length === 1 ? (
                    <>Great choice! I am activating your <strong style={{color:green}}>{MISSIONS.find(m=>m.id===selected[0])?.label}</strong> specialist right now. Ready to get started?</>
                  ) : (
                    <>Perfect! I am activating <strong style={{color:green}}>{selected.length} specialists</strong> for you — {selected.map(id => MISSIONS.find(m=>m.id===id)?.icon).join(' ')}. I will prioritize your most urgent need first. Ready?</>
                  )}
                </div>
              </div>
            )}

            {/* Continue button */}
            <button onClick={handleContinue}
              disabled={loading || selected.length === 0}
              style={{
                width:'100%',padding:'16px',borderRadius:12,border:'none',
                background: selected.length > 0 ? `linear-gradient(135deg,${amber},#D97706)` : 'rgba(255,255,255,0.07)',
                color: selected.length > 0 ? dark : 'rgba(240,244,248,0.3)',
                fontWeight:900,fontSize:16,cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                transition:'all 0.2s'
              }}>
              {loading ? 'Setting up your dashboard...' : selected.length === 0 ? 'Select at least one mission' : `Let's Go — Activate My Mission${selected.length > 1 ? 's' : ''} →`}
            </button>

            <p style={{textAlign:'center',marginTop:12,fontSize:12,color:'rgba(240,244,248,0.3)'}}>
              You can add more missions anytime from your dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
