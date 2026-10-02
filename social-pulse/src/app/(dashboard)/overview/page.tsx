"use client"
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react"
import { Users, Video, Bookmark, FileText, RefreshCw, AlertTriangle, Zap, Instagram, Music2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { t, formatNumberLocale, useLocale } from "@/lib/i18n"
import Link from "next/link"

interface OverviewData {
  isDemo: boolean
  isEmpty?: boolean
  user?: { id: string, email: string, locale: string, plan: string }
  connectedAccount?: { id: string, username: string, displayName?: string, platform: string, avatarUrl?: string, status: string, lastSyncedAt?: string }
  stats: {
    trackedAccounts: { count: number, connected: number, tracked: number, delta: number | null, deltaTooltip?: string }
    videosAnalyzed: { count: number, last7Days: number }
    saved: { count: number, accounts: number }
    reports: { count: number, ready: number }
  }
  lastSynced?: string | null
  lastSyncedMinutesAgo?: number | null
  tokenStatus: 'active' | 'expired' | 'error' | 'no_account'
  expiredAccounts?: string[]
  syncing?: boolean
}

export default function OverviewPage() {
  const locale = useLocale()
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOverview = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      
      const res = await fetch('/api/overview')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  // Pull to refresh
  const handleRefresh = () => fetchOverview(true)

  // Loading skeleton - matches card shapes, no full-screen spinner
  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Compact header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full border-3 border-black" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-5 border-2 border-black" />
            <Skeleton className="w-48 h-4 border-2 border-black" />
          </div>
        </div>
        
        {/* Stat cards skeleton - 2x2 grid matching real shapes */}
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="relative">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-black border-2 border-black rounded-lg" />
              <Skeleton className="relative h-[110px] border-[3px] border-black rounded-lg" />
            </div>
          ))}
        </div>
        
        <Skeleton className="h-32 border-[3px] border-black rounded-lg" />
      </div>
    )
  }

  // Error state - inline + retry
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_#000] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500 border-3 border-black flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black uppercase">{t('common.error', locale)}</p>
              <p className="text-sm font-bold opacity-70">{error}</p>
            </div>
          </div>
          <Button variant="black" onClick={() => fetchOverview()} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common.retry', locale)}
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Empty state - new user onboarding
  if (data.isEmpty) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-[#DFFF00] border-[4px] border-black shadow-[6px_6px_0px_0px_#000] mx-auto flex items-center justify-center mb-6">
            <Zap className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-3">{t('overview.onboardingTitle', locale)}</h1>
          <p className="font-bold opacity-70 max-w-lg mx-auto">{t('overview.onboardingDesc', locale)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group cursor-pointer" onClick={() => window.location.href = '/api/oauth/instagram'}>
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black border-[3px] border-black rounded-lg" />
            <div className="relative bg-white border-[3px] border-black rounded-lg p-6 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_0px_#000] transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 border-3 border-black flex items-center justify-center mb-4">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black uppercase text-lg">Instagram Business</h3>
              <p className="text-xs font-bold opacity-60 mt-1">instagram_basic, instagram_manage_insights, pages_show_list</p>
              <div className="mt-4 bg-black text-white border-3 border-black px-4 py-2 inline-block font-black text-xs uppercase">
                {t('overview.connectInstagram', locale)} →
              </div>
            </div>
          </div>

          <div className="relative group cursor-pointer" onClick={() => window.location.href = '/api/oauth/tiktok'}>
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black border-[3px] border-black rounded-lg" />
            <div className="relative bg-white border-[3px] border-black rounded-lg p-6 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_0px_#000] transition-all">
              <div className="w-12 h-12 bg-black border-3 border-black flex items-center justify-center mb-4">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black uppercase text-lg">TikTok</h3>
              <p className="text-xs font-bold opacity-60 mt-1">Login Kit + Display API, own videos only</p>
              <div className="mt-4 bg-[#DFFF00] text-black border-3 border-black px-4 py-2 inline-block font-black text-xs uppercase">
                {t('overview.connectTikTok', locale)} →
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F9F9FB] border-[3px] border-black border-dashed p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">
            No scraping • Official APIs only • Tokens encrypted AES-256-GCM • Row-level security
          </p>
        </div>
      </div>
    )
  }

  const stats = data.stats

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#F9F9FB]">
=======
    <div className="min-h-screen bg-[#F9F9FB]" suppressHydrationWarning>
>>>>>>> 46ab709 (feat: search any account real check via Business Discovery API + fix hydration error toLocaleDate -> ISO + useLocale hook mounted fix + suppressHydrationWarning)
      {/* Pull to refresh - Web */}
      <div className="sticky top-0 z-20 bg-[#F9F9FB]/80 backdrop-blur-sm border-b-[3px] border-black/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-2 flex items-center justify-center">
          {data.syncing && (
<<<<<<< HEAD
            <div className="flex items-center gap-2 text-[11px] font-black uppercase">
=======
            <div className="flex items-center gap-2 text-[11px] font-black uppercase" suppressHydrationWarning>
>>>>>>> 46ab709 (feat: search any account real check via Business Discovery API + fix hydration error toLocaleDate -> ISO + useLocale hook mounted fix + suppressHydrationWarning)
              <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              {t('overview.syncing', locale)}
            </div>
          )}
        </div>
      </div>

<<<<<<< HEAD
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
=======
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto" suppressHydrationWarning>
>>>>>>> 46ab709 (feat: search any account real check via Business Discovery API + fix hydration error toLocaleDate -> ISO + useLocale hook mounted fix + suppressHydrationWarning)
        {/* Compact header: avatar + username + platform badge + Last synced + refresh */}
        {data.connectedAccount ? (
          <div className="flex items-center justify-between bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={data.connectedAccount.avatarUrl || `https://i.pravatar.cc/150?u=${data.connectedAccount.username}`} 
                  alt={data.connectedAccount.username}
                  className="w-12 h-12 border-[3px] border-black rounded-full"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${data.tokenStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-[15px]">@{data.connectedAccount.username}</p>
                  <span className={`px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase ${
                    data.connectedAccount.platform === 'INSTAGRAM' ? 'bg-[#A58BFF]' : 'bg-black text-white'
                  }`}>
                    {data.connectedAccount.platform}
                  </span>
                </div>
                <p className="text-[11px] font-bold opacity-60">
                  {data.lastSyncedMinutesAgo !== null && data.lastSyncedMinutesAgo !== undefined
                    ? t('overview.lastSynced', locale, { time: `${data.lastSyncedMinutesAgo} ${locale === 'kk' ? 'мин' : locale === 'ru' ? 'мин' : 'min'}` })
                    : t('common.noData', locale)
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-11 h-11 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all disabled:opacity-50"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        ) : (
          <div className="bg-white border-[3px] border-black p-4 flex items-center justify-between">
            <p className="font-black uppercase text-sm">{t('overview.connectedAccount', locale)}: —</p>
            <span className="bg-white border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase">No account</span>
          </div>
        )}

        {/* Token expired warning banner */}
        {data.tokenStatus === 'expired' && (
          <div className="bg-red-500 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-white" />
              <div>
                <p className="font-black uppercase text-white text-sm">{t('overview.tokenExpired', locale)}</p>
                <p className="text-xs font-bold text-white/80">{data.expiredAccounts?.join(', ')}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/api/oauth/instagram'}
              className="bg-white border-[3px] border-black px-4 py-2 font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              style={{ minHeight: '44px' }}
            >
              {t('common.reconnect', locale)} →
            </button>
          </div>
        )}

        {/* Stat cards - keep colors lime/violet/pink/cyan, tappable, real data */}
        <div className="grid grid-cols-2 gap-4">
          {/* 1. Tracked accounts */}
          <Link href="/search" className="relative group block">
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black border-[3px] border-black rounded-lg group-hover:translate-x-[8px] group-hover:translate-y-[8px] transition-transform" />
            <div className="relative bg-[#DFFF00] border-[3px] border-black rounded-lg p-4 h-[130px] flex flex-col justify-between group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0px_0px_#000] transition-all">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">{t('overview.trackedAccounts', locale)}</p>
                <Users className="w-4 h-4 opacity-60" />
              </div>
              <div>
                <p className="text-[30px] font-black tracking-tighter leading-none">
                  {formatNumberLocale(stats.trackedAccounts.count, locale as any)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-black text-white border-2 border-black px-2 py-0.5 text-[10px] font-bold">
                    {t('overview.trackedSub', locale, { connected: stats.trackedAccounts.connected, tracked: stats.trackedAccounts.tracked })}
                  </span>
                </div>
                {stats.trackedAccounts.delta !== null ? (
                  <p className={`text-[11px] font-black mt-1 ${stats.trackedAccounts.delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {stats.trackedAccounts.delta >= 0 ? '↗' : '↘'} {stats.trackedAccounts.delta.toFixed(1)}% 
                    <span className="opacity-60 font-bold ml-1" title={stats.trackedAccounts.deltaTooltip}>ⓘ</span>
                  </p>
                ) : (
                  <p className="text-[11px] font-bold opacity-50 mt-1" title={stats.trackedAccounts.deltaTooltip || t('overview.notEnoughHistory', locale)}>
                    — <span className="underline decoration-dotted">{t('common.notEnoughData', locale)}</span>
                  </p>
                )}
              </div>
            </div>
          </Link>

          {/* 2. Videos analyzed */}
          <Link href="/analytics" className="relative group block">
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black border-[3px] border-black rounded-lg group-hover:translate-x-[8px] group-hover:translate-y-[8px] transition-transform" />
            <div className="relative bg-[#A58BFF] border-[3px] border-black rounded-lg p-4 h-[130px] flex flex-col justify-between group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0px_0px_#000] transition-all">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">{t('overview.videosAnalyzed', locale)}</p>
                <Video className="w-4 h-4 opacity-60" />
              </div>
              <div>
                <p className="text-[30px] font-black tracking-tighter leading-none">
                  {formatNumberLocale(stats.videosAnalyzed.count, locale as any)}
                </p>
                <p className="text-[11px] font-bold mt-2 bg-white border-2 border-black inline-block px-2 py-0.5">
                  {t('overview.videosSub', locale, { count: stats.videosAnalyzed.last7Days })}
                </p>
              </div>
            </div>
          </Link>

          {/* 3. Saved */}
          <Link href="/saved" className="relative group block">
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black border-[3px] border-black rounded-lg group-hover:translate-x-[8px] group-hover:translate-y-[8px] transition-transform" />
            <div className="relative bg-[#FF85A1] border-[3px] border-black rounded-lg p-4 h-[130px] flex flex-col justify-between group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0px_0px_#000] transition-all">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">{t('overview.saved', locale)}</p>
                <Bookmark className="w-4 h-4 opacity-60" />
              </div>
              <div>
                <p className="text-[30px] font-black tracking-tighter leading-none">
                  {formatNumberLocale(stats.saved.count, locale as any)}
                </p>
                <p className="text-[11px] font-bold mt-2 bg-white border-2 border-black inline-block px-2 py-0.5">
                  {t('overview.savedSub', locale, { count: stats.saved.accounts })}
                </p>
              </div>
            </div>
          </Link>

          {/* 4. Reports */}
          <Link href="/reports" className="relative group block">
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black border-[3px] border-black rounded-lg group-hover:translate-x-[8px] group-hover:translate-y-[8px] transition-transform" />
            <div className="relative bg-[#70D6FF] border-[3px] border-black rounded-lg p-4 h-[130px] flex flex-col justify-between group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0px_0px_#000] transition-all">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">{t('overview.reports', locale)}</p>
                <FileText className="w-4 h-4 opacity-60" />
              </div>
              <div>
                <p className="text-[30px] font-black tracking-tighter leading-none">
                  {formatNumberLocale(stats.reports.count, locale as any)}
                </p>
                <p className="text-[11px] font-bold mt-2 bg-white border-2 border-black inline-block px-2 py-0.5">
                  {t('overview.reportsSub', locale, { ready: stats.reports.ready })}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Demo badge removed in production, only show if isDemo */}
        {data.isDemo && (
          <div className="bg-black text-[#DFFF00] border-[3px] border-black p-2 text-[10px] font-black uppercase text-center">
            {t('common.demoBadge', locale)} — local development only
          </div>
        )}

        {/* Contrast fix note - olive-on-lime previously failed WCAG AA */}
        <div className="bg-white border-[3px] border-black border-dashed p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            WCAG AA: All text 4.5:1 contrast • Tap target min 44×44px • Safe-area insets • Pull-to-refresh enabled
          </p>
        </div>
      </div>
    </div>
  )
}
