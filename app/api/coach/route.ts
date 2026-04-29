import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  try {
    const res = await fetch('https://workbridge-api.onrender.com/coach/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000)
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ reply: "I'm warming up — please send your message again in 10 seconds! I'm here to help. 🤖" })
  }
}
