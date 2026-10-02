/**
 * SOCIAL PULSE — TikTok API Client
 * Official APIs only: Login Kit + Display API (user's own profile and videos only)
 * Do NOT use Research API
 */

import { encryptToken, decryptToken } from './encryption'

const TIKTOK_AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize'
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2'

interface TikTokTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  open_id: string
  scope: string
  token_type: string
}

interface TikTokUser {
  open_id: string
  union_id?: string
  avatar_url?: string
  avatar_url_100?: string
  display_name?: string
  bio_description?: string
  follower_count?: number
  following_count?: number
  likes_count?: number
  video_count?: number
}

interface TikTokVideo {
  id: string
  title?: string
  cover_image_url?: string
  share_url?: string
  view_count?: number
  like_count?: number
  comment_count?: number
  share_count?: number
  create_time?: number
}

async function fetchWithBackoff(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, options)
    if (res.status === 429 || res.status === 503) {
      const waitMs = Math.pow(2, i) * 1000 + Math.random() * 1000
      console.warn(`[TikTok] Rate limited, retrying in ${waitMs}ms`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }
    return res
  }
  throw new Error('Max retries exceeded for TikTok API')
}

export function getTikTokAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    scope: 'user.info.basic,video.list',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  })
  return `${TIKTOK_AUTH_BASE}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TikTokTokenResponse> {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })

  const res = await fetchWithBackoff(TIKTOK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`TikTok token exchange failed: ${err}`)
  }

  return res.json()
}

export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResponse> {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const res = await fetchWithBackoff(TIKTOK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`TikTok refresh failed: ${err}`)
  }

  return res.json()
}

export async function getTikTokUserProfile(accessToken: string, openId?: string): Promise<TikTokUser> {
  const fields = 'open_id,union_id,avatar_url,avatar_url_100,display_name,bio_description,follower_count,following_count,likes_count,video_count'
  const url = `${TIKTOK_API_BASE}/user/info/?fields=${fields}`

  const res = await fetchWithBackoff(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get TikTok profile: ${err}`)
  }

  const data = await res.json()
  return data.data?.user || {}
}

export async function getTikTokVideos(accessToken: string, openId?: string, cursor = 0, maxCount = 20): Promise<{ videos: TikTokVideo[], hasMore: boolean, cursor?: number }> {
  const fields = 'id,title,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time'
  const url = `${TIKTOK_API_BASE}/video/list/?fields=${fields}`

  const res = await fetchWithBackoff(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      max_count: maxCount,
      cursor,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get TikTok videos: ${err}`)
  }

  const data = await res.json()
  return {
    videos: data.data?.videos || [],
    hasMore: data.data?.has_more || false,
    cursor: data.data?.cursor,
  }
}

// TikTok only allows user's own videos, no competitor tracking via Display API
// For competitors, user must manually input or use Business API (not in scope for v1)
export function isCompetitorTrackingAllowed(): boolean {
  return false // Display API only own videos
}
