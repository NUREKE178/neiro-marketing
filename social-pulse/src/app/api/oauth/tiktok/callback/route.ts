export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { encryptToken } from '@/lib/encryption'
import { exchangeCodeForToken } from '@/lib/tiktok'
import { z } from 'zod'

const querySchema = z.object({
  code: z.string(),
  state: z.string(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = querySchema.safeParse({
      code: searchParams.get('code'),
      state: searchParams.get('state'),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid callback params' }, { status: 400 })
    }

    const { code, state } = parsed.data
    const storedState = req.cookies.get('tiktok_oauth_state')?.value

    if (!storedState || storedState !== state) {
      return NextResponse.json({ error: 'Invalid state (CSRF)' }, { status: 403 })
    }

    const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/oauth/tiktok/callback`
    const tokenData = await exchangeCodeForToken(code, redirectUri)

    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({
        success: true,
        message: 'TikTok connected (mock DB)',
        tokenExpiresIn: tokenData.expires_in,
      })
    }

    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'demo@socialpulse.local', locale: 'kk', plan: 'FREE' }
      })
    }

    const tokenEncrypted = encryptToken(tokenData.access_token)
    const refreshEncrypted = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    const connectedAccount = await prisma.connectedAccount.upsert({
      where: {
        userId_platform_externalId: {
          userId: user.id,
          platform: 'TIKTOK',
          externalId: tokenData.open_id || 'tiktok_user'
        }
      },
      update: {
        tokenEncrypted,
        refreshTokenEncrypted: refreshEncrypted,
        tokenExpiresAt: expiresAt,
        status: 'ACTIVE',
      },
      create: {
        userId: user.id,
        platform: 'TIKTOK',
        externalId: tokenData.open_id || 'tiktok_user',
        username: tokenData.open_id || 'tiktok_user',
        tokenEncrypted,
        refreshTokenEncrypted: refreshEncrypted,
        tokenExpiresAt: expiresAt,
        status: 'ACTIVE',
      }
    })

    const { enqueueJob } = await import('@/lib/sync/syncManager')
    await enqueueJob('INITIAL', { accountId: connectedAccount.id })

    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/overview?connected=tiktok`)
    response.cookies.delete('tiktok_oauth_state')
    return response

  } catch (error: any) {
    console.error('[TikTok OAuth Callback] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
