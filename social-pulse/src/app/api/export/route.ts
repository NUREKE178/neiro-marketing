import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { format, account, dateFrom, dateTo } = await req.json()

  // In production: generate real PDF/CSV/Excel with data, charts, AI summary, disclaimer
  // For demo: return mock file info

  return NextResponse.json({
    success: true,
    format: format || 'PDF',
    fileName: `social-pulse-${account || 'report'}-${new Date().toISOString().split('T')[0]}.${format?.toLowerCase() || 'pdf'}`,
    account,
    dateFrom,
    dateTo,
    dataSources: ['Instagram Official API (demo)', 'TikTok Official API (demo)'],
    includes: ['KPI', 'Charts', 'Top Videos', 'AI Summary', 'Disclaimer'],
    disclaimer: 'Бұл есеп тек қолжетімді жария деректер мен рұқсат етілген API нәтижелеріне негізделген. Деректер толық болмауы мүмкін',
    isDemo: true,
    downloadUrl: '/api/export/download?mock=true'
  })
}
