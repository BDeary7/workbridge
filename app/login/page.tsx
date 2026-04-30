'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://workbridge-api.onrender.com'
const amber = '#F59E0B'; const green = '#10B981'; const dark = '#080C12'; const white = '#F0F4F8'

export default function Login() {
  const [tab, setTab] = useState<'login'|'signup'|'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [optSMS, setOptSMS] = useState(false)
  const [optData, setOptData] = useState(false)
  const [optPartners, setOptPartners] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email, password})
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('wb_token', data.token)
        localStorage.setItem('wb_name', data.name||email.split('@')[0])
        const onboardingDone = localStorage.getItem('wb_onboarding_done')
        router.push(onboardingDone ? '/dashboard' : '/onboarding')
      } else {
        setError(data.detail || 'Invalid email or password')
      }
    } catch { setError('Connection error — please try again') }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !name.trim() || !phone.trim()) return
    if (!optSMS || !optData) { setError('Please accept required terms to continue'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`${API}/auth/register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({name, email, phone, password, language:'en', zip_code: zip})
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('wb_token', data.token)
        localStorage.setItem('wb_name', name)
        localStorage.setItem('wb_phone', phone)
        localStorage.setItem('wb_email', email)
        router.push('/onboarding')
      } else {
        setError(data.detail==='Email already registered'?'That email already has an account — try Log In':'Could not create account')
      }
    } catch { setError('Connection error — please try again') }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email.trim()) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email})
      })
      const data = await res.json()
      setSuccess(data.message || 'If that email exists, a reset link has been sent.')
    } catch { setSuccess('If that email exists, a reset link has been sent.') }
    setLoading(false)
  }

  const inp = {padding:'14px 18px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:white,fontSize:15,outline:'none',width:'100%'} as React.CSSProperties

  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div onClick={()=>router.push('/')} style={{fontSize:28,fontWeight:900,textAlign:'center',marginBottom:8,cursor:'pointer'}}>
          Work<span style={{color:amber}}>Bridge</span>
        </div>
        <p style={{textAlign:'center',color:'rgba(240,244,248,0.5)',marginBottom:32,fontSize:14}}>
          {tab==='login'?'Welcome back':tab==='signup'?'Create your free account':'Reset your password'}
        </p>
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:32}}>
          {tab!=='forgot'&&(
            <div style={{display:'flex',background:'rgba(255,255,255,0.06)',borderRadius:100,padding:4,marginBottom:28}}>
              {(['login','signup'] as const).map(t=>(
                <button key={t} onClick={()=>{setTab(t);setError('');setSuccess('')}}
                  style={{flex:1,padding:'10px',borderRadius:100,border:'none',fontWeight:700,fontSize:14,cursor:'pointer',
                    background:tab===t?amber:'transparent',color:tab===t?dark:white,transition:'all 0.2s'}}>
                  {t==='login'?'Log In':'Sign Up'}
                </button>
              ))}
            </div>
          )}
          {tab==='forgot'&&(
            <div style={{marginBottom:20}}>
              <h3 style={{fontSize:18,fontWeight:800,marginBottom:6}}>Reset Password</h3>
              <p style={{color:'rgba(240,244,248,0.55)',fontSize:14}}>Enter your email and we will send a reset link.</p>
            </div>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {tab==='signup'&&(
              <>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" style={inp}/>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" type="tel" style={inp}/>
              <input value={zip} onChange={e=>setZip(e.target.value)} placeholder="ZIP Code" type="text" maxLength={5} style={inp}/>
              </>
            )}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={inp}/>
            {tab!=='forgot'&&(
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"
                onKeyDown={e=>{if(e.key==='Enter'){tab==='login'?handleLogin():handleSignup()}}}
                style={inp}/>
            )}
            {tab==='signup'&&(
              <div style={{display:'flex',flexDirection:'column',gap:10,padding:'14px',borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)'}}>
                <div style={{fontSize:12,fontWeight:700,color:'rgba(240,244,248,0.5)',marginBottom:4,letterSpacing:'0.5px'}}>CONSENT & TERMS</div>
                {[
                  [optSMS,setOptSMS,true,'I agree to receive SMS job alerts and notifications from WorkBridge (required)'],
                  [optData,setOptData,true,'I consent to WorkBridge sharing my profile with employers and service providers for matching (required)'],
                  [optPartners,setOptPartners,false,'I agree to be contacted by WorkBridge partner companies about relevant services — veterans benefits, home loans, insurance, tax relief (optional)'],
                ].map(([val,setter,required,label]:any,i)=>(
                  <label key={i} style={{display:'flex',gap:10,alignItems:'flex-start',cursor:'pointer'}}>
                    <input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)}
                      style={{marginTop:3,width:16,height:16,accentColor:amber,flexShrink:0}}/>
                    <span style={{fontSize:12,color:'rgba(240,244,248,0.7)',lineHeight:1.5}}>
                      {label}{required&&<span style={{color:'#EF4444'}}> *</span>}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {error&&<div style={{color:'#f87171',fontSize:13,padding:'10px 14px',background:'rgba(248,113,113,0.1)',borderRadius:8}}>{error}</div>}
            {success&&<div style={{color:green,fontSize:13,padding:'10px 14px',background:'rgba(16,185,129,0.1)',borderRadius:8}}>{success}</div>}
            <button onClick={tab==='login'?handleLogin:tab==='signup'?handleSignup:handleForgot}
              disabled={loading||(tab==='signup'&&(!optSMS||!optData))}
              style={{padding:'15px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${amber},#D97706)`,
                color:dark,fontWeight:900,fontSize:16,cursor:'pointer',opacity:(loading||(tab==='signup'&&(!optSMS||!optData)))?0.5:1,marginTop:4}}>
              {loading?'Please wait...':(tab==='login'?'Log In →':tab==='signup'?'Create Account →':'Send Reset Link →')}
            </button>
          </div>
          {tab==='login'&&(
            <p style={{textAlign:'center',marginTop:16,fontSize:13,color:'rgba(240,244,248,0.45)'}}>
              <span onClick={()=>{setTab('forgot');setError('');setSuccess('')}} style={{color:amber,cursor:'pointer',fontWeight:700}}>Forgot password?</span>
            </p>
          )}
          {tab==='forgot'&&(
            <p style={{textAlign:'center',marginTop:16,fontSize:13,color:'rgba(240,244,248,0.45)'}}>
              <span onClick={()=>{setTab('login');setError('');setSuccess('')}} style={{color:amber,cursor:'pointer',fontWeight:700}}>← Back to login</span>
            </p>
          )}
          {tab==='signup'&&(
            <div>
              <p style={{textAlign:'center',marginTop:16,fontSize:13,color:'rgba(240,244,248,0.45)'}}>
                Already have an account?{' '}
                <span onClick={()=>{setTab('login');setError('');setSuccess('')}} style={{color:amber,cursor:'pointer',fontWeight:700}}>Log in</span>
              </p>
              <p style={{textAlign:'center',marginTop:8,fontSize:12,color:'rgba(240,244,248,0.3)'}}>
                By signing up you agree to our{' '}
                <a href='/terms' target='_blank' style={{color:amber,textDecoration:'none',fontWeight:700}}>Terms of Service</a>
                {' '}and{' '}
                <a href='/terms' target='_blank' style={{color:amber,textDecoration:'none',fontWeight:700}}>Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
        <p onClick={()=>router.push('/')} style={{textAlign:'center',marginTop:20,fontSize:13,color:'rgba(240,244,248,0.3)',cursor:'pointer'}}>
          ← Back to WorkBridge
        </p>
      </div>
    </div>
  )
}
