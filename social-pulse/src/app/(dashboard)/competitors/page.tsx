"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAccounts } from "@/lib/mockData"
import { formatNumber } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function CompetitorsPage() {
  const [selected, setSelected] = useState<string[]>(['1', '2', '3'])

  const selectedAccounts = mockAccounts.filter(a => selected.includes(a.id))

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black uppercase tracking-tighter">COMPETITOR COMPARISON <Badge variant="demo">DEMO DATA</Badge></h1>

      <Card className="bg-primary">
        <CardContent className="p-4 flex gap-2 flex-wrap">
          {mockAccounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => setSelected(prev => prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
              className={`border-3 border-black px-4 py-2 font-black text-sm uppercase flex items-center gap-2 ${selected.includes(acc.id) ? 'bg-black text-white shadow-[4px_4px_0px_0px_#111]' : 'bg-white'}`}
            >
              <img src={acc.avatar} className="w-6 h-6 border-2 border-black" alt={acc.username} />
              {acc.username}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full border-4 border-black">
          <thead className="bg-black text-white">
            <tr className="font-black text-xs uppercase">
              <th className="p-3 text-left">Аккаунт</th>
              <th className="p-3 text-left">Followers</th>
              <th className="p-3 text-left">Видео саны</th>
              <th className="p-3 text-left">Орташа қаралым</th>
              <th className="p-3 text-left">Орташа лайк</th>
              <th className="p-3 text-left">Engagement</th>
              <th className="p-3 text-left">Жиілік</th>
              <th className="p-3 text-left">Топ видео</th>
            </tr>
          </thead>
          <tbody>
            {selectedAccounts.map(acc => (
              <tr key={acc.id} className="border-b-3 border-black bg-white hover:bg-primary/30">
                <td className="p-3 font-black flex items-center gap-2"><img src={acc.avatar} className="w-8 h-8 border-2 border-black" alt="" />{acc.username}</td>
                <td className="p-3 font-black">{formatNumber(acc.followers)}</td>
                <td className="p-3 font-bold">{acc.totalVideos}</td>
                <td className="p-3 font-black">{formatNumber(acc.avgViews)}</td>
                <td className="p-3 font-bold">{formatNumber(acc.avgLikes)}</td>
                <td className="p-3"><span className="bg-black text-white px-2 py-1 font-black text-xs">{acc.engagementRate}%</span></td>
                <td className="p-3 font-bold">4.2/апта</td>
                <td className="p-3 font-bold text-xs">LEGO видео - 12.3K</td>
              </tr>
            ))}
            {selectedAccounts.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center font-black uppercase opacity-50">Аккаунт таңдалмаған</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Card>
        <CardHeader className="bg-blue"><CardTitle>Салыстыру графигі - Followers</CardTitle></CardHeader>
        <CardContent className="h-[300px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={selectedAccounts.map(a => ({ name: a.username, followers: a.followers }))}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
              <YAxis />
              <Tooltip contentStyle={{ border: '3px solid #111', fontWeight: 700 }} />
              <Bar dataKey="followers" fill="#A78BFA" stroke="#111" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="bg-white border-3 border-black p-4 text-xs font-bold">
        <p>⚠️ Егер аккаунт дерегі жетіспесе, бос мәнді нөлге ауыстырмаймыз. «Дерек қолжетімсіз» деп көрсетеміз.</p>
      </div>
    </div>
  )
}
