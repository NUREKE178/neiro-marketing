import { NextResponse } from 'next/server'
import { mockAccounts } from '@/lib/mockData'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  const platform = searchParams.get('platform')

  if (username) {
    const account = mockAccounts.find(a => a.username === username)
    if (!account) {
      return NextResponse.json({ error: 'Account not found', isDemo: true }, { status: 404 })
    }
    return NextResponse.json({ ...account, isDemo: true })
  }

  return NextResponse.json({
    accounts: mockAccounts,
    total: mockAccounts.length,
    isDemo: true,
    source: 'Official APIs (demo)',
    disclaimer: 'DEMO DATA — нақты аккаунт статистикасы емес'
  })
}
