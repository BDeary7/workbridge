'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const amber = '#F59E0B'
const green = '#10B981'
const dark = '#080C12'
const white = '#F0F4F8'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body = mode === 'login'
        ? { email, password }
        : { name, email, phone, password }
      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Something went wrong')
      localStorage.setItem('wb_token', data.token)
      localStorage.setItem('wb_name', data.name || name)
      localStorage.setItem('wb_credits', String(data.credits))
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:28,fontWeight:900,marginBottom:8}}>Work<span style={{color:amber}}>Bridge</span></div>
          <div style={{fontSize:14,color:'rgba(240,244,248,0.6)'}}>
            {mode === 'login' ? 'Welcome back' : 'Create your free account'}
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:32}}>
          {/* Toggle */}
          <div style={{display:'flex',background:'rgba(255,255,255,0.06)',borderRadius:100,padding:4,marginBottom:24}}>
            {(['login','register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{flex:1,padding:'8px',borderRadius:100,border:'none',background:mode===m?amber:'transparent',color:mode===m?dark:white,fontWeight:700,fontSize:13,cursor:'pointer',transition:'all 0.2s'}}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {mode === 'register' && (
              <input value={name} onChange={e=>setName(e.target.value)}
                placeholder="Full name"
                style={{padding:'13px 16px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:14,outline:'none'}}/>
            )}
            <input value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Email address" type="email"
              style={{padding:'13px 16px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:14,outline:'none'}}/>
            {mode === 'register' && (
              <input value={phone} onChange={e=>setPhone(e.target.value)}
                placeholder="Phone number (optional)"
                style={{padding:'13px 16px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:14,outline:'none'}}/>
            )}
            <input value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="Password" type="password"
              onKeyDown={e=>{if(e.key==='Enter')submit()}}
              style={{padding:'13px 16px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:14,outline:'none'}}/>
          </div>

          {error && (
            <div style={{marginTop:12,padding:'10px 14px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,fontSize:13,color:'#EF4444'}}>
              {error}
            </div>
          )}

          <button onClick={submit} disabled={loading}
            style={{marginTop:20,width:'100%',padding:'14px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontWeight:900,fontSize:15,cursor:loading?'wait':'pointer',opacity:loading?0.7:1,transition:'all 0.2s'}}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In →' : 'Create Account →'}
          </button>

          <div style={{marginTop:16,textAlign:'center',fontSize:13,color:'rgba(240,244,248,0.5)'}}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={()=>setMode(mode==='login'?'register':'login')}
              style={{background:'none',border:'none',color:amber,fontWeight:700,cursor:'pointer',fontSize:13}}>
              {mode === 'login' ? 'Sign up free' : 'Log in'}
            </button>
          </div>
        </div>

        <div style={{textAlign:'center',marginTop:20}}>
          <a href="/" style={{color:'rgba(240,244,248,0.4)',fontSize:13,textDecoration:'none'}}>← Back to WorkBridge</a>
        </div>
      </div>
    </div>
  )
}
