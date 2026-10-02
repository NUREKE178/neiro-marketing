export type Platform = "instagram" | "tiktok";

/**
 * Where a record's numbers came from. RapidAPI (or any unauthenticated
 * scraper) can only ever be "partially_verified" — it's reading public
 * pages, not an authenticated API, so there's no cryptographic guarantee
 * the numbers are current or complete. Only a record fetched through the
 * account owner's own official OAuth grant is "verified".
 */
export type DataSource = "rapidapi_instagram" | "rapidapi_tiktok" | "oauth_instagram" | "oauth_tiktok";
export type VerificationStatus = "verified" | "partially_verified";

export function verificationStatusForSource(source: DataSource): VerificationStatus {
  return source.startsWith("oauth_") ? "verified" : "partially_verified";
}

export interface NormalizedVideo {
  externalId: string;
  url: string | null;
  thumbnailUrl: string | null;
  caption: string;
  /**
   * null means the provider's response did not include this field at all —
   * genuinely unknown, never coerced to 0. 0 means the provider explicitly
   * reported zero.
   */
  views: number | null;
  likes: number | null;
  comments: number | null;
  /** ISO 8601, or null if the provider didn't return a timestamp */
  postedAt: string | null;
}

export interface NormalizedProfile {
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  /** null if the provider's response did not include a follower count. */
  followers: number | null;
  videos: NormalizedVideo[];
  source: DataSource;
  retrievedAt: string;
}

export interface SocialProvider {
  platform: Platform;
  source: DataSource;
  /** Fetches a public profile + its recent videos/reels/posts in one normalized shape. */
  fetchProfile(username: string): Promise<NormalizedProfile>;
}

/** Accepts a raw @handle, bare username, or full profile URL and returns the bare username. */
export function extractUsername(platform: Platform, raw: string): string {
  let value = raw.trim();
  if (value.startsWith("@")) value = value.slice(1);

  try {
    if (value.includes("://") || value.startsWith("www.")) {
      const url = new URL(value.startsWith("www.") ? `https://${value}` : value);
      const parts = url.pathname.split("/").filter(Boolean);
      if (platform === "instagram") {
        value = parts[0] ?? value;
      } else {
        // tiktok.com/@username or tiktok.com/@username/video/123
        const at = parts.find((p) => p.startsWith("@"));
        value = (at ?? parts[0] ?? value).replace(/^@/, "");
      }
    }
  } catch {
    // not a URL, treat as raw handle
  }

  return value.replace(/\/+$/, "").toLowerCase();
}
