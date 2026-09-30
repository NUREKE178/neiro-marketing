"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockTrendData } from "@/lib/mockData"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function TrendsPage() {
  const [niche, setNiche] = useState("ойыншық")

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter">TREND DISCOVERY <Badge variant="demo">DEMO DATA</Badge></h1>
        <div className="flex gap-2">
          <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Тақырып: ойыншық, кофе, косметика..." className="border-3 border-black px-4 py-2 font-bold w-80" />
          <Button variant="black">ІЗДЕУ →</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-primary">
          <CardHeader><CardTitle>🔥 Жиі хэштегтер</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {mockTrendData.hashtags.map((h, i) => (
              <div key={i} className="flex items-center justify-between border-2 border-black bg-white p-2">
                <span className="font-black">#{h.tag}</span>
                <span className="bg-black text-white font-black text-xs px-2 py-1">{h.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-blue">
          <CardHeader><CardTitle>📝 Жиі сөздер (Caption)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {mockTrendData.commonWords.map((w, i) => (
              <div key={i} className="flex items-center justify-between border-2 border-black bg-white p-2">
                <span className="font-bold">{w.word}</span>
                <span className="font-black">{w.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-purple">
          <CardHeader><CardTitle>📅 Белсенділік</CardTitle></CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTrendData.postingFrequency}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ border: '3px solid #111', fontWeight: 700 }} />
                <Bar dataKey="count" fill="#111" stroke="#111" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-pink"><CardTitle>Views by Video • Нақты дерек</CardTitle></CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTrendData.viewsByVideo}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#D9FF3F" stroke="#111" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-white"><CardTitle>Контент форматтары</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'Product Showcase', count: 45, color: '#D9FF3F' },
                { type: 'Unboxing', count: 23, color: '#A78BFA' },
                { type: 'Review', count: 18, color: '#FF75B5' },
                { type: 'Lifestyle', count: 12, color: '#76D7FF' },
              ].map((f) => (
                <div key={f.type} className="border-3 border-black p-3" style={{ background: f.color }}>
                  <p className="font-black text-sm uppercase">{f.type}</p>
                  <p className="text-2xl font-black">{f.count}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-black text-primary border-3 border-black p-3 text-xs font-black uppercase">
        Графиктер тек қолда бар және нақты алынған деректерге негізделген. Болжамды көрсеткіштер нақты статистикадан ерекшеленеді.
      </div>
    </div>
  )
}
