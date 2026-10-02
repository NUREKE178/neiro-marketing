import {
  NormalizedProfile,
  NormalizedVideo,
  SocialProvider,
  extractUsername as extractUsernameBase,
} from "../types.js";
import { AccountNotFoundError, ProviderNotConfiguredError, SchemaMappingError } from "../errors.js";
import { fetchProviderJson, numOrNull, readPath } from "../httpClient.js";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
// Defaults target the common "v1/info" + "v1/reels" shape several RapidAPI
// Instagram scraper vendors ship. If your subscribed product uses different
// paths/params (confirmed to happen — vendors vary a lot), override via env
// instead of editing code: see server/README.md.
const HOST = process.env.RAPIDAPI_INSTAGRAM_HOST ?? "instagram-scraper-stable-api.p.rapidapi.com";
const PROFILE_PATH = process.env.RAPIDAPI_INSTAGRAM_PROFILE_PATH ?? "/v1/info";
const POSTS_PATH = process.env.RAPIDAPI_INSTAGRAM_POSTS_PATH ?? "/v1/reels";
const USERNAME_PARAM = process.env.RAPIDAPI_INSTAGRAM_USERNAME_PARAM ?? "username_or_id_or_url";

async function call(path: string, params: Record<string, string>) {
  if (!RAPIDAPI_KEY) {
    throw new ProviderNotConfiguredError(
      "instagram",
      "RAPIDAPI_KEY (және RAPIDAPI_INSTAGRAM_HOST сәйкес пе) .env/Vercel env vars ішінде жоқ",
    );
  }
  const qs = new URLSearchParams(params).toString();
  return fetchProviderJson("instagram", `https://${HOST}${path}?${qs}`, {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": HOST,
  });
}

// --- Response mapping ---------------------------------------------------
// ADAPT THIS to your subscribed RapidAPI product's actual response shape —
// verify live in the RapidAPI Playground, then adjust the candidate paths
// below (first match wins). This sandbox cannot reach rapidapi.com to
// verify live, so these candidates are best-effort, not confirmed.

const PROFILE_CANDIDATES = ["data", "user", ""]; // "" = root
const USERNAME_FIELDS = ["username", "username_or_id", "user.username"];
const FULLNAME_FIELDS = ["full_name", "fullName", "user.full_name"];
const AVATAR_FIELDS = ["profile_pic_url", "profile_pic_url_hd", "user.profile_pic_url"];
const BIO_FIELDS = ["biography", "bio", "user.biography"];
const FOLLOWER_FIELDS = ["follower_count", "followers", "edge_followed_by.count", "user.follower_count"];
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
  let data: Record<string, unknown> = raw;
  for (const candidate of PROFILE_CANDIDATES) {
    const v = candidate ? readPath(raw, candidate) : raw;
    if (v && typeof v === "object" && Object.keys(v).length > 0) {
      data = v as Record<string, unknown>;
      break;
    }
  }

  const foundUsername = firstDefined(data, USERNAME_FIELDS);

  if (foundUsername === undefined) {
    const notFoundText = NOT_FOUND_SIGNALS.map((f) => readPath(raw, f)).find((v) => typeof v === "string") as
      | string
      | undefined;
    if (notFoundText && /not.?found|does.?not.?exist|no.?user/i.test(notFoundText)) {
      throw new AccountNotFoundError("instagram", username);
    }
    throw new SchemaMappingError(
      "instagram",
      USERNAME_FIELDS.join(" | "),
      "profile response has none of the expected username fields — check RAPIDAPI_INSTAGRAM_PROFILE_PATH mapping",
    );
  }

  return {
    username: String(foundUsername),
    displayName: String(firstDefined(data, FULLNAME_FIELDS) ?? foundUsername),
    avatarUrl: (firstDefined(data, AVATAR_FIELDS) as string | undefined) ?? null,
    bio: String(firstDefined(data, BIO_FIELDS) ?? ""),
    followers: numOrNull(firstDefined(data, FOLLOWER_FIELDS)),
  };
}

function mapVideos(raw: Record<string, unknown>): NormalizedVideo[] {
  const items = (raw.data ?? raw.items ?? raw.reels ?? raw.posts ?? []) as unknown;
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const media = (readPath(item, "media") ?? item) as Record<string, unknown>;
    const caption = media.caption as Record<string, unknown> | string | undefined;
    const captionText =
      typeof caption === "string" ? caption : String((caption as Record<string, unknown>)?.text ?? "");
    const takenAt = media.taken_at ?? media.taken_at_timestamp;
    const code = media.code as string | undefined;

    return {
      externalId: String(media.id ?? media.pk ?? code ?? crypto.randomUUID()),
      url: code ? `https://www.instagram.com/reel/${code}/` : null,
      thumbnailUrl: (media.thumbnail_url ?? media.display_url ?? null) as string | null,
      caption: captionText,
      views: numOrNull(media.play_count ?? media.view_count ?? media.ig_play_count),
      likes: numOrNull(media.like_count),
      comments: numOrNull(media.comment_count),
      postedAt: takenAt ? new Date(Number(takenAt) * 1000).toISOString() : null,
    };
  });
}

export const rapidapiInstagramProvider: SocialProvider = {
  platform: "instagram",
  source: "rapidapi_instagram",
  async fetchProfile(username) {
    const [profileRaw, postsRaw] = await Promise.all([
      call(PROFILE_PATH, { [USERNAME_PARAM]: username }),
      call(POSTS_PATH, { [USERNAME_PARAM]: username, count: "24" }),
    ]);

    const profile = mapProfile(profileRaw, username);
    const videos = mapVideos(postsRaw);

    return {
      platform: "instagram",
      source: "rapidapi_instagram",
      retrievedAt: new Date().toISOString(),
      ...profile,
      videos,
    } satisfies NormalizedProfile;
  },
};

export const extractInstagramUsername = (raw: string) => extractUsernameBase("instagram", raw);
