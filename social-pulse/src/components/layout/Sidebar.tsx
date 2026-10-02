"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Search, 
  BarChart3, 
  TrendingUp, 
  MoreHorizontal,
  Zap
} from "lucide-react"
import { useLocale, t } from "@/lib/i18n"
import { useState, useEffect } from "react"

// Bottom nav unified: Home Search Stats Trends More (max 5 per Material)
const navItems = [
  { href: "/overview", shortLabel: "Home", labelKey: "nav.home", icon: LayoutDashboard, exact: false },
  { href: "/search", shortLabel: "Search", labelKey: "nav.search", icon: Search },
  { href: "/analytics", shortLabel: "Stats", labelKey: "nav.stats", icon: BarChart3 },
  { href: "/trends", shortLabel: "Trends", labelKey: "nav.trends", icon: TrendingUp },
  { href: "/more", shortLabel: "More", labelKey: "nav.more", icon: MoreHorizontal },
]

export function Sidebar() {
  const pathname = usePathname()
  const [locale, setLocale] = useState<'kk'|'ru'|'en'>('kk')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale') as any
      if (stored && ['kk','ru','en'].includes(stored)) setLocale(stored)
    }
  }, [])

  return (
    <aside className="w-[280px] min-h-screen bg-white border-r-4 border-black flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b-4 border-black bg-[#DFFF00]">
        <Link href="/overview" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black border-3 border-black flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#DFFF00]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">SOCIAL PULSE</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Analytics SaaS</p>
          </div>
        </Link>
      </div>

      {/* Nav - 5 items max, short labels to prevent wrapping */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname || '').startsWith(item.href + '/') || (item.href === '/overview' && pathname === '/')
          // Translate label via i18n if available else shortLabel
          let label = item.shortLabel
          try {
            const translated = t(item.labelKey, locale as any)
            if (translated !== item.labelKey) label = translated
          } catch {}
          
          return (
            <Link
              key={item.href}
              href={item.href === '/more' ? '/settings' : item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-3 border-transparent font-bold text-sm uppercase tracking-wide transition-all min-h-[44px]",
                isActive 
                  ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_#111] translate-x-[-2px] translate-y-[-2px]" 
                  : "hover:bg-[#DFFF00] hover:border-black hover:shadow-[4px_4px_0px_0px_#111] hover:translate-x-[-1px] hover:translate-y-[-1px]"
              )}
              style={{ minHeight: '44px' }}
            >
              <item.icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
        
        {/* Drawer for all 8 items inside More */}
        <div className="pt-4 border-t-[3px] border-black border-dashed mt-4">
          <p className="text-[10px] font-black uppercase opacity-50 mb-2">Барлығы</p>
          <div className="space-y-1">
            {[
              { href: "/competitors", label: "Competitors" },
              { href: "/saved", label: "Saved" },
              { href: "/reports", label: "Reports" },
              { href: "/settings", label: "Settings" },
            ].map(link => (
              <Link key={link.href} href={link.href} className="block text-xs font-bold uppercase hover:underline px-2 py-2 min-h-[44px] flex items-center">
                → {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom card - production, no DEMO */}
      <div className="p-4">
        <div className="bg-[#A58BFF] border-3 border-black p-4 shadow-[4px_4px_0px_0px_#111]">
          <p className="font-black text-sm uppercase">PRODUCTION</p>
          <p className="text-xs font-bold mt-1">Official APIs only • AES-256-GCM • No scraping</p>
          <div className="mt-3 bg-black text-white text-[10px] font-black px-2 py-1 inline-block uppercase">
            {locale === 'kk' ? 'Қауіпсіз режим' : locale === 'ru' ? 'Безопасный режим' : 'Secure mode'}
          </div>
        </div>
      </div>
    </aside>
  )
}
