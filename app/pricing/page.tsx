'use client'

export default function Pricing() {
  const A='#F59E0B',G='#10B981',W='#F0F4F8',BG='#0A0E14'
  const plans=[
    {name:'Job Seeker',price:'$9.99',period:'/month',color:A,features:['Unlimited Coach Ray access','All 10 missions (jobs, housing, education, veteran, debt & more)','GED tutoring with mock tests & study plans','Personalized job matching by ZIP code','SMS alerts when employers respond','Document generation (resumes, cover letters, plans)','Bilingual EN/ES support','Credit repair & business startup guidance'],cta:'Start Free Trial',href:'/signup'},
    {name:'Employer',price:'$499',period:'/month',color:G,popular:true,features:['Access pre-qualified candidate pool','Filter candidates by skill, ZIP, availability','Direct SMS messaging to candidates ($0.10/msg)','Coach Ray appointment setting','Candidate tracking dashboard','Mark hired + outcome reporting','Pay-per-lead for premium qualified candidates','White-label option available'],cta:'Get Started',href:'/employer'},
    {name:'Organization',price:'Custom',period:'',color:'#8B5CF6',features:['White-label platform (your brand, our tech)','Case manager portal with outcome tracking','Unlimited client onboarding','Coach Ray powered by your org name','Custom missions for your programs','Employer partnership tools','API access for CRM integration','Dedicated support'],cta:'Contact Us',href:'/employer'}
  ]
  return (
    <main style={{minHeight:'100vh',background:BG,color:W,padding:'40px 16px'}}>
      <div style={{maxWidth:1000,margin:'0 auto',textAlign:'center'}}>
        <a href="/" style={{color:A,textDecoration:'none',fontSize:13}}>← Back to WorkBridge</a>
        <h1 style={{fontSize:36,fontWeight:800,marginTop:20,marginBottom:8}}>
          Simple, <span style={{color:A}}>Transparent</span> Pricing
        </h1>
        <p style={{color:'rgba(240,244,248,.5)',fontSize:16,maxWidth:500,margin:'0 auto 40px'}}>
          Whether you are looking for work or looking for workers — WorkBridge connects you faster than any job board.
        </p>
        <div style={{display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
          {plans.map((p:any,i:number)=>(
            <div key={i} style={{flex:1,minWidth:280,maxWidth:320,padding:'28px 24px',background:'rgba(255,255,255,.03)',
              border:`1px solid ${p.popular?p.color+'60':'rgba(255,255,255,.08)'}`,borderRadius:16,textAlign:'left',position:'relative'}}>
              {p.popular&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',
                padding:'4px 16px',borderRadius:20,background:p.color,color:'#000',fontSize:11,fontWeight:800}}>MOST POPULAR</div>}
              <div style={{fontSize:14,fontWeight:700,color:p.color,marginBottom:8}}>{p.name}</div>
              <div style={{fontSize:36,fontWeight:800,marginBottom:4}}>
                {p.price}<span style={{fontSize:14,color:'rgba(240,244,248,.4)'}}>{p.period}</span>
              </div>
              <div style={{height:1,background:'rgba(255,255,255,.08)',margin:'16px 0'}}/>
              {p.features.map((f:string,j:number)=>(
                <div key={j} style={{fontSize:13,color:'rgba(240,244,248,.7)',padding:'6px 0',display:'flex',gap:8}}>
                  <span style={{color:p.color}}>✓</span>{f}
                </div>
              ))}
              <a href={p.href} style={{display:'block',textAlign:'center',marginTop:20,padding:'14px',borderRadius:12,
                background:p.popular?`linear-gradient(135deg,${p.color},${p.color}CC)`:'rgba(255,255,255,.06)',
                color:p.popular?'#000':W,fontWeight:800,fontSize:14,textDecoration:'none',
                border:p.popular?'none':'1px solid rgba(255,255,255,.12)'}}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,padding:'20px',background:'rgba(255,255,255,.02)',borderRadius:12,maxWidth:600,margin:'40px auto 0'}}>
          <div style={{fontSize:14,fontWeight:700,color:A,marginBottom:8}}>SMS Messaging</div>
          <div style={{fontSize:13,color:'rgba(240,244,248,.6)'}}>
            All plans include Coach Ray AI coaching. SMS messages are billed at $0.10 per message for both job seekers and employers. Message volume scales with your needs — no hidden fees.
          </div>
        </div>
      </div>
    </main>
  )
}
