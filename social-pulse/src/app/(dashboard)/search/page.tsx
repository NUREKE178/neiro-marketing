"use client"
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, AlertTriangle, CheckCircle, Zap, Instagram, Video, Loader2 } from "lucide-react"
import { useLocale, formatNumberLocale } from "@/lib/i18n"

interface SearchResult {
  username: string
  displayName: string
  platform: string
  avatar: string
  bio: string
  followers: number
  mediaCount?: number
  totalVideos?: number
  avgViews?: number
  region: string
  regionVerified: boolean
  source: string
  isRealCheck?: boolean
  lastChecked?: string
}

interface SearchResponse {
  success: boolean
  isRealCheck: boolean
  isNiche?: boolean
  platform: string
  query: string
  results: SearchResult[]
  tokenUsed?: boolean
  tokenError?: string
  disclaimer?: string
}

export default function SearchPage() {
  const locale = useLocale() as any
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('query') || 'ойыншық'
  const [query, setQuery] = useState(initialQuery)
  const [platform, setPlatform] = useState<'all' | 'instagram' | 'tiktok'>((searchParams.get('platform') as any) || 'all')
  const [region, setRegion] = useState(searchParams.get('region') || 'Алматы')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const doSearch = async (q = query) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ query: q, platform, region })
      // Update URL without reload
      router.replace(`/search?${params.toString()}`)
      const res = await fetch(`/api/search?${params.toString()}`)
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    doSearch(initialQuery)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch()
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto" suppressHydrationWarning>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#DFFF00] border-[3px] border-black flex items-center justify-center">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">SEARCH</h1>
          <p className="text-xs font-bold opacity-60">Кез келген Instagram аккаунтты тексеру — Business Discovery API (public fields only)</p>
        </div>
      </div>

      <Card className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#111]">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder="@sudo.ubuntu, @instagram, https://instagram.com/username, ойыншық..."
                className="w-full h-14 pl-12 border-[3px] border-black font-bold text-[15px] bg-white"
                style={{ minHeight: '44px' }}
              />
            </div>
            <Button variant="black" size="lg" className="h-14 min-h-[44px]" onClick={() => doSearch()} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ANALYZE →'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="opacity-60">Мысал:</span>
            <button onClick={() => { setQuery('@sudo.ubuntu'); doSearch('@sudo.ubuntu') }} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">@sudo.ubuntu</button>
            <button onClick={() => { setQuery('@instagram'); doSearch('@instagram') }} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">@instagram</button>
            <button onClick={() => { setQuery('ойыншық'); doSearch('ойыншық') }} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">ойыншық</button>
            <button onClick={() => { setQuery('coffee shop'); doSearch('coffee shop') }} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">coffee shop</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-[3px] border-black p-3 bg-[#F9F9FB]">
              <p className="font-black text-xs uppercase mb-2">Платформа</p>
              <div className="flex gap-2">
                {(['all', 'instagram', 'tiktok'] as const).map(p => (
                  <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1 border-2 border-black font-black text-xs uppercase min-h-[36px] ${platform === p ? 'bg-black text-white' : 'bg-white hover:bg-[#DFFF00]'}`}>{p}</button>
                ))}
              </div>
              <p className="text-[10px] font-bold opacity-60 mt-2">TikTok: бөтен аккаунт тексерілмейді</p>
            </div>
            <div className="border-[3px] border-black p-3 bg-[#F9F9FB]">
              <p className="font-black text-xs uppercase mb-2">Өңір</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-transparent font-bold text-sm outline-none">
                  <option>Барлық өңірлер</option>
                  <option>Алматы</option>
                  <option>Астана</option>
                  <option>Шымкент</option>
                  <option>Қарағанды</option>
                  <option>Қазақстан</option>
                </select>
              </div>
            </div>
            <div className="border-[3px] border-black p-3 bg-[#DFFF00]">
              <p className="font-black text-xs uppercase flex items-center gap-1"><Zap className="w-4 h-4" /> Қалай нақты тексеру?</p>
              <p className="text-[11px] font-bold mt-1">/overview → Connect Instagram Business → Кез келген @username → public дерек</p>
            </div>
          </div>

          {data && (
            <div className={`border-[3px] border-black p-3 flex items-start gap-3 ${data.isRealCheck ? 'bg-green-100' : 'bg-[#FFF7CC]'}`}>
              {data.isRealCheck ? <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-black mt-0.5" />}
              <div className="flex-1">
                <p className="font-black text-xs uppercase">{data.isRealCheck ? '✅ Нақты тексеру — Business Discovery API' : 'ℹ️ Instagram Business қосыңыз — сонда нақты public дерек келеді'}</p>
                <p className="text-[11px] font-bold mt-1 opacity-80">{data.disclaimer}</p>
                {data.tokenError && <p className="text-[11px] font-bold mt-1 text-red-700">{data.tokenError}</p>}
              </div>
              {data.isRealCheck && <Badge variant="black" className="text-[10px]">REAL</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      {error && <div className="bg-red-500 border-[3px] border-black p-4 text-white font-black">Error: {error}</div>}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black uppercase">Нәтижелер: {data?.query || query} • {region} • {data?.results?.length || 0}</h2>
          <span className="text-[11px] font-bold opacity-60">Public fields only • No scraping • Official API</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-[200px] bg-white border-[3px] border-black animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.results?.map((acc: any) => (
              <Card key={acc.username} className="overflow-hidden">
                <CardHeader className={`${data?.isRealCheck ? 'bg-green-300' : 'bg-[#DFFF00]'} border-b-[3px] border-black`}>
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <img src={acc.avatar} className="w-10 h-10 border-[3px] border-black" alt="" />
                      <div>
                        <CardTitle className="text-sm flex items-center gap-1">
                          @{acc.username}
                          {acc.platform === 'instagram' ? <Instagram className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                          {data?.isRealCheck ? <CheckCircle className="w-4 h-4 text-green-700" /> : null}
                        </CardTitle>
                        <p className="text-xs font-bold opacity-70">{acc.displayName}</p>
                      </div>
                    </div>
                    <Badge variant={acc.regionVerified ? "black" : "white"} className="text-[10px] h-fit">{acc.regionVerified ? "✓ " + acc.region : "өңірі расталмаған"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  <p className="text-xs font-bold line-clamp-2">{acc.bio}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="border-2 border-black p-2 bg-[#F9F9FB]"><p className="opacity-60 font-black text-[10px]">FOLLOWERS</p><p className="font-black" suppressHydrationWarning>{formatNumberLocale(acc.followers || acc.mediaCount || 0, locale)}</p></div>
                    <div className="border-2 border-black p-2 bg-[#F9F9FB]"><p className="opacity-60 font-black text-[10px]">{acc.mediaCount ? 'MEDIA' : 'VIDEOS'}</p><p className="font-black" suppressHydrationWarning>{formatNumberLocale(acc.mediaCount || acc.totalVideos || 0, locale)}</p></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-black">
                    <span className="text-[10px] font-bold" suppressHydrationWarning>{acc.lastPostDate || acc.lastChecked?.split('T')[0] || '—'}</span>
                    <Button size="sm" variant="black" onClick={() => window.location.href = `/analytics?account=${acc.username}`}>Анализ →</Button>
                  </div>
                  <div className={`text-[9px] font-bold p-1 border-2 border-black ${data?.isRealCheck ? 'bg-green-500 text-white' : 'bg-black text-[#DFFF00]'}`}>
                    Дереккөз: {acc.source}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data && !data.isRealCheck && (
          <div className="mt-8 bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-6">
            <h3 className="font-black uppercase text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Қалай кез келген аккаунтты нақты тексеруге болады?</h3>
            <div className="mt-4 space-y-3 text-sm font-bold">
              <p><span className="bg-black text-white px-2">1</span> /overview → Connect Instagram Business басыңыз</p>
              <p><span className="bg-black text-white px-2">2</span> Facebook Login арқылы Instagram Business/Creator қосыңыз</p>
              <p><span className="bg-black text-white px-2">3</span> Осы бетке оралып кез келген @username жазыңыз: <code className="bg-[#F9F9FB] border-2 border-black px-1">@sudo.ubuntu</code> <code className="bg-[#F9F9FB] border-2 border-black px-1">@nike</code></p>
              <p><span className="bg-black text-white px-2">4</span> Сервер Business Discovery арқылы public өрістерді алады: followers_count, media_count, profile_picture_url</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
