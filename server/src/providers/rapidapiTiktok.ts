import {
  NormalizedProfile,
  NormalizedVideo,
  ProviderNotConfiguredError,
  ProviderRequestError,
  SocialProvider,
} from "./types.js";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
// Default targets the common TikTok scraper shape used by many RapidAPI
// vendors ("unique_id" param, itemList[].stats.{playCount,diggCount}) which
// mirrors TikTok's own internal web API. Override via env if your subscribed
// product differs — see server/README.md.
const HOST = process.env.RAPIDAPI_TIKTOK_HOST ?? "tiktok-scraper7.p.rapidapi.com";

async function rapidGet(pathAndQuery: string) {
  if (!RAPIDAPI_KEY) throw new ProviderNotConfiguredError("tiktok");

  const res = await fetch(`https://${HOST}${pathAndQuery}`, {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": HOST,
    },
  });

  if (!res.ok) {
    throw new ProviderRequestError(
      "tiktok",
      res.status,
      `RapidAPI TikTok сұранысы сәтсіз аяқталды (HTTP ${res.status}). Host/endpoint пішімі жазылған RapidAPI өніміңізбен сәйкес пе, тексеріңіз.`,
    );
  }

  return res.json() as Promise<Record<string, unknown>>;
}

// --- Response mapping ---------------------------------------------------
// ADAPT THIS to your subscribed RapidAPI product's actual response shape —
// see the same note in rapidapiInstagram.ts. Not verified against a live
// response from this sandbox (rapidapi.com is unreachable here).

function mapProfile(raw: Record<string, unknown>): Omit<NormalizedProfile, "videos" | "platform"> {
  const data = (raw.data ?? raw) as Record<string, unknown>;
  const user = (data.user ?? data) as Record<string, unknown>;
  const stats = (data.stats ?? user.stats ?? {}) as Record<string, unknown>;

  return {
    username: String(user.uniqueId ?? user.unique_id ?? ""),
    displayName: String(user.nickname ?? user.uniqueId ?? ""),
    avatarUrl: (user.avatarLarger ?? user.avatarMedium ?? null) as string | null,
    bio: String(user.signature ?? ""),
    followers: Number(stats.followerCount ?? user.followerCount ?? 0),
  };
}

function mapVideos(raw: Record<string, unknown>): NormalizedVideo[] {
  const data = (raw.data ?? raw) as Record<string, unknown>;
  const items = (data.videos ?? data.itemList ?? []) as Record<string, unknown>[];
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const stats = (item.stats ?? item.statistics ?? item) as Record<string, unknown>;
    const cover = (item.video as Record<string, unknown> | undefined)?.cover ?? item.cover;
    const createTime = item.createTime ?? item.create_time;
    const id = String(item.id ?? item.video_id ?? item.aweme_id ?? crypto.randomUUID());
    const author = (item.author as Record<string, unknown> | undefined)?.uniqueId as
      | string
      | undefined;

    return {
      externalId: id,
      url: author ? `https://www.tiktok.com/@${author}/video/${id}` : null,
      thumbnailUrl: (cover ?? null) as string | null,
      caption: String(item.desc ?? item.title ?? ""),
      views: Number(stats.playCount ?? stats.play_count ?? 0),
      likes: Number(stats.diggCount ?? stats.digg_count ?? 0),
      comments: Number(stats.commentCount ?? stats.comment_count ?? 0),
      postedAt: createTime ? new Date(Number(createTime) * 1000).toISOString() : null,
    };
  });
}

export const rapidapiTiktokProvider: SocialProvider = {
  platform: "tiktok",
  async fetchProfile(username) {
    const [profileRaw, postsRaw] = await Promise.all([
      rapidGet(`/user/info?unique_id=${encodeURIComponent(username)}`),
      rapidGet(`/user/posts?unique_id=${encodeURIComponent(username)}&count=24&cursor=0`),
    ]);

    const profile = mapProfile(profileRaw);
    const videos = mapVideos(postsRaw);

    return { platform: "tiktok", ...profile, videos } satisfies NormalizedProfile;
  },
};
