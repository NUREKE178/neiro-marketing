"use client"
export const dynamic = 'force-dynamic'
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, AlertTriangle, CheckCircle, Zap, Instagram, Video, Loader2, ExternalLink } from "lucide-react"
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
  isDemo: boolean
  isNiche?: boolean
  platform: string
  query: string
  results: SearchResult[]
  tokenSource?: string
  tokenError?: string
  disclaimer?: string
  error?: string
  instructions?: any
  explanation?: any
}

export default function SearchPage() {
  const locale = useLocale() as any
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('query') || ''
  const [query, setQuery] = useState(initialQuery)
  const [platform, setPlatform] = useState<'all' | 'instagram' | 'tiktok'>((searchParams.get('platform') as any) || 'all')
  const [region, setRegion] = useState(searchParams.get('region') || 'Алматы')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const doSearch = async (q = query) => {
    if (!q.trim()) {
      document.getElementById('search-input')?.focus()
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ query: q, platform, region })
      router.replace(`/search?${params.toString()}`)
      const res = await fetch(`/api/search?${params.toString()}`)
      const json = await res.json()
      setData(json)
      if (json.error && !json.instructions) {
        setError(json.error)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery)
    }
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
          <h1 className="text-3xl font-black uppercase tracking-tighter">ШЫН АККАУНТ ТЕКСЕРУ</h1>
          <p className="text-xs font-bold opacity-60">Кез келген Instagram public бизнес аккаунтты — Business Discovery API (нақты дерек, scraping жоқ)</p>
        </div>
      </div>

      <Card className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#111]">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
              <input 
                id="search-input"
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder="@sudo.ubuntu, @nike, @instagram, https://instagram.com/username..."
                className="w-full h-14 pl-12 border-[3px] border-black font-bold text-[15px] bg-white"
                style={{ minHeight: '44px' }}
              />
            </div>
            <Button variant="black" size="lg" className="h-14 min-h-[44px] bg-black text-white border-3 border-black hover:bg-[#DFFF00] hover:text-black" onClick={() => doSearch()} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ТЕКСЕРУ →'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="opacity-60">Мысал (басып тексер):</span>
            <button onClick={() => { setQuery('sudo.ubuntu'); doSearch('sudo.ubuntu') }} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">sudo.ubuntu</button>
            <button onClick={() => { setQuery('instagram'); doSearch('instagram') }} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">@instagram</button>
            <button onClick={() => { setQuery('nike'); doSearch('nike') }} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">@nike</button>
            <button onClick={() => { setQuery('natgeo'); doSearch('natgeo') }} className="bg-white border-2 border-black px-2 py-1 hover:bg-[#DFFF00]">@natgeo</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-[3px] border-black p-3 bg-[#F9F9FB]">
              <p className="font-black text-xs uppercase mb-2">Платформа</p>
              <div className="flex gap-2">
                {(['all', 'instagram', 'tiktok'] as const).map(p => (
                  <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1 border-2 border-black font-black text-xs uppercase min-h-[36px] ${platform === p ? 'bg-black text-white' : 'bg-white hover:bg-[#DFFF00]'}`}>{p}</button>
                ))}
              </div>
              <p className="text-[10px] font-bold opacity-60 mt-2">TikTok: бөтен аккаунт тексерілмейді (ереже)</p>
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
                  <option>Қазақстан</option>
                </select>
              </div>
            </div>
            <div className="border-[3px] border-black p-3 bg-[#DFFF00]">
              <p className="font-black text-xs uppercase flex items-center gap-1"><Zap className="w-4 h-4" /> Нақты дерек қалай?</p>
              <p className="text-[11px] font-bold mt-1">Instagram Business + Facebook App → /overview → Connect → кез келген @username</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <div className="bg-red-500 border-[3px] border-black p-4 text-white font-black">Error: {error}</div>}

      {/* Real results */}
      {data?.success && data.results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black uppercase">Нәтиже: @{data.query} • {data.results.length} • REAL CHECK ✅</h2>
            <div className="flex items-center gap-2">
              <Badge variant="black">REAL</Badge>
              <span className="text-[11px] font-bold opacity-60">{data.tokenSource}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.results.map((acc: any) => (
              <Card key={acc.username} className="overflow-hidden border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
                <CardHeader className="bg-green-300 border-b-[3px] border-black">
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <img src={acc.avatar} className="w-12 h-12 border-[3px] border-black rounded-full" alt="" />
                      <div>
                        <CardTitle className="text-sm flex items-center gap-1">@{acc.username} <CheckCircle className="w-4 h-4 text-green-700" /></CardTitle>
                        <p className="text-xs font-bold opacity-70">{acc.displayName}</p>
                      </div>
                    </div>
                    <Instagram className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <p className="text-xs font-bold line-clamp-2">{acc.bio || '—'}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border-2 border-black p-2 bg-[#F9F9FB]"><p className="opacity-60 font-black text-[10px]">FOLLOWERS (нақты)</p><p className="font-black text-lg" suppressHydrationWarning>{formatNumberLocale(acc.followers, locale)}</p></div>
                    <div className="border-2 border-black p-2 bg-[#F9F9FB]"><p className="opacity-60 font-black text-[10px]">MEDIA COUNT (нақты)</p><p className="font-black text-lg" suppressHydrationWarning>{formatNumberLocale(acc.mediaCount || 0, locale)}</p></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-black">
                    <span className="text-[10px] font-bold" suppressHydrationWarning>Тексерілді: {acc.lastChecked?.split('T')[0]}</span>
                    <a href={`https://instagram.com/${acc.username}`} target="_blank" className="border-2 border-black p-1 hover:bg-[#DFFF00]"><ExternalLink className="w-4 h-4" /></a>
                  </div>
                  <div className="bg-green-600 text-white text-[10px] font-black p-2 border-2 border-black">
                    ✅ REAL CHECK: {acc.source}
                  </div>
                  <p className="text-[9px] font-bold opacity-60">Public fields only: followers_count, media_count, profile_picture_url, biography. Жеке емес.</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 bg-white border-3 border-black border-dashed p-3">
            <p className="text-[11px] font-bold opacity-60">{data.disclaimer}</p>
          </div>
        </div>
      )}

      {/* No token - show instructions, NOT demo */}
      {data && !data.success && (
        <div className="space-y-6">
          <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6">
            <h3 className="font-black uppercase text-xl flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Шын аккаунт @{data.query} тексеру үшін не істеу керек?</h3>
            
            {data.tokenError && (
              <div className="mt-4 bg-red-50 border-[3px] border-red-500 p-3">
                <p className="font-black text-sm text-red-700">Қате: {data.tokenError}</p>
              </div>
            )}

            <div className="mt-6 space-y-4 text-sm font-bold leading-relaxed">
              <div className="bg-[#DFFF00] border-3 border-black p-4">
                <p className="font-black uppercase">1️⃣ Instagram-ды Business-қа ауыстырыңыз (1 минут)</p>
                <p className="mt-2">Instagram → Параметрлер → Аккаунт → Кәсіби аккаунтқа ауысу → <b>Business</b> немесе <b>Creator</b> таңдаңыз → Категория таңдаңыз → Дайын</p>
                <p className="text-[11px] opacity-70 mt-2">Неге? Business Discovery тек бизнес/creator аккаунт арқылы басқа public аккаунттарды тексере алады — бұл Instagram ережесі.</p>
              </div>

              <div className="bg-[#A58BFF] border-3 border-black p-4">
                <p className="font-black uppercase">2️⃣ Facebook App жасаңыз (тегін, 2 минут)</p>
                <div className="mt-2 space-y-1 text-[12px]">
                  <p>• <a href="https://developers.facebook.com/apps/" target="_blank" className="underline">developers.facebook.com/apps/</a> → <b>Create App</b> → Business түрі</p>
                  <p>• <b>Add Product</b>: Facebook Login + Instagram Graph API қосыңыз</p>
                  <p>• Facebook Login → Settings → Valid OAuth Redirect URIs:</p>
                  <code className="block bg-white border-2 border-black p-2 mt-1 text-[11px]">https://your-domain.vercel.app/api/oauth/instagram/callback<br/>http://localhost:3000/api/oauth/instagram/callback</code>
                  <p>• Instagram Graph API → Scopes: <code className="bg-white border-2 border-black px-1">instagram_basic, pages_show_list, pages_read_engagement</code></p>
                </div>
              </div>

              <div className="bg-[#70D6FF] border-3 border-black p-4">
                <p className="font-black uppercase">3️⃣ SOCIAL PULSE-қа қосыңыз (30 секунд)</p>
                <p className="mt-2">• <Link href="/overview" className="underline bg-black text-white px-2">/overview</Link> → <b>Connect Instagram Business</b> басыңыз</p>
                <p>• Facebook Login → өз Instagram Business аккаунтыңызды таңдаңыз → Рұқсат беріңіз</p>
                <p>• Дайын! Токен AES-256-GCM шифрланып DB-да сақталады</p>
              </div>

              <div className="bg-black text-white border-3 border-black p-4">
                <p className="font-black uppercase text-[#DFFF00]">4️⃣ Енді кез келген аккаунтты тексеріңіз</p>
                <p className="mt-2">/search → жазыңыз: <code className="bg-white text-black border-2 border-black px-2 py-1 mx-1">@sudo.ubuntu</code> <code className="bg-white text-black border-2 border-black px-2 py-1 mx-1">@nike</code> <code className="bg-white text-black border-2 border-black px-2 py-1 mx-1">@instagram</code></p>
                <p className="mt-2 text-[#DFFF00]">→ Нақты followers, media_count, profile picture келеді (public fields only, scraping жоқ)</p>
              </div>

              <div className="border-3 border-black border-dashed p-4">
                <p className="font-black uppercase text-xs">НЕГЕ ОСЫЛАЙ? (Заңды шектеулер)</p>
                <ul className="list-disc pl-5 mt-2 text-[12px] space-y-1 opacity-80">
                  <li>Instagram ресми API тек өз бизнес аккаунтыңыз арқылы басқа <b>public бизнес/creator</b> аккаунттарды тексеруге рұқсат береді (Business Discovery)</li>
                  <li>Жеке/private аккаунттарды тексеру мүмкін емес — бұл Instagram ережесі</li>
                  <li>Scraping жасамаймыз — тек ресми API, заңды</li>
                  <li>TikTok Display API бөтен аккаунтты тексеруге рұқсат бермейді, тек өз видеоларыңыз — сондықтан TikTok-та @sudo.ubuntu тексерілмейді, тек Instagram-да</li>
                  <li>Токен 60 күн жарамды, автоматты жаңарады, мерзімі бітсе Reconnect батырмасы шығады</li>
                </ul>
              </div>

              <div className="bg-[#F9F9FB] border-3 border-black p-4">
                <p className="font-black uppercase text-xs">ТЕЗ ТЕСТ (DB-сыз, .env арқылы, 1 минут)</p>
                <p className="text-[12px] mt-2">Егер DB қосқыңыз келмесе, Graph Explorer-дан токен алып .env-ға қойыңыз:</p>
                <code className="block bg-white border-2 border-black p-2 mt-2 text-[11px]">
                  INSTAGRAM_ACCESS_TOKEN=ваш_long_lived_token_60_дней<br/>
                  INSTAGRAM_USER_ID=ваш_ig_business_id<br/>
                  # Токенді алу: developers.facebook.com/tools/explorer/ → Get Token → instagram_basic, pages_show_list<br/>
                  # Long-lived айырбастау: GET https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN
                </code>
                <p className="text-[11px] mt-2 opacity-70">Серверді қайта қосыңыз → /search?query=@nike → нақты дерек келеді</p>
              </div>
            </div>
          </div>

          {data.instructions && (
            <div className="bg-white border-3 border-black p-4">
              <pre className="whitespace-pre-wrap text-[12px] font-bold leading-relaxed">{data.instructions.kk}</pre>
            </div>
          )}
        </div>
      )}

      {!data && !loading && (
        <div className="bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-8 text-center">
          <div className="w-16 h-16 bg-[#DFFF00] border-3 border-black mx-auto flex items-center justify-center mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-black uppercase text-xl">Кез келген Instagram аккаунтты тексеріңіз</h3>
          <p className="text-sm font-bold opacity-70 mt-2 max-w-lg mx-auto">Мысалы: @sudo.ubuntu, @nike, @instagram — нақты public дерек Business Discovery арқылы</p>
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => { setQuery('sudo.ubuntu'); doSearch('sudo.ubuntu') }} className="bg-black text-white border-3 border-black px-4 py-2 font-black text-xs uppercase">sudo.ubuntu тексеру →</button>
          </div>
        </div>
      )}
    </div>
  )
}
