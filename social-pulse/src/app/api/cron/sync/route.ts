export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// Vercel Cron or external cron calls this endpoint
// Config in vercel.json: { "crons": [{ "path": "/api/cron/sync", "schedule": "0 */6 * * *" }] }

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Trigger sync for all accounts needing it
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'METRICS' })
    })
    const data = await res.json()
    
    return NextResponse.json({ 
      message: 'Cron sync triggered',
      asiaAlmatyTime: new Date().toLocaleString('en-US', { timeZone: 'Asia/Almaty' }),
      result: data 
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
