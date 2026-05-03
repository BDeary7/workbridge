'use client'
import { useRouter } from 'next/navigation'
const amber = '#F59E0B'; const dark = '#080C12'; const white = '#F0F4F8'

export default function Terms() {
  const router = useRouter()
  return (
    <div style={{fontFamily:'system-ui,sans-serif',background:dark,color:white,minHeight:'100vh',padding:'40px 24px'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div onClick={()=>router.push('/')} style={{fontSize:24,fontWeight:900,marginBottom:32,cursor:'pointer'}}>
          Work<span style={{color:amber}}>Bridge</span>
        </div>
        <h1 style={{fontSize:32,fontWeight:900,marginBottom:8}}>Terms of Service</h1>
        <p style={{color:'rgba(240,244,248,0.5)',marginBottom:32}}>Last updated: April 27, 2026</p>

        {[
          ['1. Acceptance of Terms','By creating a WorkBridge account, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use our services.'],
          ['2. SMS Consent & Communications','By registering, you expressly consent to receive SMS text messages from WorkBridge and its partner network. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time. Reply HELP for help.'],
          ['3. Data Collection & Sharing','WorkBridge collects your profile information including name, phone, email, employment history, housing status, veteran status, financial information, and other qualifying data. You consent to WorkBridge sharing this information with employers, lenders, service providers, veterans benefits specialists, insurance providers, real estate professionals, and other partners for the purpose of connecting you with relevant services.'],
          ['4. Lead Generation Disclosure','You understand and agree that your profile information may be sold or shared as a lead to third-party businesses and service providers who may contact you via phone, SMS, or email. These partners pay WorkBridge for access to your contact information and qualifying details.'],
          ['5. No Guarantee of Employment or Services','WorkBridge is a connection platform. We do not guarantee employment, housing, loans, benefits, or any other outcome. Results vary by individual circumstances.'],
          ['6. User Responsibilities','You agree to provide accurate information. Providing false information may result in account termination. You are responsible for all activity in your account.'],
          ['7. Privacy Policy','Your data is stored securely and used solely for the purpose of connecting you with relevant service providers. We do not sell your Social Security Number, bank account numbers, or passwords. See our full Privacy Policy at workbridgesms.com/privacy.'],
          ['8. TCPA Compliance','By providing your phone number, you give WorkBridge and its partners express written consent to contact you using automated telephone dialing systems, artificial/prerecorded voice messages, and SMS text messages at the number provided, even if the number is on a Do Not Call registry.'],
          ['9. Limitation of Liability','WorkBridge is not liable for any damages arising from use of our platform, including but not limited to lost income, employment disputes, or data breaches caused by third parties.'],
          ['10. Changes to Terms','We may update these terms at any time. Continued use of WorkBridge constitutes acceptance of updated terms.'],
          ['11. Contact Us','For questions about these terms, contact us at support@workbridge.com or via the Coach Ray chat on your dashboard.'],
        ].map(([title,body])=>(
          <div key={title} style={{marginBottom:28}}>
            <h2 style={{fontSize:18,fontWeight:800,color:amber,marginBottom:8}}>{title}</h2>
            <p style={{fontSize:15,color:'rgba(240,244,248,0.8)',lineHeight:1.8}}>{body}</p>
          </div>
        ))}

        <div style={{marginTop:40,padding:'24px',borderRadius:16,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.3)'}}>
          <p style={{fontSize:14,color:'rgba(240,244,248,0.7)',marginBottom:16}}>By using WorkBridge you agree to all terms above including SMS consent and data sharing with our partner network.</p>
          <button onClick={()=>router.push('/login')}
            style={{padding:'14px 32px',borderRadius:100,border:'none',background:`linear-gradient(135deg,${amber},#D97706)`,color:dark,fontWeight:900,fontSize:16,cursor:'pointer'}}>
            I Agree — Create My Account →
          </button>
        </div>
      </div>
    </div>
  )
}
