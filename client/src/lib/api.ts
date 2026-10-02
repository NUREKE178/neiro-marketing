export type Platform = "instagram" | "tiktok";

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export type DataSource = "rapidapi_instagram" | "rapidapi_tiktok" | "oauth_instagram" | "oauth_tiktok";
export type VerificationStatus = "verified" | "partially_verified";

export interface Creator {
  id: string;
  platform: Platform;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  /** null = the data source never reported a follower count — not the same as 0. */
  followers: number | null;
  region: string | null;
  region_source: "unset" | "inferred" | "manual";
  niche_tags: string;
  source: DataSource;
  verification_status: VerificationStatus;
  created_at: string;
  last_synced_at: string;
  last_sync_status: "ok" | "failed";
  last_error: string | null;
}

export interface Video {
  id: string;
  creator_id: string;
  external_id: string;
  url: string | null;
  thumbnail_url: string | null;
  caption: string;
  /** null = not reported by the data source, distinct from a real 0. */
  views: number | null;
  likes: number | null;
  comments: number | null;
  posted_at: string | null;
  fetched_at: string;
}

export interface AccountStats {
  totalViews: number | null;
  totalLikes: number | null;
  totalComments: number | null;
  avgViews: number | null;
  engagementRate: string | null;
  videoCount: number;
  videosWithViews: number;
}

export interface SearchResult extends Creator {
  total_views: number;
  total_likes: number;
}

export interface LeaderboardEntry extends Creator {
  period_views: number;
  period_likes: number;
  period_comments: number;
  period_video_count: number;
}

class ApiError extends Error {
  code?: string;
  status?: number;
  detail?: string;

  constructor(message: string, code?: string, status?: number, detail?: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

// Web build (Vercel): relative "/api" hits the same-origin serverless
// function — leave unset. Native builds (Android/Windows) have no origin of
// their own, so VITE_API_BASE_URL must point at the deployed backend, e.g.
// https://your-app.vercel.app/api (set at build time, see client/README.md).
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      body.error ?? `Сұраныс сәтсіз аяқталды (${res.status})`,
      body.code,
      res.status,
      body.detail,
    );
  }
  return body as T;
}

export interface ConnectionStatus {
  configured: boolean;
  connected?: boolean;
  username?: string;
  scopes?: string[];
  connectedAt?: string;
  lastSyncAt?: string | null;
  lastSyncStatus?: "never_synced" | "ok" | "failed";
  lastError?: string | null;
  tokenExpired?: boolean;
  reason?: string;
}

export const api = {
  configStatus: () =>
    request<{
      instagramConfigured: boolean;
      tiktokConfigured: boolean;
      instagramOAuthConfigured: boolean;
      tiktokOAuthConfigured: boolean;
    }>("/config/status"),

  regions: () => request<{ cities: City[]; usedRegions: string[] }>("/regions"),

  geolocate: (lat: number, lng: number) => request<{ city: City }>("/geolocate", {
    method: "POST",
    body: JSON.stringify({ lat, lng }),
  }),

  analyze: (platform: Platform, handle: string) =>
    request<{
      creator: Creator;
      videos: Video[];
      stats: AccountStats;
      syncError?: { code: string; message: string };
    }>("/creators/analyze", {
      method: "POST",
      body: JSON.stringify({ platform, handle }),
    }),

  getCreator: (platform: Platform, username: string) =>
    request<{ creator: Creator; videos: Video[] }>(`/creators/${platform}/${username}`),

  setRegion: (creatorId: string, region: string) =>
    request<{ creator: Creator }>(`/creators/${creatorId}/region`, {
      method: "PATCH",
      body: JSON.stringify({ region }),
    }),

  search: (params: { keyword?: string; region?: string; platform?: Platform }) => {
    const qs = new URLSearchParams();
    if (params.keyword) qs.set("keyword", params.keyword);
    if (params.region) qs.set("region", params.region);
    if (params.platform) qs.set("platform", params.platform);
    return request<{ results: SearchResult[] }>(`/search?${qs}`);
  },

  leaderboard: (params: {
    platform?: Platform;
    region?: string;
    metric: "views" | "likes";
    days?: number;
    from?: string;
    to?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.platform) qs.set("platform", params.platform);
    if (params.region) qs.set("region", params.region);
    qs.set("metric", params.metric);
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.days) qs.set("days", String(params.days));
    return request<{ results: LeaderboardEntry[]; range: { from: string; to: string } }>(
      `/leaderboard?${qs}`,
    );
  },

  auth: {
    status: (platform: Platform) => request<ConnectionStatus>(`/auth/${platform}/status`),
    /** Not a fetch — a full-page navigation into the OAuth consent screen. */
    startUrl: (platform: Platform) => `${API_BASE}/auth/${platform}/start`,
    resync: (platform: Platform) =>
      request<{ creator: Creator }>(`/auth/${platform}/resync`, { method: "POST" }),
    disconnect: (platform: Platform) =>
      request<{ ok: true }>(`/auth/${platform}/disconnect`, { method: "POST" }),
  },
};

export { ApiError };
