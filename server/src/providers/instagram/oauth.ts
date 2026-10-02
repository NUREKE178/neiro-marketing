import { NormalizedProfile, NormalizedVideo } from "../types.js";
import { AccountNotFoundError, ProviderAuthError, ProviderNotConfiguredError } from "../errors.js";
import { fetchProviderJson, numOrNull } from "../httpClient.js";

// "Instagram API with Instagram Login" — the current official path (the
// older "Instagram Basic Display API" was deprecated). It only works for
// Instagram Business/Creator accounts, not plain personal accounts — that's
// a Meta platform restriction, not something this code can work around.
// Exact scope names and field availability have changed before and may
// change again; verify against developers.facebook.com/docs/instagram
// before relying on this (this sandbox cannot reach that site to confirm
// live, same caveat as the RapidAPI mapping).
const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const SCOPES = ["instagram_business_basic"];

export function isInstagramOAuthConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function getAuthorizationUrl(redirectUri: string, state: string): string {
  if (!CLIENT_ID) throw new ProviderNotConfiguredError("instagram", "INSTAGRAM_CLIENT_ID жоқ");
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: SCOPES.join(","),
    response_type: "code",
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params}`;
}

interface TokenResult {
  accessToken: string;
  userId: string;
  expiresAt: string | null;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResult> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new ProviderNotConfiguredError("instagram", "INSTAGRAM_CLIENT_ID/INSTAGRAM_CLIENT_SECRET жоқ");
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body });
  if (!res.ok) {
    throw new ProviderAuthError("instagram", res.status, await res.text().catch(() => undefined));
  }
  const json = (await res.json()) as { access_token?: string; user_id?: string };
  if (!json.access_token || !json.user_id) {
    throw new ProviderAuthError("instagram", res.status, "token exchange response missing access_token/user_id");
  }

  // Exchange the short-lived token for a 60-day long-lived one.
  const longLivedQs = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: CLIENT_SECRET,
    access_token: json.access_token,
  });
  const longLivedRes = await fetch(`https://graph.instagram.com/access_token?${longLivedQs}`);
  if (!longLivedRes.ok) {
    // Fall back to the short-lived token rather than failing the whole connect flow.
    return { accessToken: json.access_token, userId: json.user_id, expiresAt: null };
  }
  const longLived = (await longLivedRes.json()) as { access_token?: string; expires_in?: number };
  const expiresAt = longLived.expires_in
    ? new Date(Date.now() + longLived.expires_in * 1000).toISOString()
    : null;

  return { accessToken: longLived.access_token ?? json.access_token, userId: json.user_id, expiresAt };
}

/** Fetches the connected account's OWN profile + media — never a third party's. */
export async function fetchOwnProfile(accessToken: string): Promise<NormalizedProfile> {
  const profile = await fetchProviderJson(
    "instagram",
    `https://graph.instagram.com/me?fields=id,username,account_type,media_count,profile_picture_url&access_token=${accessToken}`,
    {},
  );

  if (!profile.username) {
    throw new AccountNotFoundError("instagram", "me");
  }

  const mediaRaw = await fetchProviderJson(
    "instagram",
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${accessToken}`,
    {},
  );

  const items = (mediaRaw.data ?? []) as Record<string, unknown>[];
  const videos: NormalizedVideo[] = items.map((m) => ({
    externalId: String(m.id),
    url: (m.permalink as string | undefined) ?? null,
    thumbnailUrl: (m.thumbnail_url ?? m.media_url ?? null) as string | null,
    caption: String(m.caption ?? ""),
    // The official API's own /me/media endpoint does not expose play/view
    // counts for all media types without the additional insights
    // permission — left null (unknown), never guessed.
    views: null,
    likes: numOrNull(m.like_count),
    comments: numOrNull(m.comments_count),
    postedAt: (m.timestamp as string | undefined) ?? null,
  }));

  return {
    platform: "instagram",
    source: "oauth_instagram",
    retrievedAt: new Date().toISOString(),
    username: String(profile.username),
    displayName: String(profile.username),
    avatarUrl: (profile.profile_picture_url as string | undefined) ?? null,
    bio: "",
    followers: null, // not exposed by this endpoint for Instagram Login-based access
    videos,
  };
}
