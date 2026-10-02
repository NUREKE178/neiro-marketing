export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { decryptToken, isTokenExpired, encryptToken } from '@/lib/encryption'
import { refreshLongLivedToken, getIGUserProfile, getIGMedia, getIGMediaInsights } from '@/lib/meta'
import { refreshTikTokToken, getTikTokUserProfile, getTikTokVideos } from '@/lib/tiktok'
import { acquireLock, releaseLock, logSyncJob } from '@/lib/sync/syncManager'
import { z } from 'zod'

const schema = z.object({
  userId: z.string().optional(),
  accountId: z.string().optional(),
  type: z.enum(['FULL', 'METRICS', 'INITIAL', 'ACCOUNT_METRICS', 'MEDIA_METRICS']).default('METRICS')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const prisma = await getPrisma()
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const userId = parsed.data.userId
    let accounts: any[] = []
    
    if (parsed.data.accountId) {
      const acc = await prisma.connectedAccount.findUnique({ where: { id: parsed.data.accountId } })
      if (acc) accounts = [acc]
    } else if (userId) {
      accounts = await prisma.connectedAccount.findMany({ where: { userId } })
    } else {
      const sixHoursAgo = new Date(Date.now() - 6 * 3600 * 1000)
      accounts = await prisma.connectedAccount.findMany({
        where: { status: 'ACTIVE', OR: [{ lastSyncedAt: null }, { lastSyncedAt: { lt: sixHoursAgo } }] }
      })
    }

    const results: any[] = []
    for (const account of accounts) {
      const lockKey = account.id
      if (!(await acquireLock(lockKey))) {
        results.push({ accountId: account.id, skipped: true, reason: 'locked' })
        continue
      }

      const job = await logSyncJob(prisma, { userId: account.userId, accountRef: account.id, type: parsed.data.type as any, status: 'RUNNING' })

      try {
        let token = decryptToken(account.tokenEncrypted)
        if (isTokenExpired(account.tokenExpiresAt)) {
          if (account.platform === 'INSTAGRAM') {
            const refreshed = await refreshLongLivedToken(token)
            token = refreshed.access_token
            await prisma.connectedAccount.update({
              where: { id: account.id },
              data: {
                tokenEncrypted: encryptToken(token),
                tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000)
              }
            })
          } else if (account.platform === 'TIKTOK' && account.refreshTokenEncrypted) {
            const refreshToken = decryptToken(account.refreshTokenEncrypted)
            const refreshed = await refreshTikTokToken(refreshToken)
            await prisma.connectedAccount.update({
              where: { id: account.id },
              data: {
                tokenEncrypted: encryptToken(refreshed.access_token),
                refreshTokenEncrypted: refreshed.refresh_token ? encryptToken(refreshed.refresh_token) : undefined,
                tokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000)
              }
            })
            token = refreshed.access_token
          } else {
            throw new Error('Token expired and no refresh available')
          }
        }

        let itemsSynced = 0
        
        if (account.platform === 'INSTAGRAM') {
          try {
            const profile = await getIGUserProfile(token, account.externalId !== 'pending_lookup' ? account.externalId : undefined)
            await prisma.connectedAccount.update({
              where: { id: account.id },
              data: { 
                username: (profile as any).username || account.username,
                lastSyncedAt: new Date()
              }
            })

            const medias = await getIGMedia(token, account.externalId !== 'pending_lookup' ? account.externalId : 'me', 20).catch(() => [] as any[])
            for (const m of medias) {
              await prisma.media.upsert({
                where: { platform_externalId: { platform: 'INSTAGRAM', externalId: m.id } },
                update: { caption: m.caption },
                create: {
                  accountRef: account.id,
                  platform: 'INSTAGRAM',
                  externalId: m.id,
                  type: m.media_type === 'VIDEO' ? 'VIDEO' : m.media_type === 'CAROUSEL_ALBUM' ? 'CAROUSEL' : 'IMAGE',
                  caption: m.caption,
                  postedAt: m.timestamp ? new Date(m.timestamp) : new Date(),
                  permalink: m.permalink,
                  thumbnailUrl: m.thumbnail_url || m.media_url,
                }
              })
              itemsSynced++
            }

            await prisma.accountMetricsSnapshot.create({
              data: {
                accountRef: account.id,
                followers: (profile as any).followers_count || 0,
                following: (profile as any).follows_count || 0,
                mediaCount: (profile as any).media_count || 0,
              }
            })
          } catch (e: any) {
            console.error('[IG Sync inner]', e)
          }
        }

        if (account.platform === 'TIKTOK') {
          try {
            const profile = await getTikTokUserProfile(token)
            await prisma.connectedAccount.update({
              where: { id: account.id },
              data: { lastSyncedAt: new Date() }
            })

            const { videos } = await getTikTokVideos(token).catch(() => ({ videos: [] as any[] }))
            for (const v of videos) {
              await prisma.media.upsert({
                where: { platform_externalId: { platform: 'TIKTOK', externalId: v.id } },
                update: { caption: v.title },
                create: {
                  accountRef: account.id,
                  platform: 'TIKTOK',
                  externalId: v.id,
                  type: 'VIDEO',
                  caption: v.title,
                  postedAt: v.create_time ? new Date(v.create_time * 1000) : new Date(),
                }
              })
              itemsSynced++
            }

            await prisma.accountMetricsSnapshot.create({
              data: {
                accountRef: account.id,
                followers: profile.follower_count || 0,
                following: profile.following_count || 0,
                mediaCount: profile.video_count || 0,
              }
            })
          } catch (e: any) {
            console.error('[TT Sync inner]', e)
          }
        }

        await prisma.syncJob.update({
          where: { id: job.id },
          data: { status: 'SUCCESS', finishedAt: new Date(), itemsSynced }
        })
        results.push({ accountId: account.id, success: true, itemsSynced })

      } catch (e: any) {
        try {
          const jobToFail = await prisma.syncJob.findFirst({ where: { accountRef: account.id, status: 'RUNNING' }, orderBy: { startedAt: 'desc' } })
          if (jobToFail) {
            await prisma.syncJob.update({
              where: { id: jobToFail.id },
              data: { status: 'FAILED', finishedAt: new Date(), error: e.message }
            })
          }
        } catch {}
        results.push({ accountId: account.id, success: false, error: e.message })
      } finally {
        await releaseLock(lockKey)
      }
    }

    return NextResponse.json({ synced: results.length, results })

  } catch (e: any) {
    console.error('[Sync] Error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  const prisma = await getPrisma()
  if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })
  const jobs = await prisma.syncJob.findMany({ orderBy: { createdAt: 'desc' }, take: 20 } as any)
  return NextResponse.json({ jobs })
}
