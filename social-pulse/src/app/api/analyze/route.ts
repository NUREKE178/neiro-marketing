import { NextRequest, NextResponse } from 'next/server'
import { mockAccounts, mockVideos } from '@/lib/mockData'

export async function POST(req: NextRequest) {
  try {
    const { query, platform, region } = await req.json()

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    // Detect platform and search type (same logic as utils)
    const lower = query.toLowerCase()
    let detectedPlatform: 'instagram' | 'tiktok' | 'all' = 'all'
    if (lower.includes('instagram')) detectedPlatform = 'instagram'
    if (lower.includes('tiktok')) detectedPlatform = 'tiktok'
    
    let searchType: 'account' | 'video' | 'niche' = 'niche'
    if (query.startsWith('@') || lower.includes('instagram.com/') || lower.includes('tiktok.com/@')) {
      searchType = 'account'
    } else if (lower.includes('/p/') || lower.includes('/video/')) {
      searchType = 'video'
    }

    // Simulate API delay + rate limit handling
    await new Promise(r => setTimeout(r, 800))

    // In production: check official APIs, OAuth, etc.
    // For demo: return mock data with DEMO badge

    const filteredAccounts = mockAccounts.filter(acc => {
      if (platform && platform !== 'all' && acc.platform !== platform) return false
      if (region && region !== 'all' && region !== 'Барлық өңірлер' && acc.region !== region.toLowerCase()) {
        // If region filter but account region not verified, mark as unverified, don't exclude
        return true
      }
      // Simple niche search
      if (searchType === 'niche') {
        const q = query.toLowerCase()
        return acc.bio?.toLowerCase().includes(q) || acc.username.toLowerCase().includes(q) || acc.displayName.toLowerCase().includes(q) || q === 'ойыншық' || q === 'toys'
      }
      return true
    }).slice(0, 5)

    return NextResponse.json({
      query,
      platform: platform || detectedPlatform,
      searchType,
      region: region || 'all',
      accounts: filteredAccounts,
      videos: mockVideos.slice(0, 5),
      totalFound: filteredAccounts.length,
      source: 'Instagram Official API + TikTok Official API (demo mode)',
      lastUpdated: new Date().toISOString(),
      isDemo: true,
      disclaimer: 'DEMO DATA — нақты аккаунт статистикасы емес. Бұл есеп тек қолжетімді жария деректер мен рұқсат етілген API нәтижелеріне негізделген.',
      rateLimit: { remaining: 95, limit: 100 },
      cache: 'MISS'
    })
  } catch (e) {
    return NextResponse.json({ error: 'Internal error', details: String(e) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SOCIAL PULSE Analyze API',
    usage: 'POST { query, platform, region }',
    demo: true,
    docs: 'https://api.socialpulse.demo/docs',
    limits: 'Official APIs only, no scraping, OAuth for private accounts'
  })
}
