"use client"
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react"
import { Home, Search, BarChart3, TrendingUp, Menu, X, Zap, Bookmark, FileText, Users, LayoutDashboard, Compass, Crown, RefreshCw } from "lucide-react"
import { t, formatNumberLocale, useLocale } from "@/lib/i18n"

interface OverviewData {
  isDemo: boolean
  isEmpty?: boolean
  connectedAccount?: { username: string, platform: string, avatarUrl?: string }
  stats: { trackedAccounts: { count: number }, videosAnalyzed: { count: number }, saved: { count: number }, reports: { count: number } }
  lastSyncedMinutesAgo?: number | null
  tokenStatus: string
  syncing?: boolean
}

export default function MobileDashboard() {
  const locale = useLocale() as any
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Home")
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/overview').then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const menuItems = [
    { id: "Overview", label: t('nav.home', locale), icon: LayoutDashboard, href: "/overview", active: true },
    { id: "Search", label: t('nav.search', locale), icon: Search, href: "/search" },
    { id: "Analytics", label: t('nav.stats', locale), icon: BarChart3, href: "/analytics" },
    { id: "Trends", label: t('nav.trends', locale), icon: Compass, href: "/trends" },
    { id: "Competitors", label: "Competitors", icon: Users, href: "/competitors" },
    { id: "Saved", label: "Saved", icon: Bookmark, href: "/saved" },
    { id: "Reports", label: "Reports", icon: FileText, href: "/reports" },
    { id: "Settings", label: "Settings", icon: Compass, href: "/settings" },
  ]

  const bottomTabs = [
    { id: "Home", label: t('nav.home', locale), icon: Home, href: "/overview" },
    { id: "Search", label: t('nav.search', locale), icon: Search, href: "/search" },
    { id: "Stats", label: t('nav.stats', locale), icon: BarChart3, href: "/analytics" },
    { id: "Trends", label: t('nav.trends', locale), icon: TrendingUp, href: "/trends" },
    { id: "More", label: t('nav.more', locale), icon: Menu, action: () => setDrawerOpen(true) },
  ]

  const kpiCards = data ? [
    { title: t('overview.trackedAccounts', locale), metric: formatNumberLocale(data.stats.trackedAccounts.count, locale), bg: "bg-[#DFFF00]", icon: Users },
    { title: t('overview.videosAnalyzed', locale), metric: formatNumberLocale(data.stats.videosAnalyzed.count, locale), bg: "bg-[#A58BFF]", icon: BarChart3 },
    { title: t('overview.saved', locale), metric: formatNumberLocale(data.stats.saved.count, locale), bg: "bg-[#FF85A1]", icon: Bookmark },
    { title: t('overview.reports', locale), metric: formatNumberLocale(data.stats.reports.count, locale), bg: "bg-[#70D6FF]", icon: FileText },
  ] : [
    { title: "LOADING", metric: "—", bg: "bg-white", icon: Users },
    { title: "LOADING", metric: "—", bg: "bg-white", icon: BarChart3 },
    { title: "LOADING", metric: "—", bg: "bg-white", icon: Bookmark },
    { title: "LOADING", metric: "—", bg: "bg-white", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-[#F9F9FB] font-sans antialiased overflow-x-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header - no duplicate hamburger? Keep one, bottom nav is primary */}
      <header className="sticky top-0 z-40 bg-[#DFFF00] border-b-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-[64px] max-w-[480px] mx-auto w-full">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-11 h-11 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#DFFF00] fill-[#DFFF00]" />
            </div>
            <h1 className="text-[18px] font-extrabold tracking-tighter uppercase">OVERVIEW</h1>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-11 h-11 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto w-full px-4 py-5 pb-28 space-y-5">
        {/* Compact header - avatar + username + platform badge + Last synced */}
        {data?.connectedAccount ? (
          <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] p-4 flex items-center gap-3">
            <img src={data.connectedAccount.avatarUrl || `https://i.pravatar.cc/150?u=${data.connectedAccount.username}`} className="w-12 h-12 border-[3px] border-black rounded-full" alt="" />
            <div>
              <p className="font-black text-[15px]">@{data.connectedAccount.username}</p>
              <p className="text-[11px] font-bold opacity-60">
                {data.lastSyncedMinutesAgo != null ? `${data.lastSyncedMinutesAgo} мин бұрын` : ''} • {data.connectedAccount.platform}
              </p>
            </div>
            {data.syncing && <div className="ml-auto w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />}
          </div>
        ) : (
          <div className="bg-[#DFFF00] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] p-5">
            <h2 className="text-[18px] font-extrabold uppercase">SOCIAL PULSE</h2>
            <p className="text-[12px] font-bold mt-2">Нақты дерек • Official APIs only • AES-256-GCM</p>
          </div>
        )}

        {/* Token expired banner */}
        {data?.tokenStatus === 'expired' && (
          <div className="bg-red-500 border-[3px] border-black p-3 flex items-center justify-between">
            <p className="font-black text-white text-xs uppercase">{t('overview.tokenExpired', locale)}</p>
            <a href="/api/oauth/instagram" className="bg-white border-2 border-black px-3 py-1 text-[11px] font-black uppercase">Reconnect →</a>
          </div>
        )}

        {/* 2x2 Grid - real data, no DEMO */}
        <div className="grid grid-cols-2 gap-4">
          {kpiCards.map((card, i) => (
            <div key={i} className="relative group">
              <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black border-[2px] border-black rounded-lg" />
              <div className={`relative ${card.bg} border-[3px] border-black rounded-lg p-4 h-[128px] flex flex-col justify-between`}>
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-extrabold tracking-widest uppercase opacity-60 leading-tight max-w-[80px]">{card.title}</p>
                  <card.icon className="w-4 h-4 stroke-[2.5] opacity-70" />
                </div>
                <div>
                  <p className="text-[28px] font-extrabold tracking-tighter leading-none">{card.metric}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {data?.isEmpty && (
          <div className="bg-white border-[3px] border-black p-6 text-center space-y-4">
            <p className="font-black uppercase">{t('overview.onboardingTitle', locale)}</p>
            <p className="text-xs font-bold opacity-70">{t('overview.onboardingDesc', locale)}</p>
            <div className="grid grid-cols-2 gap-3">
              <a href="/api/oauth/instagram" className="bg-[#A58BFF] border-[3px] border-black p-3 font-black text-xs uppercase text-center">Instagram →</a>
              <a href="/api/oauth/tiktok" className="bg-black text-white border-[3px] border-black p-3 font-black text-xs uppercase text-center">TikTok →</a>
            </div>
          </div>
        )}

        <div className="border-[3px] border-black border-dashed rounded-lg p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">Official APIs • No scraping • WCAG AA • 44x44 tap • Safe-area</p>
        </div>
      </main>

      {/* Bottom nav - 5 items, no wrapping */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-[4px] border-black" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-[480px] mx-auto w-full">
          <div className="flex items-center justify-around h-[72px] px-1">
            {bottomTabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => tab.action ? tab.action() : window.location.href = tab.href}
                  className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full ${isActive ? '-translate-y-1' : ''}`}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <div className={`w-11 h-8 flex items-center justify-center border-[2.5px] rounded-md ${isActive ? 'bg-[#DFFF00] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-transparent'}`}>
                    <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2] opacity-70'}`} />
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-wide uppercase ${isActive ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed top-0 left-0 bottom-0 w-[300px] bg-white border-r-[4px] border-black z-50 flex flex-col shadow-[8px_0px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-[#DFFF00] border-b-[4px] border-black p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-black border-[3px] border-black rounded-lg flex items-center justify-center">
                    <Zap className="w-7 h-7 text-[#DFFF00] fill-[#DFFF00]" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-extrabold tracking-tighter uppercase leading-none">SOCIAL PULSE</h2>
                    <p className="text-[11px] font-bold tracking-wide opacity-70 mt-1">Production • Official APIs</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 bg-white border-[2.5px] border-black rounded-md flex items-center justify-center">
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { window.location.href = item.href; setDrawerOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 h-12 border-[3px] rounded-lg font-extrabold text-[13px] uppercase tracking-wide text-left min-h-[44px] ${item.active ? 'bg-[#DFFF00] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-transparent hover:border-black'}`}
                >
                  <item.icon className="w-5 h-5 stroke-[2.2]" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="p-4 border-t-[3px] border-black bg-[#F9F9FB]">
              <div className="bg-black border-[3px] border-black rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-[#DFFF00]" />
                  <div>
                    <p className="text-[#DFFF00] font-extrabold text-[13px] uppercase tracking-wide">PRODUCTION</p>
                    <p className="text-white/60 text-[11px] font-bold">AES-256-GCM • RLS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
