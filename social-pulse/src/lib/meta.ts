/**
 * SOCIAL PULSE — Meta Graph API Client (Instagram)
 * Official APIs only, no scraping
 * Scopes: instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement
 * Competitor tracking ONLY via Business Discovery API (public business accounts, public fields only)
 */

import { encryptToken, decryptToken } from './encryption'

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v19.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

interface LongLivedTokenResponse {
  access_token: string
  token_type: string
  expires_in: number // ~60 days
}

interface IGUser {
  id: string
  username: string
  account_type: 'PERSONAL' | 'BUSINESS' | 'MEDIA_CREATOR'
  followers_count?: number
  follows_count?: number
  media_count?: number
  profile_picture_url?: string
}

interface IGMedia {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

interface BusinessDiscoveryResult {
  business_discovery: {
    id: string
    username: string
    name?: string
    biography?: string
    followers_count?: number
    follows_count?: number
    media_count?: number
    profile_picture_url?: string
    media?: { data: IGMedia[] }
  }
}

// Exponential backoff for rate limits
async function fetchWithBackoff(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, options)
    
    if (res.status === 429 || res.status === 503) {
      const retryAfter = res.headers.get('Retry-After')
      const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000 + Math.random() * 1000
      console.warn(`[Meta] Rate limited, retrying in ${waitMs}ms (attempt ${i+1}/${retries})`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }
    
    return res
  }
  throw new Error('Max retries exceeded for Meta API')
}

export async function exchangeCodeForShortLivedToken(code: string, redirectUri: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  })

  const res = await fetchWithBackoff(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`)
  
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meta token exchange failed: ${err}`)
  }
  
  return res.json()
}

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<LongLivedTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  })

  const res = await fetchWithBackoff(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`)
  
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meta long-lived token exchange failed: ${err}`)
  }
  
  return res.json()
}

export async function getIGUserProfile(accessToken: string, igUserId: string): Promise<IGUser> {
  const fields = 'id,username,account_type,followers_count,follows_count,media_count,profile_picture_url'
  const url = `${GRAPH_BASE}/${igUserId}?fields=${fields}&access_token=${accessToken}`
  
  const res = await fetchWithBackoff(url)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get IG profile: ${err}`)
  }
  
  return res.json()
}

export async function getIGMedia(accessToken: string, igUserId: string, limit = 25, since?: Date): Promise<IGMedia[]> {
  let url = `${GRAPH_BASE}/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
  
  if (since) {
    url += `&since=${Math.floor(since.getTime() / 1000)}`
  }
  
  const res = await fetchWithBackoff(url)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get IG media: ${err}`)
  }
  
  const data = await res.json()
  return data.data || []
}

export async function getIGMediaInsights(accessToken: string, mediaId: string): Promise<{ views?: number, reach?: number, saved?: number }> {
  // Only for BUSINESS/CREATOR accounts
  const metrics = 'engagement,impressions,reach,saved,video_views'
  const url = `${GRAPH_BASE}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
  
  const res = await fetchWithBackoff(url)
  if (!res.ok) {
    // Insights may not be available for all media, return empty
    console.warn(`Insights not available for ${mediaId}`)
    return {}
  }
  
  const data = await res.json()
  const result: any = {}
  data.data?.forEach((item: any) => {
    if (item.name === 'video_views') result.views = item.values[0]?.value
    if (item.name === 'reach') result.reach = item.values[0]?.value
    if (item.name === 'saved') result.saved = item.values[0]?.value
  })
  
  return result
}

export async function getBusinessDiscovery(
  accessToken: string, 
  igUserId: string, 
  targetUsername: string,
  mediaLimit = 10
): Promise<BusinessDiscoveryResult | null> {
  // ONLY public business accounts, public fields only
  // This is the ONLY way to track competitors per Meta policy
  const fields = `business_discovery.username(${targetUsername}){id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,media.limit(${mediaLimit}){id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count}}`
  const url = `${GRAPH_BASE}/${igUserId}?fields=${fields}&access_token=${accessToken}`
  
  const res = await fetchWithBackoff(url)
  if (!res.ok) {
    const err = await res.text()
    // If account is not business or not found, return null, don't throw
    if (err.includes('not found') || err.includes('Business')) {
      console.warn(`Business Discovery: ${targetUsername} not found or not business`)
      return null
    }
    throw new Error(`Business Discovery failed: ${err}`)
  }
  
  return res.json()
}

export async function refreshLongLivedToken(longLivedToken: string): Promise<LongLivedTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: longLivedToken,
  })

  const res = await fetchWithBackoff(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`)
  
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meta token refresh failed: ${err}`)
  }
  
  return res.json()
}

// Check if IG account is Personal (needs to switch to Business/Creator)
export function isPersonalAccount(accountType: string): boolean {
  return accountType === 'PERSONAL'
}

export function getBusinessSwitchGuide(locale: string = 'kk'): string[] {
  if (locale === 'kk') {
    return [
      'Instagram-ды ашыңыз → Профиль → Меню (☰) → Настройки',
      'Аккаунт → Кәсіби аккаунтқа ауысу',
      'Категория таңдаңыз (Блогер, Кәсіпкер...)',
      'Бизнес немесе Автор (Creator) таңдаңыз',
      'Facebook парақшасын байланыстырыңыз (міндетті)',
      'Дайын! Қайта OAuth жасаңыз'
    ]
  }
  return [
    'Open Instagram → Profile → Menu → Settings',
    'Account → Switch to Professional Account',
    'Choose category',
    'Choose Business or Creator',
    'Connect Facebook Page (required)',
    'Done! Reconnect OAuth'
  ]
}
