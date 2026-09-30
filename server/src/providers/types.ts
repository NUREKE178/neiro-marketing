export type Platform = "instagram" | "tiktok";

export interface NormalizedVideo {
  externalId: string;
  url: string | null;
  thumbnailUrl: string | null;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  /** ISO 8601, or null if the provider didn't return a timestamp */
  postedAt: string | null;
}

export interface NormalizedProfile {
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  followers: number;
  videos: NormalizedVideo[];
}

export interface SocialProvider {
  platform: Platform;
  /** Fetches a public profile + its recent videos/reels/posts in one normalized shape. */
  fetchProfile(username: string): Promise<NormalizedProfile>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(platform: Platform) {
    super(
      `${platform} deректер провайдері теңшелмеген: RAPIDAPI_KEY (және тиісті RAPIDAPI_${platform.toUpperCase()}_HOST) .env файлында жоқ.`,
    );
    this.name = "ProviderNotConfiguredError";
  }
}

export class ProviderRequestError extends Error {
  constructor(
    public platform: Platform,
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ProviderRequestError";
  }
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
