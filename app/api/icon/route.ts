import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const size = req.nextUrl.pathname.includes('512') ? 512 : 192
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size*0.2}" fill="#080C12"/>
    <text x="50%" y="54%" font-size="${size*0.55}" text-anchor="middle" dominant-baseline="middle">🌉</text>
    <text x="50%" y="82%" font-size="${size*0.12}" text-anchor="middle" fill="#10B981" font-family="Arial" font-weight="bold">WorkBridge</text>
  </svg>`
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' }})
}
