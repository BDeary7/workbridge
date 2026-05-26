'use client'
import { useState, useEffect } from 'react'

const API = 'https://workbridge-api.onrender.com'
const A='#F59E0B',G='#10B981',D='#080C12',W='#F0F4F8'

const STATUS_COLORS: Record<string,string> = {
  contacted:'#64748B',replied:'#3B82F6',interviewed:'#F59E0B',
  offered:'#8B5CF6',hired:'#10B981',retained_30:'#10B981',
  retained_90:'#059669',declined:'#EF4444'
}

export default function CaseManagerPortal() {
  const [authed, setAuthed]       = useState(false)
  const [pin, setPin]             = useState('')
  const [err, setErr]             = useState('')
  const [clients, setClients]     = useState<any[]>([])
  const [stats, setStats]         = useState<any>(null)
  const [selected, setSelected]   = useState<any>(null)
  const [placements, setPlacements] = useState<any[]>([])
  const [loading, setLoading]     = useState(false)

  const AGENCY_PIN = 'WB2026OC'

  useEffect(() => {
    if (localStorage.getItem('cm_authed')==='1') { setAuthed(true); loadDashboard() }
  }, [])

  const handleAuth = () => {
    if (pin.toUpperCase()===AGENCY_PIN) {
      localStorage.setItem('cm_authed','1'); setAuthed(true); loadDashboard()
    } else { setErr('Invalid access code') }
  }

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const tok = localStorage.getItem('wb_token')||''
      const res = await fetch(`${API}/agency/stats`,{headers:{Authorization:`Bearer ${tok}`}})
      const data = await res.json()
      setStats(data); setClients(data.clients||[])
    } catch {}
    setLoading(false)
  }

  const loadClient = async (id:number) => {
    const tok = localStorage.getItem('wb_token')||''
    const res = await fetch(`${API}/agency/client/${id}`,{headers:{Authorization:`Bearer ${tok}`}})
    const data = await res.json()
    setSelected(data.client); setPlacements(data.placements||[])
  }

  const card:React.CSSProperties = {background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:16,padding:24}

  if (!authed) return (
    <div style={{minHeight:'100vh',background:D,color:W,fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:380,...card}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:36}}>🌉</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800}}>WorkBridge</div>
          <div style={{fontSize:13,color:'rgba(240,244,248,.5)',marginTop:4}}>Case Manager Portal</div>
        </div>
        {err&&<div style={{color:'#EF4444',fontSize:12,marginBottom:10,textAlign:'center'}}>{err}</div>}
        <input value={pin} onChange={e=>setPin(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&handleAuth()}
          placeholder="Agency access code"
          style={{width:'100%',padding:'12px 14px',borderRadius:10,background:'#060B14',
            border:'1px solid #1E3A5F',color:W,fontSize:14,outline:'none',
            marginBottom:12,boxSizing:'border-box',letterSpacing:4,textAlign:'center'}}/>
        <button onClick={handleAuth}
          style={{width:'100%',padding:'13px 0',border:'none',cursor:'pointer',
            borderRadius:10,background:G,color:D,fontWeight:700,fontSize:15}}>
          Access Portal →
        </button>
        <div style={{fontSize:11,color:'rgba(240,244,248,.3)',textAlign:'center',marginTop:12}}>
          Access code: WB2026OC · Contact: brandondeary777@gmail.com
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:D,color:W,fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Syne:wght@800&display=swap" rel="stylesheet"/>
      <nav style={{background:'rgba(8,12,18,.97)',borderBottom:'1px solid rgba(255,255,255,.08)',
        padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:800}}>
          🌉 WorkBridge <span style={{color:G,fontSize:13,fontWeight:400}}>Case Manager</span>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span style={{fontSize:12,color:'rgba(240,244,248,.5)'}}>OC Workforce Solutions</span>
          <button onClick={()=>{localStorage.removeItem('cm_authed');setAuthed(false)}}
            style={{padding:'6px 14px',borderRadius:20,border:'1px solid rgba(255,255,255,.15)',
              background:'transparent',color:'rgba(240,244,248,.5)',cursor:'pointer',fontSize:12}}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:24}}>
        {stats&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:28}}>
            {[
              {label:'Total Clients',value:stats.total_clients||0,color:W},
              {label:'Contacted',value:stats.total_contacted||0,color:'#3B82F6'},
              {label:'Replied',value:stats.total_replied||0,color:A},
              {label:'Interviewed',value:stats.total_interviewed||0,color:'#8B5CF6'},
              {label:'Hired',value:stats.total_hired||0,color:G},
              {label:'30-Day Retained',value:stats.total_retained_30||0,color:'#059669'},
            ].map((s,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:20,textAlign:'center'}}>
                <div style={{fontSize:32,fontWeight:900,color:s.color}}>{s.value}</div>
                <div style={{fontSize:11,color:'rgba(240,244,248,.5)',marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:20}}>
          <div style={card}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:'rgba(240,244,248,.4)',marginBottom:14}}>
              CLIENTS ({clients.length})
            </div>
            {loading&&<div style={{color:'rgba(240,244,248,.4)',fontSize:13}}>Loading...</div>}
            {clients.length===0&&!loading&&(
              <div style={{color:'rgba(240,244,248,.3)',fontSize:13,textAlign:'center',padding:20}}>
                No clients registered yet
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {clients.map((c:any)=>(
                <div key={c.id} onClick={()=>loadClient(c.id)}
                  style={{padding:'12px 14px',borderRadius:10,cursor:'pointer',
                    background:selected?.id===c.id?'rgba(16,185,129,.1)':'rgba(255,255,255,.03)',
                    border:`1px solid ${selected?.id===c.id?G:'rgba(255,255,255,.06)'}`,
                    transition:'all .2s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{c.first_name} {c.last_name}</div>
                      <div style={{fontSize:11,color:'rgba(240,244,248,.4)',marginTop:2}}>
                        {c.zip_code}, {c.state} · {c.language?.toUpperCase()}
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:11,fontWeight:700,
                        color:STATUS_COLORS[c.placement_status||'contacted']||A}}>
                        {c.placement_status||'contacted'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {!selected?(
              <div style={{...card,display:'flex',alignItems:'center',justifyContent:'center',
                minHeight:300,color:'rgba(240,244,248,.3)',fontSize:14}}>
                Select a client to view placement progress
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={card}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800}}>
                    {selected.first_name} {selected.last_name}
                  </div>
                  <div style={{fontSize:13,color:'rgba(240,244,248,.5)',marginTop:6}}>
                    📱 {selected.phone} · 📍 {selected.zip_code}, {selected.state} · 🎯 {selected.target_job||'Not specified'}
                  </div>
                </div>

                <div style={card}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:'rgba(240,244,248,.4)',marginBottom:14}}>
                    PLACEMENT PIPELINE
                  </div>
                  <div style={{display:'flex',gap:4,marginBottom:20}}>
                    {['contacted','replied','interviewed','offered','hired','retained_30'].map((s,i)=>{
                      const active = placements.some((p:any)=>p.status===s)
                      return <div key={i} style={{flex:1,height:6,borderRadius:3,
                        background:active?STATUS_COLORS[s]:'rgba(255,255,255,.1)',transition:'all .3s'}}/>
                    })}
                  </div>
                  {placements.length===0?(
                    <div style={{color:'rgba(240,244,248,.3)',fontSize:13,textAlign:'center',padding:20}}>
                      No placement activity yet
                    </div>
                  ):(
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {placements.map((p:any,i:number)=>(
                        <div key={i} style={{padding:'12px 14px',borderRadius:10,
                          background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',
                          display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:13}}>{p.contact_name||p.employer_name||'Employer'}</div>
                            <div style={{fontSize:11,color:'rgba(240,244,248,.4)',marginTop:2}}>
                              {p.contact_phone}{p.wage?` · ${p.wage}`:''}
                            </div>
                            {p.notes&&<div style={{fontSize:11,color:'rgba(240,244,248,.5)',marginTop:4}}>{p.notes}</div>}
                          </div>
                          <div style={{textAlign:'right'}}>
                            <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,
                              background:`${STATUS_COLORS[p.status]||'#64748B'}22`,
                              color:STATUS_COLORS[p.status]||'#64748B',
                              border:`1px solid ${STATUS_COLORS[p.status]||'#64748B'}44`}}>
                              {p.status}
                            </span>
                            <div style={{fontSize:10,color:'rgba(240,244,248,.3)',marginTop:4}}>
                              {new Date(p.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
