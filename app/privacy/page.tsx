import type { ReactNode } from 'react'
export const metadata = { title: 'Privacy Policy — WorkBridge' }

export default function PrivacyPage() {
  const A = '#F59E0B', W = '#F0F4F8', BG = '#0A0E14'
  return (
    <main style={{minHeight:'100vh',background:BG,color:W,padding:'40px 20px',lineHeight:1.7}}>
      <div style={{maxWidth:760,margin:'0 auto'}}>
        <a href="/" style={{color:A,textDecoration:'none',fontSize:14}}>← Back to WorkBridge</a>
        <h1 style={{fontSize:32,fontWeight:800,marginTop:24,marginBottom:4}}>
          Work<span style={{color:A}}>Bridge</span> Privacy Policy
        </h1>
        <p style={{color:'rgba(240,244,248,.5)',fontSize:14,marginBottom:32}}>Last Updated: May 28, 2026</p>

        <Section n="1. Introduction">
          This Privacy Policy explains how WorkBridge ("WorkBridge," "we," "us") collects, uses, and shares your personal information when you use our website, application, and SMS services (the "Service").
        </Section>

        <Section n="2. Information We Collect">
          <strong>2.1 Information you provide:</strong> name (first and last); mobile phone number; email address; ZIP code and state; responses to mission questions (e.g., employment goals, education level, housing needs, veteran status, skills, availability); free-text descriptions of your situation; account credentials.<br/><br/>
          <strong>2.2 Information collected automatically:</strong> message logs and conversation history with Coach Ray; service usage data and timestamps; device and technical information necessary to deliver the Service.
        </Section>

        <Section n="3. How We Use Your Information">
          We use your information to: (a) provide and operate the Service; (b) power the Coach Ray AI assistant to guide you and draft messages; (c) connect you with employers, agencies, and service providers at your direction; (d) send you SMS messages you have consented to receive; (e) track service outcomes such as job placements; (f) improve and maintain the Service; and (g) comply with legal obligations.
        </Section>

        <Section n="4. How We Share Your Information">
          <strong>4.1 With employers, agencies, and service providers</strong> — When you direct us to send outreach or connect you to an opportunity, we share relevant information (such as your name, contact details, and qualifications) with those third parties.<br/><br/>
          <strong>4.2 With service providers that operate the platform</strong> — including our SMS delivery provider, our AI processing provider (Anthropic), payment processor, and hosting providers. These providers process data on our behalf.<br/><br/>
          <strong>4.3 With government or partner agencies</strong> — Where you are served through a government-funded or partner program (such as workforce or care-coordination programs), we may share outcome and enrollment data as required for that program, consistent with applicable law.<br/><br/>
          <strong>4.4 For legal reasons</strong> — When required by law, subpoena, or to protect the rights, safety, or property of WorkBridge or others.<br/><br/>
          <strong>4.5 We do not sell your personal information.</strong>
        </Section>

        <Section n="5. SMS Data">
          Mobile information collected for SMS delivery is used solely to provide the messaging Service. No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Consent to receive SMS is handled as described in our Terms &amp; Conditions.
        </Section>

        <Section n="6. AI Processing">
          Conversations may be processed by a third-party AI provider (Anthropic) to generate Coach Ray's responses, search for resources, and draft messages. We share only the information necessary to provide these features.
        </Section>

        <Section n="7. Data Retention">
          We retain your information for as long as your account is active or as needed to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion as described below.
        </Section>

        <Section n="8. Your Rights and Choices">
          <strong>8.1 Opt out of SMS</strong> — Reply STOP at any time.<br/><br/>
          <strong>8.2 Access, correction, and deletion</strong> — You may request access to, correction of, or deletion of your personal information by contacting brandondeary5@gmail.com.<br/><br/>
          <strong>8.3 California residents (CCPA/CPRA)</strong> — California residents have the right to know what personal information we collect, request deletion, correct inaccurate information, and opt out of sale or sharing (we do not sell personal information). We will not discriminate against you for exercising these rights.
        </Section>

        <Section n="9. Data Security">
          We use reasonable administrative and technical measures to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
        </Section>

        <Section n="10. Children's Privacy">
          The Service is not directed to individuals under 18, and we do not knowingly collect personal information from minors. If we learn we have collected such information, we will delete it.
        </Section>

        <Section n="11. Changes to This Policy">
          We may update this Privacy Policy from time to time. Material changes will be posted at workbridgesms.com with an updated "Last Updated" date.
        </Section>

        <Section n="12. Contact">
          Questions or requests regarding privacy: brandondeary5@gmail.com | workbridgesms.com
        </Section>

        <p style={{marginTop:40,fontSize:13,color:'rgba(240,244,248,.4)'}}>
          <a href="/terms" style={{color:A}}>Terms &amp; Conditions</a> · © 2026 WorkBridge
        </p>
      </div>
    </main>
  )
}

function Section({n,children}:{n:string,children:ReactNode}) {
  return (
    <div style={{marginBottom:24}}>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:8,color:'#F59E0B'}}>{n}</h2>
      <p style={{fontSize:15,color:'rgba(240,244,248,.85)'}}>{children}</p>
    </div>
  )
}
