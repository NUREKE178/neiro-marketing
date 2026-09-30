"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, Search, BarChart3, TrendingUp, Settings, 
  Menu, X, Zap, Bookmark, FileText, Users, 
  LayoutDashboard, Compass, Flame, Crown
} from "lucide-react"

export default function MobileDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("Home")

  const menuItems = [
    { id: "Overview", label: "Overview", icon: LayoutDashboard, active: true },
    { id: "Search", label: "Search", icon: Search, active: false },
    { id: "Analytics", label: "Analytics", icon: BarChart3, active: false },
    { id: "Trends", label: "Trend Discovery", icon: Compass, active: false },
    { id: "Competitors", label: "Competitors", icon: Users, active: false },
    { id: "Saved", label: "Saved", icon: Bookmark, active: false },
    { id: "Reports", label: "Reports", icon: FileText, active: false },
    { id: "Settings", label: "Settings", icon: Settings, active: false },
  ]

  const bottomTabs = [
    { id: "Home", label: "Home", icon: Home },
    { id: "Search", label: "Search", icon: Search },
    { id: "Stats", label: "Stats", icon: BarChart3 },
    { id: "Trends", label: "Trends", icon: TrendingUp },
    { id: "More", label: "More", icon: Menu },
  ]

  const kpiCards = [
    { title: "TOTAL ANALYZED", metric: "1,247", badge: "+12% last month", bg: "bg-[#DFFF00]", icon: Users },
    { title: "VIDEO COUNT", metric: "12.4K", badge: "342 new", bg: "bg-[#A58BFF]", icon: BarChart3 },
    { title: "SAVED", metric: "23", badge: "5 accounts", bg: "bg-[#FF85A1]", icon: Bookmark },
    { title: "REPORTS", metric: "8", badge: "2 PDF", bg: "bg-[#70D6FF]", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-[#F9F9FB] font-sans antialiased overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Syne:wght@700;800&display=swap');
        * { font-family: 'Space Grotesk', sans-serif; }
        h1,h2,h3,.display { font-family: 'Syne', sans-serif; }
      `}</style>

      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-40 bg-[#DFFF00] border-b-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between px-4 h-[64px] max-w-[480px] mx-auto w-full">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#DFFF00] fill-[#DFFF00]" />
            </div>
            <h1 className="text-[18px] font-extrabold tracking-tighter uppercase">OVERVIEW</h1>
          </div>

          <div className="w-10 h-10 opacity-0 pointer-events-none">
            <Menu className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Container */}
      <main className="max-w-[480px] mx-auto w-full px-4 py-5 pb-28 space-y-5">

        {/* Hero Section Card - Neon Yellow #DFFF00 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Hard shadow */}
          <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black border-[3px] border-black rounded-lg" />
          {/* Main card */}
          <div className="relative bg-[#DFFF00] border-[3px] border-black rounded-lg p-5 shadow-none">
            {/* Branding */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-black border-[2px] border-black rounded-md flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-[#DFFF00] fill-[#DFFF00]" />
              </div>
              <div className="leading-tight">
                <h2 className="text-[18px] font-extrabold tracking-tight uppercase leading-none">SOCIAL PULSE</h2>
                <p className="text-[11px] font-bold tracking-[0.15em] uppercase opacity-70 mt-1">ANALYTICS SAAS</p>
              </div>
            </div>

            {/* Headline */}
            <h3 className="text-[20px] font-extrabold leading-[1.1] tracking-tight mt-4">
              Find Trends.<br />
              Analyze Content.<br />
              <span className="opacity-60">Make Smarter Moves.</span>
            </h3>

            {/* Badge - Black with gold text */}
            <div className="mt-4 inline-flex">
              <div className="bg-black border-2 border-black px-3 py-1.5 rounded-md">
                <p className="text-[10px] font-extrabold tracking-wide uppercase text-[#DFFF00]">
                  DEMO DATA — real account statistics excluded
                </p>
              </div>
            </div>

            {/* Subtext */}
            <p className="text-[12px] font-semibold leading-[1.4] mt-4 opacity-80">
              Based on Instagram & TikTok authorized data. 1,247 accounts, 12.4K videos analyzed.
            </p>
          </div>
        </motion.div>

        {/* Analytics 2x2 Grid Cards */}
        <div className="grid grid-cols-2 gap-4">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.25 }}
              className="relative group"
            >
              {/* Hard shadow */}
              <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black border-[2px] border-black rounded-lg group-hover:translate-x-[6px] group-hover:translate-y-[6px] transition-transform" />
              {/* Card */}
              <div className={`relative ${card.bg} border-[3px] border-black rounded-lg p-4 h-[128px] flex flex-col justify-between group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all`}>
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-extrabold tracking-widest uppercase opacity-60 leading-tight max-w-[80px]">{card.title}</p>
                  <card.icon className="w-4 h-4 stroke-[2.5] opacity-70" />
                </div>
                <div>
                  <p className="text-[28px] font-extrabold tracking-tighter leading-none">{card.metric}</p>
                  <div className="mt-2 inline-flex bg-black border-2 border-black rounded-md px-2 py-1">
                    <p className="text-[10px] font-bold text-white tracking-wide">{card.badge}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Section Label */}
        <div className="flex items-center gap-2 pt-2">
          <h4 className="text-[13px] font-extrabold uppercase tracking-widest">Recent Analysis • DEMO DATA</h4>
          <div className="h-[3px] flex-1 bg-black" />
        </div>

        {/* Example Recent Card */}
        <div className="relative group">
          <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black border-[2px] border-black rounded-lg" />
          <div className="relative bg-white border-[3px] border-black rounded-lg p-4 flex items-center justify-between group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F9F9FB] border-[2px] border-black rounded-md flex items-center justify-center font-extrabold text-sm">A</div>
              <div>
                <p className="font-extrabold text-[14px] tracking-tight">@almaty_toys 📸</p>
                <p className="font-bold text-[11px] opacity-70">Алматы Ойыншықтары</p>
                <p className="text-[10px] font-semibold opacity-50">Instagram • 2024-09-28 • Instagram API (demo)</p>
              </div>
            </div>
            <div className="bg-black border-2 border-[#DFFF00] px-2 py-1 rounded-md">
              <p className="text-[9px] font-extrabold text-[#DFFF00] tracking-wide">DEMO DATA</p>
            </div>
          </div>
        </div>

        {/* More content spacer for scroll demo */}
        <div className="h-6" />
        <div className="border-[3px] border-black border-dashed rounded-lg p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-50">More analytics content here — scrollable</p>
        </div>
      </main>

      {/* Bottom Navigation Bar - 5 Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-[4px] border-black">
        <div className="max-w-[480px] mx-auto w-full">
          <div className="flex items-center justify-around h-[72px] px-1">
            {bottomTabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
                    isActive ? '-translate-y-1' : 'hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`w-11 h-8 flex items-center justify-center border-[2.5px] rounded-md transition-all ${
                    isActive 
                      ? 'bg-[#DFFF00] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white border-transparent'
                  }`}>
                    <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2] opacity-70'}`} />
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-wide uppercase ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-dot"
                      className="w-1 h-1 bg-black rounded-full"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Slide-Out Sidebar Drawer Menu */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-white border-r-[4px] border-black z-50 flex flex-col shadow-[8px_0px_0px_0px_rgba(0,0,0,1)]"
            >
              {/* Top Header */}
              <div className="bg-[#DFFF00] border-b-[4px] border-black p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-black border-[3px] border-black rounded-lg flex items-center justify-center">
                      <Zap className="w-7 h-7 text-[#DFFF00] fill-[#DFFF00]" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-extrabold tracking-tighter uppercase leading-none">SOCIAL PULSE</h2>
                      <p className="text-[11px] font-bold tracking-wide opacity-70 mt-1">Find Trends. Analyze Content.<br />Make Smarter Moves.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-8 h-8 bg-white border-[2.5px] border-black rounded-md flex items-center justify-center hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
                <div className="mt-4 bg-black border-2 border-black rounded-md px-3 py-1.5 inline-flex">
                  <p className="text-[10px] font-bold text-[#DFFF00] uppercase tracking-wide">DEMO DATA — real account statistics excluded</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => {
                      setActiveTab(item.id === "Overview" ? "Home" : item.id)
                      setDrawerOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 h-12 border-[3px] rounded-lg font-extrabold text-[13px] uppercase tracking-wide text-left transition-all ${
                      item.active
                        ? 'bg-[#DFFF00] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5'
                        : 'bg-white border-transparent hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                    }`}
                  >
                    <item.icon className="w-5 h-5 stroke-[2.2]" />
                    {item.label}
                  </motion.button>
                ))}
              </div>

              {/* Bottom CTA Button - Solid Black with Neon Yellow text */}
              <div className="p-4 border-t-[3px] border-black bg-[#F9F9FB]">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black border-[3px] border-black rounded-lg" />
                  <div className="relative bg-black border-[3px] border-black rounded-lg p-4 flex items-center justify-between group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-[#DFFF00]" />
                      <div>
                        <p className="text-[#DFFF00] font-extrabold text-[13px] uppercase tracking-wide">Upgrade to PRO →</p>
                        <p className="text-white/60 text-[11px] font-bold">Full API, Export, AI</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] font-bold opacity-40 text-center mt-3 uppercase tracking-widest">© 2026 Social Pulse • DEMO MODE</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
