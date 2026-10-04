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
  if (/[^\x00-\x7F]/.test(input)) return true
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

    // TikTok competitor check NOT allowed
    if (effectivePlatform === 'tiktok' && !isNiche) {
      return NextResponse.json({
        success: false,
        isRealCheck: true,
        isDemo: false,
        platform: 'tiktok',
        query: username,
        error: 'TikTok-та бөтен аккаунтты тексеру мүмкін емес',
        explanation: {
          kk: 'TikTok Display API тек өз аккаунтыңыздың видеоларын береді. Басқа аккаунтты тексеру үшін Research API керек, бірақ біз оны қолданбаймыз (заңды шектеу). Instagram-да Business Discovery арқылы кез келген public бизнес/creator аккаунтты тексеруге болады.',
          ru: 'TikTok Display API позволяет получать только свои видео. Для проверки чужих аккаунтов нужен Research API.',
          en: 'TikTok Display API only allows own videos. Use Instagram Business Discovery for other accounts.'
        },
        results: []
      })
    }

    // === REAL CHECK ONLY - NO DEMO ===
    let realResult: any = null
    let tokenSource = 'none'
    let tokenError: string | null = null
    let igUserIdForDiscovery = 'me'

    const prisma = await getPrisma()

    // Try 3 sources for token in order:
    // 1. ConnectedAccount from DB (OAuth flow)
    // 2. ENV INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_USER_ID (quick test without DB)
    // 3. Fail with clear instructions

    // Source 1: DB
    if (prisma && (effectivePlatform === 'instagram' || platform === 'all')) {
      try {
        const connectedAccount = await prisma.connectedAccount.findFirst({
          where: { platform: 'INSTAGRAM', status: 'ACTIVE' },
          orderBy: { lastSyncedAt: 'desc' }
        })
        if (connectedAccount) {
          const token = decryptToken(connectedAccount.tokenEncrypted)
          tokenSource = `DB ConnectedAccount @${connectedAccount.username}`
          igUserIdForDiscovery = connectedAccount.externalId !== 'pending_lookup' ? connectedAccount.externalId : 'me'
          const discovery: any = await getBusinessDiscovery(token, igUserIdForDiscovery, username)
          if (!discovery || !discovery.username) throw new Error(`Аккаунт @${username} табылмады немесе жеке/private. Business Discovery тек public бизнес/creator аккаунттарды тексереді.`)
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
            source: `Instagram Business Discovery API (real) via ${tokenSource}`,
            isDemo: false,
            isRealCheck: true,
            publicFieldsOnly: true,
            lastChecked: new Date().toISOString(),
          }
        }
      } catch (e: any) {
        tokenError = e.message
      }
    }

    // Source 2: ENV fallback for quick testing without DB
    if (!realResult && process.env.INSTAGRAM_ACCESS_TOKEN && (effectivePlatform === 'instagram' || platform === 'all') && !isNiche) {
      try {
        const token = process.env.INSTAGRAM_ACCESS_TOKEN
        const igUserId = process.env.INSTAGRAM_USER_ID || 'me'
        tokenSource = 'ENV INSTAGRAM_ACCESS_TOKEN'
        const discovery: any = await getBusinessDiscovery(token, igUserId, username)
        if (!discovery || !discovery.username) throw new Error(`Аккаунт @${username} табылмады немесе private.`)
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
          source: `Instagram Business Discovery API (real) via ENV token`,
          isDemo: false,
          isRealCheck: true,
          publicFieldsOnly: true,
          lastChecked: new Date().toISOString(),
        }
        tokenError = null
      } catch (e: any) {
        tokenError = `ENV token failed: ${e.message}`
      }
    }

    if (realResult) {
      // Save to tracked if DB exists
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
        isDemo: false,
        platform: 'instagram',
        query: username,
        isNiche: false,
        tokenSource,
        result: realResult,
        results: [realResult],
        disclaimer: 'Business Discovery — тек жария өрістер: followers_count, media_count, profile_picture_url, biography. Жеке дерек жоқ, scraping жоқ.',
      })
    }

    // === NO TOKEN - RETURN CLEAR INSTRUCTIONS, NOT DEMO ===
    if (isNiche) {
      return NextResponse.json({
        success: false,
        isRealCheck: false,
        isDemo: false,
        isNiche: true,
        platform: effectivePlatform,
        query: username,
        originalQuery: query,
        region,
        tokenError,
        error: 'Тақырып бойынша іздеу үшін алдымен Instagram Business қосыңыз',
        results: [],
        instructions: {
          kk: `Шын аккаунттарды тексеру үшін не істеу керек (3 қадам, 5 минут):

1️⃣ Instagram аккаунтыңызды Business/Creator-ға ауыстырыңыз:
   Instagram → Параметрлер → Аккаунт → Кәсіби аккаунтқа ауысу → Business немесе Creator таңдаңыз

2️⃣ Facebook App жасаңыз (тегін, 2 минут):
   • https://developers.facebook.com/apps/ → Create App → Business
   • Add Product: Facebook Login + Instagram Graph API
   • Facebook Login → Settings → Valid OAuth Redirect URIs қосыңыз:
     https://your-domain.com/api/oauth/instagram/callback
     http://localhost:3000/api/oauth/instagram/callback
   • Instagram Graph API → Basic емес, Graph API таңдаңыз
   • Scopes: instagram_basic, pages_show_list, pages_read_engagement

3️⃣ SOCIAL PULSE-қа қосыңыз:
   • /overview → Connect Instagram Business басыңыз
   • Facebook Login → өз Instagram Business аккаунтыңызды таңдаңыз
   • Дайын! Енді /search бетінде кез келген public бизнес аккаунтты жазыңыз:
     @nike, @instagram, @sudo.ubuntu, https://instagram.com/username/

Ескерту: Business Discovery тек public бизнес/creator аккаунттарды тексереді, жеке (private) аккаунт емес.`,
          ru: `Как проверить реальные аккаунты (3 шага):

1️⃣ Переключите Instagram на Business/Creator: Настройки → Аккаунт → Переключиться на профессиональный
2️⃣ Создайте Facebook App: developers.facebook.com → Create App → Business → Добавьте Facebook Login + Instagram Graph API
3️⃣ В SOCIAL PULSE: /overview → Connect Instagram Business → Выберите свой бизнес-аккаунт → Теперь в /search вводите любой username: @nike, @instagram

Примечание: Business Discovery проверяет только публичные бизнес/автор аккаунты, не приватные.`,
          en: `How to check real accounts (3 steps):

1️⃣ Switch Instagram to Business/Creator: Settings → Account → Switch to Professional
2️⃣ Create Facebook App: developers.facebook.com → Create App → Business → Add Facebook Login + Instagram Graph API
3️⃣ In SOCIAL PULSE: /overview → Connect Instagram Business → Select your business account → Now in /search enter any username: @nike, @instagram

Note: Business Discovery only checks public business/creator accounts, not private.`
        },
        quickTest: {
          kk: `Тез тест (DB-сыз, ENV арқылы):
1. Graph Explorer-дан токен алыңыз: https://developers.facebook.com/tools/explorer/
2. .env-ға қосыңыз:
   INSTAGRAM_ACCESS_TOKEN=ваш_long_lived_token
   INSTAGRAM_USER_ID=ваш_ig_business_id
3. Серверді қайта қосыңыз → /search?query=@nike → нақты дерек келеді`,
        }
      })
    }

    // Single account search, no token
    return NextResponse.json({
      success: false,
      isRealCheck: false,
      isDemo: false,
      isNiche: false,
      platform: effectivePlatform,
      query: username,
      originalQuery: query,
      region,
      tokenError,
      error: `Аккаунт @${username} нақты тексеру үшін Instagram Business қосыңыз`,
      results: [],
      instructions: {
        kk: `Шын аккаунт @${username} тексеру үшін:

1️⃣ Instagram-ды Business-қа ауыстырыңыз (Параметрлер → Аккаунт → Кәсіби аккаунтқа ауысу)

2️⃣ Facebook App жасаңыз:
   developers.facebook.com → Create App → Business → Facebook Login + Instagram Graph API

3️⃣ SOCIAL PULSE-та:
   /overview → Connect Instagram Business → Login → Дайын!

4️⃣ Енді /search → @${username} жазыңыз → Нақты followers, media_count, profile picture келеді (public fields only)

НЕГЕ ОСЫЛАЙ?
• Instagram ресми API тек өз аккаунтыңыз арқылы басқа public бизнес аккаунттарды тексеруге рұқсат береді (Business Discovery)
• Жеке/private аккаунттарды тексеру мүмкін емес — бұл Instagram ережесі
• Scraping жасамаймыз — тек ресми API, заңды

ТИКТОК:
• TikTok Display API бөтен аккаунтты тексеруге рұқсат бермейді, тек өз видеоларыңыз
• Сондықтан TikTok-та @sudo.ubuntu тексеру мүмкін емес, тек Instagram-да`,
      }
    }, { status: 200 })

  } catch (e: any) {
    console.error('[Search API] Error:', e)
    return NextResponse.json({ error: e.message, success: false, isDemo: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const searchParams = new URLSearchParams()
  if (body.query) searchParams.set('query', body.query)
  if (body.platform) searchParams.set('platform', body.platform)
  if (body.region) searchParams.set('region', body.region)
  const newReq = new NextRequest(`${req.nextUrl.origin}/api/search?${searchParams.toString()}`, { method: 'GET' })
  return GET(newReq)
}
