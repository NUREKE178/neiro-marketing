"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, ExternalLink, Eye, Heart, MessageCircle, Share2, TrendingUp, BarChart3, Clock, Hash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAccounts, mockVideos } from "@/lib/mockData"
import { formatNumber, calculateEngagementRate } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("Last 7 days")
  const account = mockAccounts[0]
  const videos = mockVideos.filter(v => v.accountId === account.id)

  const kpis = [
    { label: "Followers", value: formatNumber(account.followers), change: 12.5, tooltip: "Жазылушылар саны - Instagram Official API арқылы алынған", available: true },
    { label: "Total Views", value: formatNumber(account.totalViews), change: 8.3, tooltip: "Барлық видеолардың жалпы қаралымы", available: true },
    { label: "Total Likes", value: formatNumber(account.totalLikes), change: -2.1, tooltip: "Жалпы лайк саны", available: true },
    { label: "Total Comments", value: formatNumber(account.totalComments), change: 5.4, tooltip: "Жалпы пікір саны", available: true },
    { label: "Videos Published", value: account.totalVideos, change: 3, tooltip: "Жарияланған видео саны", available: true },
    { label: "Avg Views / Video", value: formatNumber(account.avgViews), change: 15.2, tooltip: "Орташа қаралым: Total Views / Total Videos", available: true },
  ]

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <img src={account.avatar} alt={account.username} className="w-20 h-20 border-4 border-black shadow-[6px_6px_0px_0px_#111]" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase tracking-tight">@{account.username}</h1>
              <Badge variant="black">{account.platform}</Badge>
              <Badge variant="demo">DEMO DATA</Badge>
              <a href={`https://instagram.com/${account.username}`} target="_blank" className="border-2 border-black p-1 hover:bg-primary">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="font-bold text-lg">{account.displayName}</p>
            <p className="text-sm font-medium opacity-70 max-w-xl">{account.bio}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-black uppercase bg-primary border-2 border-black px-2 py-1">Талдау кезеңі: {dateRange}</span>
              <span className="text-xs font-bold opacity-60">Соңғы жаңарту: {new Date(account.lastUpdated).toLocaleString()}</span>
              <span className="text-xs font-bold opacity-60">Дереккөз: {account.source}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="border-3 border-black bg-white px-3 py-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="font-black text-xs uppercase bg-transparent outline-none">
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 days</option>
              <option>Last 14 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom range</option>
            </select>
          </div>
          <Button variant="black">EXPORT PDF</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[10px] font-black uppercase opacity-60">{kpi.label}</p>
                  <div className="w-5 h-5 bg-black text-white flex items-center justify-center text-[10px] font-black" title={kpi.tooltip}>?</div>
                </div>
                <p className="text-2xl font-black">{kpi.value}</p>
                {kpi.change !== undefined && (
                  <p className={`text-xs font-black ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change >= 0 ? '↗' : '↘'} {kpi.change}% алдыңғы кезеңмен
                  </p>
                )}
                {!kpi.available && <p className="text-[10px] font-bold text-red-600 uppercase">API арқылы қолжетімсіз</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-blue">
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Views by Video</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={videos.map(v => ({ name: v.title.slice(0, 10), views: v.views }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ border: '3px solid #111', fontWeight: 700 }} />
                <Bar dataKey="views" fill="#D9FF3F" stroke="#111" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-purple">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Posting Frequency</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ date: '24', count: 3 }, { date: '25', count: 5 }, { date: '26', count: 2 }, { date: '27', count: 7 }, { date: '28', count: 4 }, { date: '29', count: 6 }, { date: '30', count: 8 }]}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ border: '3px solid #111', fontWeight: 700 }} />
                <Line type="monotone" dataKey="count" stroke="#111" strokeWidth={3} dot={{ fill: '#A78BFA', stroke: '#111', strokeWidth: 2, r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Video Performance Table */}
      <Card>
        <CardHeader className="bg-primary flex flex-row items-center justify-between">
          <CardTitle>Video Performance Table • DEMO DATA</CardTitle>
          <div className="flex gap-2">
            <input placeholder="Іздеу..." className="border-3 border-black px-3 py-1 font-bold text-sm w-48" />
            <select className="border-3 border-black px-3 py-1 font-black text-xs uppercase bg-white">
              <option>Барлық платформа</option>
              <option>Instagram</option>
              <option>TikTok</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr className="font-black text-xs uppercase">
                <th className="p-3 text-left border-r-2 border-white/20">Thumbnail</th>
                <th className="p-3 text-left border-r-2 border-white/20">Title / Caption</th>
                <th className="p-3 text-left border-r-2 border-white/20">Date ↕</th>
                <th className="p-3 text-left border-r-2 border-white/20">Views ↕</th>
                <th className="p-3 text-left border-r-2 border-white/20">Likes ↕</th>
                <th className="p-3 text-left border-r-2 border-white/20">Comments</th>
                <th className="p-3 text-left border-r-2 border-white/20">Engagement</th>
                <th className="p-3 text-left">URL</th>
              </tr>
            </thead>
            <tbody>
              {mockVideos.map((video) => (
                <tr key={video.id} className="border-b-3 border-black hover:bg-primary/20">
                  <td className="p-3"><img src={video.thumbnail} alt={video.title} className="w-16 h-16 border-2 border-black object-cover" /></td>
                  <td className="p-3 max-w-xs">
                    <p className="font-black text-sm line-clamp-1">{video.title}</p>
                    <p className="text-xs opacity-70 line-clamp-2">{video.caption}</p>
                    <div className="flex gap-1 mt-1">{video.hashtags.map(tag => <span key={tag} className="bg-purple border-2 border-black text-[10px] font-black px-1">#{tag}</span>)}</div>
                  </td>
                  <td className="p-3 font-bold text-xs">{video.publishedAt}</td>
                  <td className="p-3 font-black">{formatNumber(video.views)}</td>
                  <td className="p-3 font-black">{formatNumber(video.likes)}</td>
                  <td className="p-3 font-bold">{video.comments}</td>
                  <td className="p-3">
                    <span className="bg-black text-white font-black text-xs px-2 py-1">{video.engagementRate.toFixed(1)}%</span>
                    <p className="text-[9px] font-bold opacity-60 mt-1">(Likes+Comments+Shares)/Views*100</p>
                  </td>
                  <td className="p-3"><a href={video.url} target="_blank" className="text-blue-600 font-bold text-xs underline">Сілтеме</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* AI Content Analyst */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-primary">
          <CardHeader><CardTitle className="text-sm">📊 Нақты дерек (API)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm font-bold">
            <p>• Аккаунт 127 видео жариялаған, соңғы 7 күнде 4 видео</p>
            <p>• Ең көп қаралым: 12,300 (LEGO видео)</p>
            <p>• Орташа engagement: 4.2%</p>
            <p className="text-[10px] opacity-60">Дереккөз: Instagram Official API (demo) • 2024-09-30 жаңартылды</p>
          </CardContent>
        </Card>
        <Card className="bg-blue">
          <CardHeader><CardTitle className="text-sm">🧮 Есептелген көрсеткіш</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm font-bold">
            <p>• Engagement Rate = (890+45+12)/12300*100 = 7.7%</p>
            <p>• Орташа қаралым: 892,000 / 127 = 7,023</p>
            <p>• Жариялау жиілігі: аптасына 4.2 видео</p>
            <p className="text-[10px] opacity-60">Формула: (Likes+Comments)/Followers*100</p>
          </CardContent>
        </Card>
        <Card className="bg-purple">
          <CardHeader><CardTitle className="text-sm">🤖 AI Интерпретациясы</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm font-bold">
            <p>• Аккаунт негізінен ойыншық showcase форматында контент жасайды</p>
            <p>• Распаковка видеолары жоғары engagement алады (7.8%)</p>
            <p>• Ұсыныс: #ойыншық, #балалар хэштегтерін көбірек қолдану, кешкі 18:00-20:00 жариялау</p>
            <p className="text-[10px] opacity-60">AI болжамы кепілдік емес, тек идея</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-black text-white border-3 border-black p-4 text-xs font-bold">
        ⚠️ Ескерту: Бұл есеп тек қолжетімді жария деректер мен рұқсат етілген API нәтижелеріне негізделген. Деректер толық болмауы мүмкін. Күн сайынғы snapshot деректері жоқ жағдайда тарихи динамика қолжетімсіз.
      </div>
    </div>
  )
}
