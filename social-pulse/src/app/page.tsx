"use client"
export const dynamic = 'force-dynamic'
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, MapPin, Zap, ArrowRight, BarChart3, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [platform, setPlatform] = useState<'all' | 'instagram' | 'tiktok'>('all')
  const [region, setRegion] = useState("Алматы")
  const [isSearching, setIsSearching] = useState(false)

  const handleAnalyze = () => {
    if (!searchQuery.trim()) {
      document.getElementById('main-search-input')?.focus()
      return
    }
    setIsSearching(true)
    const params = new URLSearchParams({
      query: searchQuery.trim(),
      platform,
      region,
    })
    router.push(`/search?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze()
  }

  const handleExampleClick = (example: string) => {
    setSearchQuery(example)
    const params = new URLSearchParams({ query: example, platform, region })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto text-center py-12">
            <div className="inline-flex items-center gap-2 bg-black text-white border-3 border-black px-4 py-2 text-xs font-black uppercase tracking-widest mb-6">
              <Zap className="w-4 h-4 text-[#DFFF00]" />
              Official APIs Only • No Scraping • AES-256-GCM
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
              WHAT'S TRENDING
              <br />
              <span className="bg-[#DFFF00] border-4 border-black px-4 inline-block shadow-[8px_8px_0px_0px_#111] mt-2">
                IN YOUR MARKET?
              </span>
            </h1>
            <p className="text-lg font-bold max-w-2xl mx-auto mb-10 opacity-70">
              Instagram және TikTok аккаунттарын, видеоларды, трендтерді бір интерфейстен талда. 
              <span className="bg-[#A58BFF] border-2 border-black px-2 mx-1">Рұқсат етілген деректер</span> негізінде.
            </p>

            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#111] p-2 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6" />
                  <Input 
                    id="main-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search a niche, account, product or paste a link... @sudo.ubuntu"
                    className="h-[64px] pl-14 text-lg font-bold border-3 text-black placeholder:text-black/50"
                  />
                </div>
                <Button size="xl" className="h-[64px] text-lg px-10 bg-black text-white border-3 border-black hover:bg-[#DFFF00] hover:text-black" onClick={handleAnalyze} disabled={isSearching}>
                  {isSearching ? 'ТЕКСЕРУ...' : <>ANALYZE <ArrowRight className="ml-2 w-5 h-5" /></>}
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-3 bg-[#F9F9FB] border-3 border-black">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs uppercase">Platform:</span>
                  {(['all', 'instagram', 'tiktok'] as const).map((p) => (
                    <button key={p} onClick={() => setPlatform(p)} className={`px-4 py-2 border-3 border-black font-black text-xs uppercase min-h-[36px] ${platform === p ? 'bg-black text-white shadow-[3px_3px_0px_0px_#111]' : 'bg-white hover:bg-[#DFFF00]'}`}>
                      {p === 'all' ? 'All' : p}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="opacity-60">Мысал:</span>
                  <button onClick={() => handleExampleClick('@sudo.ubuntu')} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">@sudo.ubuntu</button>
                  <button onClick={() => handleExampleClick('ойыншық')} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">ойыншық</button>
                  <button onClick={() => handleExampleClick('coffee shop')} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">coffee shop</button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-2 bg-white border-3 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#111]">
                <MapPin className="w-4 h-4" />
                <span className="font-black text-xs uppercase">Өңір:</span>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-transparent font-bold text-sm outline-none">
                  <option>Барлық өңірлер</option>
                  <option>Қазақстан</option>
                  <option>Алматы</option>
                  <option>Астана</option>
                  <option>Шымкент</option>
                  <option>Қарағанды</option>
                </select>
              </div>
              <p className="text-[11px] font-bold opacity-60 max-w-xs text-left">Кез келген Instagram аккаунтты тексеру — Business Discovery API (public fields only)</p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto mt-12 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6">
            <h3 className="font-black uppercase text-lg flex items-center gap-2"><Zap className="w-5 h-5" /> Қалай жұмыс істейді?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="border-3 border-black p-4 bg-[#DFFF00]"><p className="font-black text-xs uppercase">1. Аккаунт жазыңыз</p><p className="text-sm font-bold mt-2">@sudo.ubuntu, @instagram немесе тақырып: ойыншық</p></div>
              <div className="border-3 border-black p-4 bg-[#A58BFF]"><p className="font-black text-xs uppercase">2. ANALYZE басыңыз</p><p className="text-sm font-bold mt-2">Сервер Business Discovery арқылы public деректі тексереді</p></div>
              <div className="border-3 border-black p-4 bg-[#70D6FF]"><p className="font-black text-xs uppercase">3. Нәтиже</p><p className="text-sm font-bold mt-2">Нақты тексеру үшін /overview → Connect Instagram Business</p></div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/overview" className="block"><Card className="bg-[#DFFF00] border-3 border-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all"><CardContent className="p-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase opacity-70">Бақыланатын</p><p className="text-2xl font-black">Overview →</p></div><Users className="w-8 h-8 opacity-50" /></CardContent></Card></Link>
            <Link href="/search" className="block"><Card className="bg-[#A58BFF] border-3 border-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all"><CardContent className="p-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase opacity-70">Іздеу</p><p className="text-2xl font-black">Search →</p></div><Search className="w-8 h-8 opacity-50" /></CardContent></Card></Link>
            <Link href="/analytics" className="block"><Card className="bg-[#FF85A1] border-3 border-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all"><CardContent className="p-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase opacity-70">Аналитика</p><p className="text-2xl font-black">Stats →</p></div><BarChart3 className="w-8 h-8 opacity-50" /></CardContent></Card></Link>
            <Link href="/trends" className="block"><Card className="bg-[#70D6FF] border-3 border-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all"><CardContent className="p-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase opacity-70">Трендтер</p><p className="text-2xl font-black">Trends →</p></div><TrendingUp className="w-8 h-8 opacity-50" /></CardContent></Card></Link>
          </div>
        </main>
      </div>
    </div>
  )
}
