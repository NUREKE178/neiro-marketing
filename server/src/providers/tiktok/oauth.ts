import { NormalizedProfile, NormalizedVideo } from "../types.js";
import { AccountNotFoundError, ProviderAuthError, ProviderNotConfiguredError } from "../errors.js";
import { fetchProviderJson, numOrNull } from "../httpClient.js";

// TikTok for Developers — Login Kit (OAuth) + Display API. Unlike
// Instagram, TikTok's video.list scope does return view/like/comment/share
// counts for the user's own videos directly, no extra "insights" permission
// needed. Verify exact field names against developers.tiktok.com before
// relying on this — this sandbox cannot reach that site to confirm live.
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const SCOPES = ["user.info.basic", "video.list"];

export function isTiktokOAuthConfigured(): boolean {
  return Boolean(CLIENT_KEY && CLIENT_SECRET);
}

export function getAuthorizationUrl(redirectUri: string, state: string): string {
  if (!CLIENT_KEY) throw new ProviderNotConfiguredError("tiktok", "TIKTOK_CLIENT_KEY жоқ");
  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    redirect_uri: redirectUri,
    scope: SCOPES.join(","),
    response_type: "code",
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

interface TokenResult {
  accessToken: string;
  refreshToken: string | null;
  openId: string;
  expiresAt: string | null;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResult> {
  if (!CLIENT_KEY || !CLIENT_SECRET) {
    throw new ProviderNotConfiguredError("tiktok", "TIKTOK_CLIENT_KEY/TIKTOK_CLIENT_SECRET жоқ");
  }

  const body = new URLSearchParams({
    client_key: CLIENT_KEY,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body,
  });
  if (!res.ok) {
    throw new ProviderAuthError("tiktok", res.status, await res.text().catch(() => undefined));
  }
  const json = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    open_id?: string;
    expires_in?: number;
  };
  if (!json.access_token || !json.open_id) {
    throw new ProviderAuthError("tiktok", res.status, "token exchange response missing access_token/open_id");
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    openId: json.open_id,
    expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000).toISOString() : null,
  };
}

/** Fetches the connected account's OWN profile + videos — never a third party's. */
export async function fetchOwnProfile(accessToken: string): Promise<NormalizedProfile> {
  const profileRaw = await fetchProviderJson(
    "tiktok",
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,username,follower_count,bio_description",
    { Authorization: `Bearer ${accessToken}` },
  );
  const user = (profileRaw.data as Record<string, unknown> | undefined)?.user as
    | Record<string, unknown>
    | undefined;
  if (!user?.username) {
    throw new AccountNotFoundError("tiktok", "me");
  }

  const videosRaw = await fetchProviderJson("tiktok", "https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time", {
    Authorization: `Bearer ${accessToken}`,
  });
  const items = ((videosRaw.data as Record<string, unknown> | undefined)?.videos ?? []) as Record<
    string,
    unknown
  >[];

  const videos: NormalizedVideo[] = items.map((v) => ({
    externalId: String(v.id),
    url: (v.share_url as string | undefined) ?? null,
    thumbnailUrl: (v.cover_image_url as string | undefined) ?? null,
    caption: String(v.title ?? ""),
    views: numOrNull(v.view_count),
    likes: numOrNull(v.like_count),
    comments: numOrNull(v.comment_count),
    postedAt: v.create_time ? new Date(Number(v.create_time) * 1000).toISOString() : null,
  }));

  return {
    platform: "tiktok",
    source: "oauth_tiktok",
    retrievedAt: new Date().toISOString(),
    username: String(user.username),
    displayName: String(user.display_name ?? user.username),
    avatarUrl: (user.avatar_url as string | undefined) ?? null,
    bio: String(user.bio_description ?? ""),
    followers: numOrNull(user.follower_count),
    videos,
  };
}
