export type Platform = "instagram" | "tiktok";

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Creator {
  id: string;
  platform: Platform;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  followers: number;
  region: string | null;
  region_source: "unset" | "inferred" | "manual";
  niche_tags: string;
  created_at: string;
  last_synced_at: string;
}

export interface Video {
  id: string;
  creator_id: string;
  external_id: string;
  url: string | null;
  thumbnail_url: string | null;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  posted_at: string | null;
  fetched_at: string;
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

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error ?? `Сұраныс сәтсіз аяқталды (${res.status})`, body.code, res.status);
  }
  return body as T;
}

export const api = {
  configStatus: () => request<{ instagramConfigured: boolean; tiktokConfigured: boolean }>("/config/status"),

  regions: () => request<{ cities: City[]; usedRegions: string[] }>("/regions"),

  geolocate: (lat: number, lng: number) => request<{ city: City }>("/geolocate", {
    method: "POST",
    body: JSON.stringify({ lat, lng }),
  }),

  analyze: (platform: Platform, handle: string) =>
    request<{ creator: Creator; videos: Video[] }>("/creators/analyze", {
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
};

export { ApiError };
