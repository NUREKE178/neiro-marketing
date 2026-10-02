"use client"
export const dynamic = 'force-dynamic'
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Instagram, Video, TrendingUp, MapPin, Zap, ArrowRight, BarChart3, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { mockAccounts, mockVideos } from "@/lib/mockData"
import { formatNumber } from "@/lib/utils"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [platform, setPlatform] = useState<'all' | 'instagram' | 'tiktok'>('all')
  const [region, setRegion] = useState("Алматы")

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8">
          {/* Hero Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto text-center py-12"
          >
            <div className="inline-flex items-center gap-2 bg-black text-white border-3 border-black px-4 py-2 text-xs font-black uppercase tracking-widest mb-6">
              <Zap className="w-4 h-4 text-primary" />
              AI-Powered Analytics • DEMO DATA
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
              WHAT'S TRENDING
              <br />
              <span className="bg-primary border-4 border-black px-4 inline-block shadow-[8px_8px_0px_0px_#111] mt-2">
                IN YOUR MARKET?
              </span>
            </h1>
            
            <p className="text-lg font-bold max-w-2xl mx-auto mb-10 opacity-70">
              Instagram және TikTok аккаунттарын, видеоларды, трендтерді бір интерфейстен талда. 
              <span className="bg-purple border-2 border-black px-2 mx-1">Рұқсат етілген деректер</span> негізінде.
            </p>

            {/* Big Search Bar */}
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#111] p-2 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a niche, account, product or paste a link..."
                    className="h-[64px] pl-14 text-lg font-bold border-3 text-black placeholder:text-black/50"
                  />
                </div>
                <Button size="xl" className="h-[64px] text-lg px-10">
                  ANALYZE <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              
              {/* Platform selector + examples */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-3 bg-background border-3 border-black">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs uppercase">Platform:</span>
                  {(['all', 'instagram', 'tiktok'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-4 py-2 border-3 border-black font-black text-xs uppercase transition-all ${
                        platform === p ? 'bg-black text-white shadow-[3px_3px_0px_0px_#111]' : 'bg-white hover:bg-primary'
                      }`}
                    >
                      {p === 'all' ? 'All' : p}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="opacity-60">Мысал:</span>
                  <code className="bg-white border-2 border-black px-2 py-1">@example_creator</code>
                  <code className="bg-white border-2 border-black px-2 py-1">ойыншық</code>
                  <code className="bg-white border-2 border-black px-2 py-1">coffee shop</code>
                </div>
              </div>
            </div>

            {/* Region selector */}
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
              <p className="text-[11px] font-bold opacity-60 max-w-xs text-left">
                ⚠️ Геолокация қате болуы мүмкін. Қолмен өзгертуге болады. Нақты мекенжай жиналмайды.
              </p>
            </div>
          </motion.div>

          {/* Top 5 Accounts - Niche Search Result */}
          <div className="max-w-7xl mx-auto mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                <span className="bg-black text-white px-3 py-1">TOP 5</span>
                ойыншық бойынша
                <Badge variant="demo">DEMO DATA</Badge>
              </h2>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase">Сұрыптау:</span>
                <select className="border-3 border-black px-3 py-2 font-black text-xs uppercase bg-white">
                  <option>Жарияланым саны</option>
                  <option>Қаралым</option>
                  <option>Лайк</option>
                  <option>Engagement rate</option>
                  <option>Соңғы жарияланым</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockAccounts.slice(0, 5).map((account, i) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full overflow-hidden">
                    <CardHeader className="bg-primary">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <img src={account.avatar} alt={account.username} className="w-12 h-12 border-3 border-black" />
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {account.username}
                              {account.platform === 'instagram' ? <Instagram className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </CardTitle>
                            <p className="text-xs font-bold opacity-70">{account.displayName}</p>
                          </div>
                        </div>
                        <Badge variant={account.regionVerified ? "black" : "white"} className="text-[10px]">
                          {account.regionVerified ? "✓ " + account.region : "өңірі расталмаған"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs font-bold line-clamp-2">{account.bio}</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-background border-2 border-black p-2">
                          <p className="text-[10px] font-black uppercase opacity-60">Followers</p>
                          <p className="font-black text-lg">{formatNumber(account.followers)}</p>
                        </div>
                        <div className="bg-background border-2 border-black p-2">
                          <p className="text-[10px] font-black uppercase opacity-60">Avg Views</p>
                          <p className="font-black text-lg">{formatNumber(account.avgViews)}</p>
                        </div>
                        <div className="bg-background border-2 border-black p-2">
                          <p className="text-[10px] font-black uppercase opacity-60">Engagement</p>
                          <p className="font-black text-lg">{account.engagementRate}%</p>
                        </div>
                        <div className="bg-background border-2 border-black p-2">
                          <p className="text-[10px] font-black uppercase opacity-60">Videos</p>
                          <p className="font-black text-lg">{account.totalVideos}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t-2 border-black">
                        <span className="text-[10px] font-bold opacity-60">Соңғы: {account.lastPostDate}</span>
                        <Link href={`/analytics?account=${account.username}`}>
                          <Button size="sm" variant="black">Анализ →</Button>
                        </Link>
                      </div>

                      <div className="bg-black text-primary text-[9px] font-bold px-2 py-1 uppercase" suppressHydrationWarning>
                        {account.source} • {new Date(account.lastUpdated).toISOString().split('T')[0]} • {account.isDemo ? 'DEMO DATA' : ''}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* KPI Overview */}
          <div className="max-w-7xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Жалпы талданған", value: "1,247", icon: Users, color: "bg-primary" },
              { label: "Видео саны", value: "12.4K", icon: Video, color: "bg-purple" },
              { label: "Соңғы талдау", value: "2 сағ бұрын", icon: TrendingUp, color: "bg-pink" },
              { label: "Сақталған", value: "23", icon: Eye, color: "bg-blue" },
            ].map((kpi, i) => (
              <Card key={i} className={`${kpi.color}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-70">{kpi.label}</p>
                    <p className="text-2xl font-black">{kpi.value}</p>
                  </div>
                  <kpi.icon className="w-8 h-8 opacity-50" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
