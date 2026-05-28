import type { ReactNode } from 'react'
export const metadata = { title: 'Terms & Conditions — WorkBridge' }

export default function TermsPage() {
  const A = '#F59E0B', W = '#F0F4F8', BG = '#0A0E14'
  return (
    <main style={{minHeight:'100vh',background:BG,color:W,padding:'40px 20px',lineHeight:1.7}}>
      <div style={{maxWidth:760,margin:'0 auto'}}>
        <a href="/" style={{color:A,textDecoration:'none',fontSize:14}}>← Back to WorkBridge</a>
        <h1 style={{fontSize:32,fontWeight:800,marginTop:24,marginBottom:4}}>
          Work<span style={{color:A}}>Bridge</span> Terms &amp; Conditions
        </h1>
        <p style={{color:'rgba(240,244,248,.5)',fontSize:14,marginBottom:32}}>Last Updated: May 28, 2026</p>

        <Section n="1. Acceptance of Terms">
          Welcome to WorkBridge, operated by WorkBridge ("WorkBridge," "we," "us," or "our"). By accessing or using our website (workbridgesms.com), mobile-accessible application, or SMS text messaging services (collectively, the "Service"), you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use the Service. WorkBridge connects job seekers and individuals seeking employment, education, housing, veteran, and related social services to resources and opportunities, primarily through SMS text messaging and an AI-powered coaching assistant ("Coach Ray").
        </Section>

        <Section n="2. Eligibility">
          You must be at least 18 years old to use the Service. By using the Service, you represent that you are 18 or older and that the information you provide is accurate and truthful.
        </Section>

        <Section n="3. SMS / Text Messaging Terms">
          <strong>3.1 Consent to Receive Messages.</strong> By providing your mobile phone number and opting in (including by texting a keyword such as JOIN or HOLA), you expressly consent to receive recurring automated text messages from WorkBridge at the number provided, including messages sent by an automatic telephone dialing system. Consent is not a condition of any purchase.<br/><br/>
          <strong>3.2 Message Frequency.</strong> Message frequency varies based on your activity and the services you request.<br/><br/>
          <strong>3.3 Message and Data Rates.</strong> Message and data rates may apply according to your mobile carrier plan. WorkBridge is not responsible for carrier charges.<br/><br/>
          <strong>3.4 Opt-Out.</strong> You may opt out at any time by replying STOP to any message. After you send STOP, we will send one confirmation message and then cease sending messages, except as required to complete transactions you have already initiated. For help, reply HELP or contact us at brandondeary5@gmail.com.<br/><br/>
          <strong>3.5 Carrier Disclaimer.</strong> Mobile carriers are not liable for delayed or undelivered messages.<br/><br/>
          <strong>3.6 Supported Carriers.</strong> The Service may not be available on all mobile carriers.
        </Section>

        <Section n="4. The Service and Coach Ray (AI Assistant)">
          <strong>4.1</strong> Coach Ray is an artificial intelligence assistant that helps guide you through employment, education, housing, and related missions. Coach Ray may draft messages, search for resources, and provide informational guidance.<br/><br/>
          <strong>4.2 Not Professional Advice.</strong> Information provided through the Service, including by Coach Ray, is for general informational purposes only and does not constitute legal, financial, medical, immigration, or professional advice. You should consult a qualified professional for advice specific to your situation.<br/><br/>
          <strong>4.3 No Guarantee of Outcomes.</strong> WorkBridge does not guarantee employment, job placement, housing, benefits, educational outcomes, or any specific result. References to past results are illustrative and not promises of future outcomes.<br/><br/>
          <strong>4.4 Third-Party Outreach.</strong> With your direction, the Service may send outreach messages on your behalf to employers, agencies, service providers, or other third parties. You are responsible for the accuracy of information you authorize us to share.
        </Section>

        <Section n="5. User Responsibilities">
          You agree to: (a) provide accurate, current information; (b) use the Service only for lawful purposes; (c) not impersonate any person or misrepresent your affiliation; (d) not use the Service to harass, abuse, or harm others; (e) not attempt to gain unauthorized access to the Service or its systems; and (f) not use the Service to transmit unlawful, fraudulent, or malicious content.
        </Section>

        <Section n="6. Accounts and Credits">
          <strong>6.1</strong> Certain features require an account and/or message credits. You are responsible for maintaining the confidentiality of your account credentials.<br/><br/>
          <strong>6.2</strong> Paid credits, where offered, are subject to the pricing displayed at the time of purchase. Except where required by law, fees are non-refundable.
        </Section>

        <Section n="7. Intellectual Property">
          The Service, including its software, design, text, and the Coach Ray system, is owned by WorkBridge and protected by applicable intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of the Service without our written permission.
        </Section>

        <Section n="8. Third-Party Services">
          The Service relies on third-party providers, including SMS delivery providers, AI processing providers, payment processors, and hosting providers. Your use of the Service may be subject to those providers' terms. WorkBridge is not responsible for the acts or omissions of third parties.
        </Section>

        <Section n="9. Disclaimers">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
        </Section>

        <Section n="10. Limitation of Liability">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WORKBRIDGE AND ITS OPERATORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR DATA, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
        </Section>

        <Section n="11. Indemnification">
          You agree to indemnify and hold harmless WorkBridge from any claims, damages, or expenses arising from your violation of these Terms or misuse of the Service.
        </Section>

        <Section n="12. Termination">
          We may suspend or terminate your access to the Service at any time for any reason, including violation of these Terms. You may stop using the Service at any time.
        </Section>

        <Section n="13. Changes to These Terms">
          We may update these Terms from time to time. Material changes will be posted at workbridgesms.com with an updated "Last Updated" date. Continued use after changes constitutes acceptance.
        </Section>

        <Section n="14. Governing Law">
          These Terms are governed by the laws of the State of California, without regard to conflict-of-law principles. Any disputes will be resolved in the state or federal courts located in Orange County, California.
        </Section>

        <Section n="15. Contact">
          Questions about these Terms: brandondeary5@gmail.com | workbridgesms.com
        </Section>

        <p style={{marginTop:40,fontSize:13,color:'rgba(240,244,248,.4)'}}>
          <a href="/privacy" style={{color:A}}>Privacy Policy</a> · © 2026 WorkBridge
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
