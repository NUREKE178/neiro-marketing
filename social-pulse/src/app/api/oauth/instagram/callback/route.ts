export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { encryptToken } from '@/lib/encryption'
import { exchangeCodeForShortLivedToken, exchangeForLongLivedToken } from '@/lib/meta'
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
    const storedState = req.cookies.get('ig_oauth_state')?.value

    if (!storedState || storedState !== state) {
      return NextResponse.json({ error: 'Invalid state (CSRF)' }, { status: 403 })
    }

    const redirectUri = process.env.META_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/oauth/instagram/callback`

    const shortLived = await exchangeCodeForShortLivedToken(code, redirectUri)
    const longLived = await exchangeForLongLivedToken(shortLived.access_token)

    const prisma = await getPrisma()
    if (!prisma) {
      return NextResponse.json({
        success: true,
        isDemo: false,
        message: 'Instagram connected (mock DB)',
        tokenExpiresIn: longLived.expires_in,
        nextStep: 'Check account type and start initial sync',
      })
    }

    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'demo@socialpulse.local', locale: 'kk', plan: 'FREE' }
      })
    }

    const tokenEncrypted = encryptToken(longLived.access_token)
    const expiresAt = new Date(Date.now() + longLived.expires_in * 1000)

    const connectedAccount = await prisma.connectedAccount.upsert({
      where: {
        userId_platform_externalId: {
          userId: user.id,
          platform: 'INSTAGRAM',
          externalId: 'pending_lookup'
        }
      },
      update: {
        tokenEncrypted,
        tokenExpiresAt: expiresAt,
        status: 'ACTIVE',
        lastSyncedAt: null,
      },
      create: {
        userId: user.id,
        platform: 'INSTAGRAM',
        externalId: 'pending_lookup',
        username: 'pending',
        tokenEncrypted,
        tokenExpiresAt: expiresAt,
        status: 'ACTIVE',
      }
    })

    // Trigger initial sync
    const { enqueueJob } = await import('@/lib/sync/syncManager')
    await enqueueJob('INITIAL', { accountId: connectedAccount.id })

    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/overview?connected=instagram`)
    response.cookies.delete('ig_oauth_state')
    
    return response

  } catch (error: any) {
    console.error('[IG OAuth Callback] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
