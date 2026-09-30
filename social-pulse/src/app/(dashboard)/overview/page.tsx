"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockAccounts } from "@/lib/mockData"
import { Users, Video, Bookmark, FileText, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

export default function OverviewPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter">OVERVIEW <Badge variant="demo">DEMO DATA</Badge></h1>
        <Link href="/"><Button variant="black">SMART SEARCH →</Button></Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Жалпы талданған", value: "1,247", sub: "+12% соңғы ай", color: "bg-primary", icon: Users },
          { label: "Видео саны", value: "12.4K", sub: "342 жаңа", color: "bg-purple", icon: Video },
          { label: "Сақталған", value: "23", sub: "5 аккаунт", color: "bg-pink", icon: Bookmark },
          { label: "Есептер", value: "8", sub: "2 PDF", color: "bg-blue", icon: FileText },
        ].map((k, i) => (
          <Card key={i} className={k.color}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-black uppercase opacity-60">{k.label}</p>
                  <p className="text-3xl font-black">{k.value}</p>
                  <p className="text-xs font-bold opacity-70">{k.sub}</p>
                </div>
                <k.icon className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-black text-white"><CardTitle>Соңғы талдаулар</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-6">
            {mockAccounts.slice(0, 3).map(acc => (
              <div key={acc.id} className="flex items-center justify-between border-3 border-black p-3 bg-background">
                <div className="flex items-center gap-3">
                  <img src={acc.avatar} className="w-10 h-10 border-2 border-black" alt="" />
                  <div>
                    <p className="font-black text-sm">{acc.username}</p>
                    <p className="text-xs font-bold opacity-60">{acc.platform} • {acc.lastPostDate}</p>
                  </div>
                </div>
                <Badge variant="black">{acc.engagementRate}% ER</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-primary"><CardTitle>Трендтер</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-6">
            {[
              { niche: "ойыншық", growth: "+23%", color: "bg-purple" },
              { niche: "кофе", growth: "+18%", color: "bg-blue" },
              { niche: "косметика", growth: "+31%", color: "bg-pink" },
            ].map(t => (
              <div key={t.niche} className={`flex items-center justify-between border-3 border-black p-3 ${t.color}`}>
                <p className="font-black uppercase">#{t.niche}</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-black">{t.growth}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black text-white">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            <div>
              <p className="font-black uppercase">SOCIAL PULSE PRO</p>
              <p className="text-xs font-bold opacity-70">Толық API, экспорт, AI талдау, командалық жұмыс</p>
            </div>
          </div>
          <Button variant="default">PRO-ға өту →</Button>
        </CardContent>
      </Card>
    </div>
  )
}
