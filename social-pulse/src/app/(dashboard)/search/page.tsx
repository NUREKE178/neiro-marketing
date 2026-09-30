"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAccounts } from "@/lib/mockData"
import { formatNumber } from "@/lib/utils"
import { Search, MapPin } from "lucide-react"

export default function SearchPage() {
  const [query, setQuery] = useState("ойыншық")
  const [platform, setPlatform] = useState("all")
  const [region, setRegion] = useState("Алматы")

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black uppercase tracking-tighter">SEARCH BY NICHE</h1>

      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#111]">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ойыншық, coffee shop, beauty products..." className="w-full h-14 pl-12 border-3 border-black font-bold text-lg" />
            </div>
            <Button variant="black" size="lg" className="h-14">ANALYZE →</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-3 border-black p-3 bg-background">
              <p className="font-black text-xs uppercase mb-2">Платформа</p>
              <div className="flex gap-2">
                {['all', 'instagram', 'tiktok'].map(p => (
                  <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1 border-2 border-black font-black text-xs uppercase ${platform === p ? 'bg-black text-white' : 'bg-white'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="border-3 border-black p-3 bg-background">
              <p className="font-black text-xs uppercase mb-2">Өңір</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-transparent font-bold text-sm outline-none">
                  <option>Барлық өңірлер</option>
                  <option>Алматы</option>
                  <option>Астана</option>
                  <option>Шымкент</option>
                </select>
              </div>
              <p className="text-[10px] font-bold opacity-60 mt-1">Геолокация қате болуы мүмкін, қолмен өзгерт</p>
            </div>
            <div className="border-3 border-black p-3 bg-primary">
              <p className="font-black text-xs uppercase">Ескерту</p>
              <p className="text-xs font-bold">Контентте гео белгі болмаса, «өңірі расталмаған» деп белгіленеді</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-black uppercase mb-4">Нәтижелер: {query} • {region} • {mockAccounts.length} аккаунт <Badge variant="demo">DEMO DATA</Badge></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAccounts.map(acc => (
            <Card key={acc.id}>
              <CardHeader className="bg-primary">
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <img src={acc.avatar} className="w-10 h-10 border-3 border-black" alt="" />
                    <div>
                      <CardTitle className="text-sm">{acc.username}</CardTitle>
                      <p className="text-xs font-bold opacity-70">{acc.displayName}</p>
                    </div>
                  </div>
                  <Badge variant={acc.regionVerified ? "black" : "white"} className="text-[10px]">{acc.regionVerified ? "✓ " + acc.region : "өңірі расталмаған"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <p className="text-xs font-bold line-clamp-2">{acc.bio}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="border-2 border-black p-2 bg-background"><p className="opacity-60 font-black text-[10px]">FOLLOWERS</p><p className="font-black">{formatNumber(acc.followers)}</p></div>
                  <div className="border-2 border-black p-2 bg-background"><p className="opacity-60 font-black text-[10px]">AVG VIEWS</p><p className="font-black">{formatNumber(acc.avgViews)}</p></div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-black">
                  <span className="text-[10px] font-bold">Соңғы: {acc.lastPostDate} • {acc.totalVideos} видео</span>
                  <Button size="sm" variant="black">Анализ →</Button>
                </div>
                <div className="bg-black text-primary text-[9px] font-bold p-1">Дереккөз: {acc.source} • {acc.isDemo ? 'DEMO DATA' : ''}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
