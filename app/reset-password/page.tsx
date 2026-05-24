'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'

export default function ResetPassword() {
  const router = useRouter()
  const params = useSearchParams()
  const token  = params.get('token') || ''

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  const handleReset = async () => {
    setError('')
    if (!password || password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (!token) { setError('Invalid reset link'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Reset failed')
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch(e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const S = {
    page: { minHeight:'100vh', background:'#060B14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans', sans-serif", padding:20 } as React.CSSProperties,
    card: { width:'100%', maxWidth:400, background:'#1A2235', border:'1px solid #1E3A5F', borderRadius:16, padding:32 } as React.CSSProperties,
    title: { fontFamily:'Syne, sans-serif', fontSize:24, fontWeight:800, color:'#FFFFFF', marginBottom:8 } as React.CSSProperties,
    sub: { fontSize:13, color:'#64748B', marginBottom:24 } as React.CSSProperties,
    inp: { width:'100%', padding:'12px 14px', borderRadius:10, background:'#060B14', border:'1px solid #1E3A5F', color:'#FFFFFF', fontSize:14, fontFamily:"DM Sans", outline:'none', marginBottom:12, boxSizing:'border-box' } as React.CSSProperties,
    btn: { width:'100%', padding:'13px 0', border:'none', cursor:'pointer', borderRadius:10, background:'#00C6A2', color:'#0A0F1A', fontFamily:"DM Sans", fontWeight:700, fontSize:15 } as React.CSSProperties,
    err: { color:'#EF4444', fontSize:12, marginBottom:12 } as React.CSSProperties,
    ok: { color:'#00C6A2', fontSize:14, fontWeight:700, textAlign:'center' as const } as React.CSSProperties,
  }

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Syne:wght@800&display=swap" rel="stylesheet"/>
      <div style={S.card}>
        <div style={{textAlign:'center', marginBottom:24}}>
          <div style={{fontSize:36}}>🌉</div>
          <div style={{fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800, color:'#FFFFFF'}}>WorkBridge</div>
        </div>
        <div style={S.title}>Set New Password</div>
        <div style={S.sub}>Enter your new password below</div>
        {success ? (
          <div style={S.ok}>✅ Password updated! Redirecting to login...</div>
        ) : (
          <>
            {error && <div style={S.err}>{error}</div>}
            <input type="password" placeholder="New password (min 8 chars)"
              value={password} onChange={e => setPassword(e.target.value)}
              style={S.inp}/>
            <input type="password" placeholder="Confirm new password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={S.inp}/>
            <button onClick={handleReset} disabled={loading} style={{...S.btn, opacity: loading ? 0.6 : 1}}>
              {loading ? 'Updating...' : 'Update Password →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
