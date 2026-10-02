export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { getBusinessDiscovery } from '@/lib/meta'
import { decryptToken } from '@/lib/encryption'
import { z } from 'zod'

const querySchema = z.object({
  query: z.string().min(1).max(100),
  platform: z.enum(['all', 'instagram', 'tiktok']).default('all'),
  region: z.string().default('all'),
  type: z.enum(['account', 'niche', 'video']).default('account'),
})

function parseUsername(input: string): { username: string, isUrl: boolean, platformHint: 'instagram' | 'tiktok' | null } {
  const trimmed = input.trim().replace(/^@/, '')
  const igMatch = trimmed.match(/(?:instagram\.com\/)([A-Za-z0-9._]+)/i)
  if (igMatch) return { username: igMatch[1], isUrl: true, platformHint: 'instagram' }
  const ttMatch = trimmed.match(/(?:tiktok\.com\/@)([A-Za-z0-9._]+)/i)
  if (ttMatch) return { username: ttMatch[1], isUrl: true, platformHint: 'tiktok' }
  return { username: trimmed, isUrl: false, platformHint: null }
}

function isNicheQuery(input: string, original: string): boolean {
  if (original.trim().startsWith('@') || original.includes('instagram.com') || original.includes('tiktok.com')) return false
  if (input.includes(' ')) return true
  if (input.length > 30) return true
  // Non-ASCII (kazakh, russian) => niche search, not username
  if (/[^\x00-\x7F]/.test(input)) return true
  // If contains characters not allowed in IG username (only A-Za-z0-9._), it's niche
  if (/[^A-Za-z0-9._]/.test(input)) return true
  return false
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = querySchema.safeParse({
      query: searchParams.get('query') || searchParams.get('q'),
      platform: searchParams.get('platform') || 'all',
      region: searchParams.get('region') || 'all',
      type: searchParams.get('type') || 'account',
    })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query', details: parsed.error }, { status: 400 })
    }
    const { query, platform, region } = parsed.data
    const { username, platformHint } = parseUsername(query)
    const effectivePlatform = platformHint || (platform === 'all' ? 'instagram' : platform)
    const isNiche = isNicheQuery(username, query)

    const prisma = await getPrisma()

    if (effectivePlatform === 'tiktok' && !isNiche) {
      return NextResponse.json({
        success: false,
        isRealCheck: false,
        platform: 'tiktok',
        query: username,
        error: 'TikTok Display API өз аккаунтыңыздың видеоларын ғана алуға рұқсат береді.',
        explanation: {
          kk: 'TikTok-та бөтен аккаунтты тексеру үшін Research API керек, бірақ ол бізде жоқ. Instagram-да Business Discovery арқылы тексеруге болады.',
        },
        suggestion: 'Instagram username жазып көріңіз: @instagram',
        results: []
      })
    }

    let realResult: any = null
    let tokenUsed = false
    let tokenError: string | null = null

    if (prisma && (effectivePlatform === 'instagram' || platform === 'all') && !isNiche) {
      try {
        const connectedAccount = await prisma.connectedAccount.findFirst({
          where: { platform: 'INSTAGRAM', status: 'ACTIVE' },
          orderBy: { lastSyncedAt: 'desc' }
        })
        if (connectedAccount) {
          const token = decryptToken(connectedAccount.tokenEncrypted)
          tokenUsed = true
          const discovery: any = await getBusinessDiscovery(token, connectedAccount.externalId, username)
          if (!discovery) throw new Error('Business Discovery returned null - account may be private or not business')
          realResult = {
            username: discovery.username || username,
            displayName: discovery.name || discovery.username || username,
            platform: 'instagram',
            avatar: discovery.profile_picture_url || `https://i.pravatar.cc/150?u=${username}`,
            bio: discovery.biography || '',
            followers: discovery.followers_count || 0,
            following: discovery.follows_count || 0,
            mediaCount: discovery.media_count || 0,
            region: region,
            regionVerified: false,
            source: 'Instagram Business Discovery API (real)',
            isDemo: false,
            isRealCheck: true,
            publicFieldsOnly: true,
            lastChecked: new Date().toISOString(),
          }
        } else {
          tokenError = 'No connected Instagram Business account. Connect in /overview to enable real checks.'
        }
      } catch (e: any) {
        tokenError = e.message
      }
    }

    if (realResult) {
      if (prisma) {
        try {
          const user = await prisma.user.findFirst()
          if (user) {
            await prisma.trackedAccount.upsert({
              where: { userId_platform_username: { userId: user.id, platform: 'INSTAGRAM', username: realResult.username } },
              update: {},
              create: { userId: user.id, platform: 'INSTAGRAM', username: realResult.username }
            })
          }
        } catch {}
      }
      return NextResponse.json({
        success: true,
        isRealCheck: true,
        platform: 'instagram',
        query: username,
        isNiche: false,
        tokenUsed,
        result: realResult,
        results: [realResult],
        disclaimer: 'Business Discovery — тек жария өрістер (followers, media_count, profile_picture).',
      })
    }

    // Fallback demo
    const singleMock = {
      id: '1',
      username: username,
      displayName: username,
      platform: effectivePlatform,
      avatar: `https://i.pravatar.cc/150?u=${username}`,
      bio: isNiche ? `${username} тақырыбына қатысты — ${region}` : `Аккаунт @${username} — нақты тексеру үшін Instagram Business қосыңыз`,
      followers: 45200,
      totalVideos: 127,
      avgViews: 7023,
      engagementRate: 4.2,
      lastPostDate: '2024-09-28',
      region: region,
      regionVerified: false,
      source: tokenError ? `Demo — ${tokenError}` : 'Demo Data — нақты тексеру үшін Instagram Business қосыңыз',
      isDemo: true,
      isRealCheck: false,
      lastUpdated: new Date().toISOString(),
    }

    const results = isNiche ? [
      { ...singleMock, username: `${username.replace(/\s+/g, '_')}_almaty`, displayName: `${username} Алматы`, followers: 45200, region: 'Алматы', regionVerified: true },
      { ...singleMock, id: '2', username: `${username.replace(/\s+/g, '_')}_kz`, displayName: `${username} Kazakhstan`, followers: 128000, region: 'Қазақстан', regionVerified: false, platform: 'tiktok' },
      { ...singleMock, id: '3', username: `balalar_${username.replace(/\s+/g, '_')}`, displayName: `Балалар ${username}`, followers: 23100, region: 'Астана', regionVerified: true },
      { ...singleMock, id: '4', username: `${username.replace(/\s+/g, '_')}_shop`, displayName: `${username} Shop`, followers: 89200, region: 'Алматы', regionVerified: true },
      { ...singleMock, id: '5', username: `${username.replace(/\s+/g, '_')}_world`, displayName: `${username} World`, followers: 201000, region: 'Қазақстан', regionVerified: false, platform: 'tiktok' },
    ] : [singleMock]

    return NextResponse.json({
      success: true,
      isRealCheck: false,
      isNiche,
      platform: effectivePlatform,
      query: username,
      originalQuery: query,
      region,
      tokenUsed,
      tokenError,
      results,
      disclaimer: tokenError ? `Нақты тексеру үшін Instagram Business қосыңыз. Қазір — DEMO DATA.` : `DEMO DATA — нақты емес. Нақты тексеру үшін Business Discovery қолданамыз.`,
      howToRealCheck: {
        kk: '1. /overview → Connect Instagram Business 2. Facebook Login 3. Кез келген username жазыңыз → Нақты public дерек',
      },
      businessDiscoveryNote: 'Business Discovery тек public бизнес/creator аккаунттарды тексереді. Public fields: followers_count, media_count, profile_picture_url, biography.',
      tiktokNote: 'TikTok Display API бөтен аккаунтты тексеруге рұқсат бермейді.'
    })

  } catch (e: any) {
    console.error('[Search API] Error:', e)
    return NextResponse.json({ error: e.message, success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const searchParams = new URLSearchParams()
  if (body.query) searchParams.set('query', body.query)
  if (body.platform) searchParams.set('platform', body.platform)
  if (body.region) searchParams.set('region', body.region)
  if (body.type) searchParams.set('type', body.type)
  const newReq = new NextRequest(`${req.nextUrl.origin}/api/search?${searchParams.toString()}`, { method: 'GET' })
  return GET(newReq)
}
