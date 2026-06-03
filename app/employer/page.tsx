'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API || 'https://workbridge-api.onrender.com'

export default function EmployerPage() {
  const A = '#F59E0B', G = '#10B981', W = '#F0F4F8', BG = '#0A0E14'
  const [form, setForm] = useState({business_name:'',contact_name:'',phone:'',email:'',zip_code:'',category:''})
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const categories = ['Restaurant / Food','Retail / Sales','Construction / Labor','Warehouse / Logistics',
    'Healthcare / Medical','Cleaning / Janitorial','Landscaping / Lawn','Auto / Mechanic',
    'Office / Admin','Staffing Agency','Other']

  const submit = async () => {
    if (!form.business_name || !form.contact_name || !form.phone) {
      setStatus('Please fill in business name, contact name, and phone.'); return
    }
    setLoading(true); setStatus('')
    try {
      const res = await fetch(`${API}/employer/register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      })
      const data = await res.json()
      setStatus(data.message || 'Registered!')
      setDone(true)
    } catch { setStatus('Connection error. Please try again.') }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh',background:BG,color:W,padding:'40px 20px'}}>
      <div style={{maxWidth:520,margin:'0 auto'}}>
        <a href="/" style={{color:A,textDecoration:'none',fontSize:14}}>Back to WorkBridge</a>
        <h1 style={{fontSize:32,fontWeight:800,marginTop:20,marginBottom:4}}>
          Work<span style={{color:A}}>Bridge</span> <span style={{color:G}}>for Employers</span>
        </h1>
        <p style={{color:'rgba(240,244,248,.6)',fontSize:15,marginBottom:28,lineHeight:1.6}}>
          Register your business and get connected to job seekers in your area — instantly, by text.
          WorkBridge sends you pre-screened candidates who are ready to work. No job boards, no waiting.
        </p>

        {done ? (
          <div style={{padding:24,background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.3)',borderRadius:14,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12}}>&#x2705;</div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>{status}</div>
            <p style={{color:'rgba(240,244,248,.6)',fontSize:14}}>
              You will receive a welcome text shortly. Job seekers near your area will be connected to you via SMS.
              Reply STOP at any time to opt out.
            </p>
            <p style={{color:A,fontSize:14,marginTop:16}}>
              Or text <strong>HIRE</strong> to (949) 463-5289 to register instantly from your phone.
            </p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <input placeholder="Business Name *" value={form.business_name}
              onChange={e=>setForm({...form,business_name:e.target.value})}
              style={{padding:'14px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',color:W,fontSize:15}} />
            <input placeholder="Your Name *" value={form.contact_name}
              onChange={e=>setForm({...form,contact_name:e.target.value})}
              style={{padding:'14px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',color:W,fontSize:15}} />
            <input placeholder="Phone Number *" value={form.phone} type="tel"
              onChange={e=>setForm({...form,phone:e.target.value})}
              style={{padding:'14px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',color:W,fontSize:15}} />
            <input placeholder="Email (optional)" value={form.email} type="email"
              onChange={e=>setForm({...form,email:e.target.value})}
              style={{padding:'14px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',color:W,fontSize:15}} />
            <input placeholder="ZIP Code" value={form.zip_code}
              onChange={e=>setForm({...form,zip_code:e.target.value})}
              style={{padding:'14px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',color:W,fontSize:15}} />
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
              style={{padding:'14px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,.15)',background:'rgba(15,20,30,1)',color:form.category?W:'rgba(240,244,248,.4)',fontSize:15}}>
              <option value="">What type of business?</option>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>

            {status && <div style={{padding:'10px 14px',borderRadius:8,background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.3)',color:A,fontSize:13}}>{status}</div>}

            <button onClick={submit} disabled={loading}
              style={{padding:'16px',borderRadius:12,background:`linear-gradient(135deg,${A},#D97706)`,color:'#000',
                fontWeight:800,fontSize:16,border:'none',cursor:'pointer',marginTop:8}}>
              {loading ? 'Registering...' : 'Register My Business'}
            </button>

            <p style={{fontSize:12,color:'rgba(240,244,248,.4)',textAlign:'center',marginTop:8}}>
              By registering, you agree to receive SMS from WorkBridge with job seeker connections.
              Reply STOP to opt out. Message and data rates may apply.
              <br/><a href="/terms" style={{color:A}}>Terms</a> | <a href="/privacy" style={{color:A}}>Privacy</a>
            </p>

            <div style={{marginTop:20,padding:16,background:'rgba(255,255,255,.03)',borderRadius:10,textAlign:'center'}}>
              <p style={{fontSize:13,color:'rgba(240,244,248,.5)'}}>Prefer to register by text?</p>
              <p style={{fontSize:18,fontWeight:700,color:G,marginTop:4}}>Text HIRE to (949) 463-5289</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
