'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const amber = '#F59E0B'
const green = '#10B981'
const dark = '#080C12'
const white = '#F0F4F8'

const MISSIONS = [
  { id:'job', icon:'🔍', label:'Find a Job', color:'#10B981',
    desc:'Get hired fast via SMS — no resume needed' },
  { id:'veteran', icon:'⭐', label:'Veterans Hub', color:'#3B82F6',
    desc:'VA benefits, refi, home buying, tax breaks, disability claims' },
  { id:'housing', icon:'🔑', label:'Find Housing', color:'#06B6D4',
    desc:'Rentals, Section 8, emergency housing, vouchers' },
  { id:'debt', icon:'💰', label:'Debt and Tax Relief', color:'#A78BFA',
    desc:'Tax breaks, debt relief, financial counseling' },
  { id:'education', icon:'📚', label:'Get Educated', color:'#F59E0B',
    desc:'GED, trade school, college, apprenticeships' },
  { id:'home', icon:'🔧', label:'Home Services', color:'#F97316',
    desc:'Plumber, electrician, handyman — fast local help' },
  { id:'senior', icon:'👴', label:'Senior Care', color:'#8B5CF6',
    desc:'In-home care, assisted living, memory care placement' },
  { id:'vehicle', icon:'🚗', label:'Buy a Vehicle', color:'#14B8A6',
    desc:'Military deals, USAA financing, civilian purchases' },
  { id:'chores', icon:'🧹', label:'Household Help', color:'#F59E0B',
    desc:'Cleaning, lawn care, recurring home services' },
  { id:'business', icon:'🏢', label:'I own a business and need to hire', color:'#EC4899',
    desc:'Post jobs, receive pre-qualified candidates, grow your team' },
]

export default function Onboarding() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const tok = () => typeof window !== 'undefined' ? localStorage.getItem('wb_token') : null

  useEffect(() => {
    if (!tok()) { router.push('/login'); return }
    const done = localStorage.getItem('wb_onboarding_done')
    if (done) { router.push('/dashboard') }
  }, [])

  const toggle = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const handleContinue = async () => {
    if (selected.length === 0) { setError('Please select at least one mission to continue.'); return }
    setLoading(true); setError('')
    const token = tok()
    try {
      await fetch(`${API}/user/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ missions: selected })
      })
      localStorage.setItem('wb_missions', JSON.stringify(selected))
      localStorage.setItem('wb_onboarding_done', 'true')
      router.push('/dashboard')
    } catch {
      localStorage.setItem('wb_missions', JSON.stringify(selected))
      localStorage.setItem('wb_onboarding_done', 'true')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', background: dark, color: white, minHeight: '100vh', padding: '40px 24px' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .card:hover{transform:translateY(-2px);transition:all .2s}
        @keyframes glow{0%,100%{box-shadow:none}50%{box-shadow:0 0 30px rgba(245,158,11,0.4)}}
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>
            Work<span style={{ color: amber }}>Bridge</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, marginBottom: 12 }}>
            What brings you to WorkBridge today?
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(240,244,248,0.6)', maxWidth: 560, margin: '0 auto' }}>
            Select everything that applies. Your personal Coach Ray specialist will be activated for each mission you choose.
          </p>
        </div>

        {/* Mission Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14, marginBottom: 32 }}>
          {MISSIONS.map(m => {
            const isSelected = selected.includes(m.id)
            return (
              <div key={m.id} className="card" onClick={() => toggle(m.id)}
                style={{
                  padding: '20px 22px', borderRadius: 16, cursor: 'pointer',
                  background: isSelected ? `${m.color}18` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isSelected ? m.color : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s',
                  animation: isSelected ? 'glow 1s ease-in-out' : 'none'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: isSelected ? m.color : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    transition: 'all 0.2s'
                  }}>
                    {m.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: isSelected ? m.color : white }}>
                      {m.label}
                    </div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${isSelected ? m.color : 'rgba(255,255,255,0.3)'}`,
                    background: isSelected ? m.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: dark, transition: 'all 0.2s', flexShrink: 0
                  }}>
                    {isSelected ? '✓' : ''}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(240,244,248,0.6)', lineHeight: 1.5 }}>
                  {m.desc}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected count */}
        {selected.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 14, color: amber, fontWeight: 700 }}>
            {selected.length} mission{selected.length > 1 ? 's' : ''} selected —
            {selected.length === 1 ? ' 1 Coach Ray specialist' : ` ${selected.length} Coach Ray specialists`} will be activated
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: '#f87171', marginBottom: 16, fontSize: 14 }}>{error}</div>
        )}

        {/* Continue Button */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={handleContinue} disabled={loading || selected.length === 0}
            style={{
              padding: '16px 48px', borderRadius: 100, border: 'none',
              background: selected.length > 0 ? `linear-gradient(135deg,${amber},#D97706)` : 'rgba(255,255,255,0.1)',
              color: selected.length > 0 ? dark : 'rgba(240,244,248,0.3)',
              fontWeight: 900, fontSize: 17, cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}>
            {loading ? 'Setting up your dashboard...' : `Activate My Mission${selected.length > 1 ? 's' : ''} →`}
          </button>
          <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(240,244,248,0.4)' }}>
            You can add more missions anytime from your dashboard
          </p>
        </div>
      </div>
    </div>
  )
}
