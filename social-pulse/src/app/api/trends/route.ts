import { NextResponse } from 'next/server'
import { mockTrendData } from '@/lib/mockData'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const niche = searchParams.get('niche') || 'ойыншық'

  return NextResponse.json({
    ...mockTrendData,
    niche,
    isDemo: true,
    source: 'Official APIs aggregated (demo)',
    lastUpdated: new Date().toISOString(),
    disclaimer: 'DEMO DATA — нақты аккаунт статистикасы емес. Графиктер тек қолда бар және нақты алынған деректерге негізделген.'
  })
}
