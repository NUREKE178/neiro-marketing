import { NormalizedProfile, NormalizedVideo, SocialProvider, extractUsername as extractUsernameBase } from "../types.js";
import { AccountNotFoundError, ProviderNotConfiguredError, SchemaMappingError } from "../errors.js";
import { fetchProviderJson, numOrNull, readPath } from "../httpClient.js";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
// Defaults target the common TikTok scraper shape ("unique_id" param,
// itemList[].stats.{playCount,diggCount}) mirroring TikTok's own internal
// web API. Override via env if your subscribed product differs — see
// server/README.md.
const HOST = process.env.RAPIDAPI_TIKTOK_HOST ?? "tiktok-scraper7.p.rapidapi.com";
const PROFILE_PATH = process.env.RAPIDAPI_TIKTOK_PROFILE_PATH ?? "/user/info";
const POSTS_PATH = process.env.RAPIDAPI_TIKTOK_POSTS_PATH ?? "/user/posts";
const USERNAME_PARAM = process.env.RAPIDAPI_TIKTOK_USERNAME_PARAM ?? "unique_id";

async function call(path: string, params: Record<string, string>) {
  if (!RAPIDAPI_KEY) {
    throw new ProviderNotConfiguredError(
      "tiktok",
      "RAPIDAPI_KEY (және RAPIDAPI_TIKTOK_HOST сәйкес пе) .env/Vercel env vars ішінде жоқ",
    );
  }
  const qs = new URLSearchParams(params).toString();
  return fetchProviderJson("tiktok", `https://${HOST}${path}?${qs}`, {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": HOST,
  });
}

// --- Response mapping — see the same note in instagram/rapidapi.ts -------

const USERNAME_FIELDS = ["user.uniqueId", "user.unique_id", "uniqueId", "unique_id"];
const NICKNAME_FIELDS = ["user.nickname", "nickname"];
const AVATAR_FIELDS = ["user.avatarLarger", "user.avatarMedium", "avatarLarger"];
const SIGNATURE_FIELDS = ["user.signature", "signature"];
const FOLLOWER_FIELDS = ["stats.followerCount", "user.followerCount", "stats.follower_count"];
const NOT_FOUND_SIGNALS = ["error", "message", "detail"];

function firstDefined(obj: Record<string, unknown>, paths: string[]): unknown {
  for (const p of paths) {
    const v = readPath(obj, p);
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

function mapProfile(
  raw: Record<string, unknown>,
  username: string,
): Omit<NormalizedProfile, "videos" | "platform" | "source" | "retrievedAt"> {
  const data = (raw.data ?? raw) as Record<string, unknown>;
  const foundUsername = firstDefined(data, USERNAME_FIELDS);

  if (foundUsername === undefined) {
    const notFoundText = NOT_FOUND_SIGNALS.map((f) => readPath(raw, f)).find((v) => typeof v === "string") as
      | string
      | undefined;
    if (notFoundText && /not.?found|does.?not.?exist|no.?user/i.test(notFoundText)) {
      throw new AccountNotFoundError("tiktok", username);
    }
    throw new SchemaMappingError(
      "tiktok",
      USERNAME_FIELDS.join(" | "),
      "profile response has none of the expected username fields — check RAPIDAPI_TIKTOK_PROFILE_PATH mapping",
    );
  }

  return {
    username: String(foundUsername),
    displayName: String(firstDefined(data, NICKNAME_FIELDS) ?? foundUsername),
    avatarUrl: (firstDefined(data, AVATAR_FIELDS) as string | undefined) ?? null,
    bio: String(firstDefined(data, SIGNATURE_FIELDS) ?? ""),
    followers: numOrNull(firstDefined(data, FOLLOWER_FIELDS)),
  };
}

function mapVideos(raw: Record<string, unknown>): NormalizedVideo[] {
  const data = (raw.data ?? raw) as Record<string, unknown>;
  const items = (data.videos ?? data.itemList ?? []) as unknown;
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const record = item as Record<string, unknown>;
    const stats = (record.stats ?? record.statistics ?? record) as Record<string, unknown>;
    const cover = (record.video as Record<string, unknown> | undefined)?.cover ?? record.cover;
    const createTime = record.createTime ?? record.create_time;
    const id = String(record.id ?? record.video_id ?? record.aweme_id ?? crypto.randomUUID());
    const author = (record.author as Record<string, unknown> | undefined)?.uniqueId as string | undefined;

    return {
      externalId: id,
      url: author ? `https://www.tiktok.com/@${author}/video/${id}` : null,
      thumbnailUrl: (cover ?? null) as string | null,
      caption: String(record.desc ?? record.title ?? ""),
      views: numOrNull(stats.playCount ?? stats.play_count),
      likes: numOrNull(stats.diggCount ?? stats.digg_count),
      comments: numOrNull(stats.commentCount ?? stats.comment_count),
      postedAt: createTime ? new Date(Number(createTime) * 1000).toISOString() : null,
    };
  });
}

export const rapidapiTiktokProvider: SocialProvider = {
  platform: "tiktok",
  source: "rapidapi_tiktok",
  async fetchProfile(username) {
    const [profileRaw, postsRaw] = await Promise.all([
      call(PROFILE_PATH, { [USERNAME_PARAM]: username }),
      call(POSTS_PATH, { [USERNAME_PARAM]: username, count: "24", cursor: "0" }),
    ]);

    const profile = mapProfile(profileRaw, username);
    const videos = mapVideos(postsRaw);

    return {
      platform: "tiktok",
      source: "rapidapi_tiktok",
      retrievedAt: new Date().toISOString(),
      ...profile,
      videos,
    } satisfies NormalizedProfile;
  },
};

export const extractTiktokUsername = (raw: string) => extractUsernameBase("tiktok", raw);
