import {
  NormalizedProfile,
  NormalizedVideo,
  ProviderNotConfiguredError,
  ProviderRequestError,
  SocialProvider,
} from "./types.js";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
// Default targets the common "v1/info" + "v1/reels" RapidAPI Instagram scraper
// shape (several vendors on RapidAPI ship this same interface). Override via
// env if the product you subscribed to differs — see server/README.md.
const HOST = process.env.RAPIDAPI_INSTAGRAM_HOST ?? "instagram-scraper-stable-api.p.rapidapi.com";

async function rapidGet(pathAndQuery: string) {
  if (!RAPIDAPI_KEY) throw new ProviderNotConfiguredError("instagram");

  const res = await fetch(`https://${HOST}${pathAndQuery}`, {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": HOST,
    },
  });

  if (!res.ok) {
    throw new ProviderRequestError(
      "instagram",
      res.status,
      `RapidAPI Instagram сұранысы сәтсіз аяқталды (HTTP ${res.status}). Host/endpoint пішімі жазылған RapidAPI өніміңізбен сәйкес пе, тексеріңіз.`,
    );
  }

  return res.json() as Promise<Record<string, unknown>>;
}

// --- Response mapping ---------------------------------------------------
// ADAPT THIS to your subscribed RapidAPI product's actual response shape.
// Verify field names live in the RapidAPI "Playground" tab for your product,
// then adjust the two map* functions below. This sandbox's network egress
// blocks rapidapi.com, so this mapping targets the widely-used shape but is
// NOT verified against a live response — check it against your first real
// call before trusting the numbers.

function mapProfile(raw: Record<string, unknown>): Omit<NormalizedProfile, "videos" | "platform"> {
  const data = (raw.data ?? raw.user ?? raw) as Record<string, unknown>;
  return {
    username: String(data.username ?? data.username_or_id ?? ""),
    displayName: String(data.full_name ?? data.fullName ?? data.username ?? ""),
    avatarUrl: (data.profile_pic_url ?? data.profile_pic_url_hd ?? null) as string | null,
    bio: String(data.biography ?? data.bio ?? ""),
    followers: Number(data.follower_count ?? data.followers ?? 0),
  };
}

function mapVideos(raw: Record<string, unknown>): NormalizedVideo[] {
  const items = (raw.data ?? raw.items ?? raw.reels ?? []) as Record<string, unknown>[];
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const media = (item.media ?? item) as Record<string, unknown>;
    const caption = media.caption as Record<string, unknown> | string | undefined;
    const captionText =
      typeof caption === "string" ? caption : String((caption as Record<string, unknown>)?.text ?? "");
    const takenAt = media.taken_at ?? media.taken_at_timestamp;

    return {
      externalId: String(media.id ?? media.pk ?? media.code ?? crypto.randomUUID()),
      url: media.code ? `https://www.instagram.com/reel/${media.code}/` : null,
      thumbnailUrl: (media.thumbnail_url ?? media.display_url ?? null) as string | null,
      caption: captionText,
      views: Number(media.play_count ?? media.view_count ?? media.ig_play_count ?? 0),
      likes: Number(media.like_count ?? 0),
      comments: Number(media.comment_count ?? 0),
      postedAt: takenAt ? new Date(Number(takenAt) * 1000).toISOString() : null,
    };
  });
}

export const rapidapiInstagramProvider: SocialProvider = {
  platform: "instagram",
  async fetchProfile(username) {
    const [profileRaw, reelsRaw] = await Promise.all([
      rapidGet(`/v1/info?username_or_id_or_url=${encodeURIComponent(username)}`),
      rapidGet(`/v1/reels?username_or_id_or_url=${encodeURIComponent(username)}&count=24`),
    ]);

    const profile = mapProfile(profileRaw);
    const videos = mapVideos(reelsRaw);

    return { platform: "instagram", ...profile, videos } satisfies NormalizedProfile;
  },
};
