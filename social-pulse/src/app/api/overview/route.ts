export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { isTokenExpired } from '@/lib/encryption'
import { z } from 'zod'

const querySchema = z.object({
  userId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || undefined

    const prisma = await getPrisma()

    // DEMO_MODE flag - must be impossible in production
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production'
    
    if (!prisma || isDemoMode) {
      // Return demo data ONLY if DEMO_MODE and not production
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        return NextResponse.json({ error: 'DEMO_MODE not allowed in production' }, { status: 403 })
      }

      // Demo fallback for local dev
      const { mockAccounts } = await import('@/lib/mockData')
      return NextResponse.json({
        isDemo: true,
        demoDisclaimer: 'DEMO DATA — нақты аккаунт статистикасы емес. Бұл демо тек local development үшін.',
        connectedAccount: null,
        stats: {
          trackedAccounts: { count: 5, connected: 2, tracked: 3, delta: null, deltaTooltip: 'Not enough data yet' },
          videosAnalyzed: { count: 127, last7Days: 4 },
          saved: { count: 23, accounts: 5 },
          reports: { count: 8, ready: 2 },
        },
        lastSynced: null,
        tokenStatus: 'no_account',
        syncing: false,
        accounts: mockAccounts.slice(0, 2),
      })
    }

    // Production - real data
    let user = null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
    } else {
      user = await prisma.user.findFirst()
    }

    if (!user) {
      // Empty state - new user
      return NextResponse.json({
        isDemo: false,
        isEmpty: true,
        stats: {
          trackedAccounts: { count: 0, connected: 0, tracked: 0, delta: null },
          videosAnalyzed: { count: 0, last7Days: 0 },
          saved: { count: 0, accounts: 0 },
          reports: { count: 0, ready: 0 },
        },
        lastSynced: null,
        tokenStatus: 'no_account',
        syncing: false,
      })
    }

    // Get connected accounts
    const connectedAccounts: any[] = await prisma.connectedAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Check token expired
    let tokenStatus: 'active' | 'expired' | 'error' | 'no_account' = 'no_account'
    let expiredAccounts: string[] = []
    
    for (const acc of connectedAccounts) {
      if (acc.status === 'EXPIRED' || isTokenExpired(acc.tokenExpiresAt)) {
        tokenStatus = 'expired'
        expiredAccounts.push(acc.username)
      } else if (acc.status === 'ERROR') {
        tokenStatus = 'error'
      } else if (acc.status === 'ACTIVE' && tokenStatus === 'no_account') {
        tokenStatus = 'active'
      }
    }

    // Check if syncing
    const runningJobs: any[] = await prisma.syncJob.findMany({
      where: { userId: user.id, status: 'RUNNING' }
    })
    const isSyncing = runningJobs.length > 0

    // Tracked accounts count (connected + tracked)
    const trackedCount = await prisma.trackedAccount.count({ where: { userId: user.id } })
    const totalTracked = connectedAccounts.length + trackedCount

    // Calculate delta vs 30 days ago from snapshots
    let delta: number | null = null
    let deltaTooltip = 'Not enough data yet'
    
    if (connectedAccounts.length > 0) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)
      const recentSnapshots: any[] = await prisma.accountMetricsSnapshot.findMany({
        where: {
          accountRef: { in: connectedAccounts.map((a: any) => a.id) },
          capturedAt: { gte: thirtyDaysAgo }
        },
        orderBy: { capturedAt: 'asc' }
      })

      if (recentSnapshots.length >= 2) {
        // Simple delta: compare first and last follower count
        const first = recentSnapshots[0]
        const last = recentSnapshots[recentSnapshots.length - 1]
        if (first.followers && last.followers && first.followers > 0) {
          delta = ((last.followers - first.followers) / first.followers) * 100
          deltaTooltip = `30 күн бұрын ${first.followers} → қазір ${last.followers}`
        }
      }
    }

    // Videos analyzed count
    const mediaCount = await prisma.media.count({
      where: {
        OR: [
          { accountRef: { in: connectedAccounts.map((a: any) => a.id) } },
          { accountRef: { in: (await prisma.trackedAccount.findMany({ where: { userId: user.id } })).map((t: any) => t.id) } }
        ]
      }
    })

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
    const recentMediaCount = await prisma.media.count({
      where: {
        OR: [
          { accountRef: { in: connectedAccounts.map((a: any) => a.id) } },
        ],
        postedAt: { gte: sevenDaysAgo }
      }
    })

    // Saved items
    const savedCount = await prisma.savedItem.count({ where: { userId: user.id } })
    const savedAccountsCount = await prisma.savedItem.count({ where: { userId: user.id, itemType: 'ACCOUNT' } })

    // Reports
    const reportsCount = await prisma.report.count({ where: { userId: user.id } })
    const readyReportsCount = await prisma.report.count({ where: { userId: user.id, status: 'READY' } })

    // Last synced
    const lastSynced = connectedAccounts.length > 0 
      ? connectedAccounts.reduce((latest: Date | null, acc: any) => {
          if (!acc.lastSyncedAt) return latest
          if (!latest) return acc.lastSyncedAt
          return acc.lastSyncedAt > latest ? acc.lastSyncedAt : latest
        }, null as Date | null)
      : null

    // Primary connected account for header
    const primaryAccount = connectedAccounts[0] || null

    return NextResponse.json({
      isDemo: false,
      isEmpty: totalTracked === 0,
      user: { id: user.id, email: user.email, locale: user.locale, plan: user.plan },
      connectedAccount: primaryAccount ? {
        id: primaryAccount.id,
        username: primaryAccount.username,
        displayName: primaryAccount.displayName,
        platform: primaryAccount.platform,
        avatarUrl: primaryAccount.avatarUrl,
        status: primaryAccount.status,
        lastSyncedAt: primaryAccount.lastSyncedAt,
      } : null,
      allConnectedAccounts: connectedAccounts.map((a: any) => ({
        id: a.id,
        username: a.username,
        platform: a.platform,
        status: a.status,
        lastSyncedAt: a.lastSyncedAt,
      })),
      stats: {
        trackedAccounts: {
          count: totalTracked,
          connected: connectedAccounts.length,
          tracked: trackedCount,
          delta, // null if not enough history
          deltaTooltip,
        },
        videosAnalyzed: {
          count: mediaCount,
          last7Days: recentMediaCount,
        },
        saved: {
          count: savedCount,
          accounts: savedAccountsCount,
        },
        reports: {
          count: reportsCount,
          ready: readyReportsCount,
        },
      },
      lastSynced,
      lastSyncedMinutesAgo: lastSynced ? Math.floor((Date.now() - lastSynced.getTime()) / 60000) : null,
      tokenStatus,
      expiredAccounts,
      syncing: isSyncing,
      runningJobs: runningJobs.length,
    })

  } catch (error: any) {
    console.error('[Overview API] Error:', error)
    return NextResponse.json({ error: error.message, isDemo: false }, { status: 500 })
  }
}
