'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API || 'https://workbridge-api.onrender.com'

export default function EmployerDashboard() {
  const A='#F59E0B',G='#10B981',W='#F0F4F8',BG='#0A0E14'
  const [candidates,setCandidates]=useState<any[]>([])
  const [filtered,setFiltered]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [selected,setSelected]=useState<any>(null)
  const [msg,setMsg]=useState('')
  const [sent,setSent]=useState(false)
  const [filterSkill,setFilterSkill]=useState('')
  const [filterZip,setFilterZip]=useState('')
  const [stats,setStats]=useState({total:0,contacted:0,hired:0})
  const tok=()=>typeof window!=='undefined'?localStorage.getItem('wb_token'):null

  useEffect(()=>{
    (async()=>{
      try{
        const t=tok(); if(!t){setLoading(false);return}
        const res=await fetch(`${API}/employer/candidates`,{headers:{Authorization:`Bearer ${t}`}})
        const data=await res.json()
        const c=data.candidates||[]
        setCandidates(c); setFiltered(c)
        setStats({total:c.length,contacted:c.filter((x:any)=>x.contacted).length,hired:c.filter((x:any)=>x.hired).length})
      }catch(e){console.error(e)}finally{setLoading(false)}
    })()
  },[])

  useEffect(()=>{
    let f=candidates
    if(filterSkill) f=f.filter((c:any)=>(c.skills||'').toLowerCase().includes(filterSkill.toLowerCase())||(c.target_job||'').toLowerCase().includes(filterSkill.toLowerCase()))
    if(filterZip) f=f.filter((c:any)=>(c.zip_code||'').includes(filterZip))
    setFiltered(f)
  },[filterSkill,filterZip,candidates])

  const sendMessage=async()=>{
    if(!msg||!selected)return
    try{
      const t=tok()
      await fetch(`${API}/employer/message-candidate`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},body:JSON.stringify({candidate_id:selected.id,message:msg})})
      setMsg(''); setSent(true); setTimeout(()=>setSent(false),3000)
    }catch(e){console.error(e)}
  }

  const markHired=async(id:number)=>{
    try{
      const t=tok()
      await fetch(`${API}/employer/mark-hired`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},body:JSON.stringify({candidate_id:id})})
      setCandidates(prev=>prev.map(c=>c.id===id?{...c,hired:true}:c))
    }catch(e){console.error(e)}
  }

  return (
    <main style={{minHeight:'100vh',background:BG,color:W,padding:'24px 16px'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <a href="/" style={{color:A,textDecoration:'none',fontSize:13}}>← Back to WorkBridge</a>
        <h1 style={{fontSize:28,fontWeight:800,marginTop:12,marginBottom:4}}>
          Employer <span style={{color:A}}>Dashboard</span>
        </h1>
        <p style={{color:'rgba(240,244,248,.5)',fontSize:14,marginBottom:20}}>
          Access pre-qualified candidates ready to work. Filter by skills, location, and availability.
        </p>
        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          {[{label:'Total Candidates',val:stats.total,color:A},{label:'Contacted',val:stats.contacted,color:'#3B82F6'},{label:'Hired',val:stats.hired,color:G}].map((s,i)=>(
            <div key={i} style={{flex:1,minWidth:120,padding:'16px',background:'rgba(255,255,255,.04)',borderRadius:12,border:`1px solid ${s.color}30`}}>
              <div style={{fontSize:24,fontWeight:800,color:s.color}}>{s.val}</div>
              <div style={{fontSize:12,color:'rgba(240,244,248,.5)'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
          <input placeholder="Filter by skill or job type..." value={filterSkill} onChange={e=>setFilterSkill(e.target.value)}
            style={{flex:1,minWidth:200,padding:'10px 14px',borderRadius:10,border:'1px solid rgba(255,255,255,.12)',background:'rgba(255,255,255,.05)',color:W,fontSize:14}}/>
          <input placeholder="ZIP code" value={filterZip} onChange={e=>setFilterZip(e.target.value)}
            style={{width:100,padding:'10px 14px',borderRadius:10,border:'1px solid rgba(255,255,255,.12)',background:'rgba(255,255,255,.05)',color:W,fontSize:14}}/>
        </div>
        {loading?<div style={{textAlign:'center',padding:40,color:'rgba(240,244,248,.4)'}}>Loading candidates...</div>:(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {filtered.length===0&&<div style={{textAlign:'center',padding:40,color:'rgba(240,244,248,.4)'}}>No candidates found. Adjust your filters or check back soon.</div>}
            {filtered.map((c:any)=>(
              <div key={c.id} style={{padding:'14px 16px',background:selected?.id===c.id?'rgba(245,158,11,.08)':'rgba(255,255,255,.03)',
                border:`1px solid ${selected?.id===c.id?'rgba(245,158,11,.3)':'rgba(255,255,255,.08)'}`,borderRadius:12,cursor:'pointer'}}
                onClick={()=>setSelected(c)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div style={{fontWeight:700,fontSize:15}}>{c.first_name||'Candidate'} {(c.last_name||'').charAt(0)}.</div>
                  <div style={{display:'flex',gap:6}}>
                    {c.contacted&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:6,background:'rgba(59,130,246,.15)',color:'#3B82F6'}}>Contacted</span>}
                    {c.hired&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:6,background:'rgba(16,185,129,.15)',color:G}}>Hired ✓</span>}
                  </div>
                </div>
                <div style={{fontSize:13,color:'rgba(240,244,248,.6)',display:'flex',gap:16,flexWrap:'wrap'}}>
                  {c.target_job&&<span>🎯 {c.target_job}</span>}
                  {c.skills&&<span>🛠 {c.skills}</span>}
                  {c.zip_code&&<span>📍 {c.zip_code}</span>}
                  {c.availability&&<span>⏰ {c.availability}</span>}
                  {c.language&&c.language!=='en'&&<span>🌐 {c.language==='es'?'Español':c.language}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {selected&&(
          <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#111827',borderTop:'1px solid rgba(245,158,11,.3)',padding:'16px 20px',zIndex:50}}>
            <div style={{maxWidth:900,margin:'0 auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:14}}>Message {selected.first_name||'Candidate'}</span>
                <div style={{display:'flex',gap:8}}>
                  {!selected.hired&&<button onClick={()=>markHired(selected.id)}
                    style={{padding:'6px 14px',borderRadius:8,background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.3)',color:G,fontSize:12,cursor:'pointer'}}>
                    Mark Hired ✓</button>}
                  <button onClick={()=>setSelected(null)}
                    style={{padding:'6px 14px',borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:W,fontSize:12,cursor:'pointer'}}>
                    Close</button>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <input placeholder="Type your message to this candidate..." value={msg} onChange={e=>setMsg(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&sendMessage()}
                  style={{flex:1,padding:'12px 14px',borderRadius:10,border:'1px solid rgba(255,255,255,.12)',background:'rgba(255,255,255,.05)',color:W,fontSize:14}}/>
                <button onClick={sendMessage}
                  style={{padding:'12px 20px',borderRadius:10,background:`linear-gradient(135deg,${A},#D97706)`,color:'#000',fontWeight:800,fontSize:14,border:'none',cursor:'pointer'}}>
                  {sent?'✓ Sent':'Send SMS'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
