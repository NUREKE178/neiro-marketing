import { Router } from "express";
import { Platform } from "../providers/types.js";
import { getOrCreateOwnerId, isSessionConfigured } from "../services/sessionCookie.js";
import { generateContentIdeas } from "../services/AIGenerationService.js";
import { AiNotConfiguredError, AiRequestError, AiResponseError } from "../services/aiErrors.js";
import {
  ContentDraftRecord,
  createDraft,
  deleteDraft,
  getConnection,
  getCreator,
  getDraft,
  getVideosForCreator,
  listDrafts,
  updateDraft,
} from "../store.js";

export const studioRouter = Router();

function isPlatform(value: unknown): value is Platform {
  return value === "instagram" || value === "tiktok";
}

/** 503 "session not configured" short-circuit shared by every route below — Studio drafts only make sense scoped to a browser session. */
function requireOwnerId(req: Parameters<typeof getOrCreateOwnerId>[0], res: Parameters<typeof getOrCreateOwnerId>[1]): string | null {
  if (!isSessionConfigured()) {
    res.status(503).json({ error: "session теңшелмеген (SESSION_SECRET жоқ)", code: "SESSION_NOT_CONFIGURED" });
    return null;
  }
  const ownerId = getOrCreateOwnerId(req, res);
  if (!ownerId) {
    res.status(503).json({ error: "session теңшелмеген", code: "SESSION_NOT_CONFIGURED" });
    return null;
  }
  return ownerId;
}

studioRouter.post("/generate", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;

    const { platform, topic, useOwnData } = req.body as {
      platform?: string;
      topic?: string;
      useOwnData?: boolean;
    };
    if (!isPlatform(platform)) return res.status(400).json({ error: "platform 'instagram' немесе 'tiktok' болуы керек" });
    if (!topic || !topic.trim()) return res.status(400).json({ error: "topic (ниша/тақырып) керек" });

    let context: { caption: string; views: number | null; likes: number | null }[] | undefined;
    if (useOwnData) {
      const connection = await getConnection(ownerId, platform);
      if (connection) {
        const creator = await getCreator(platform, connection.username);
        if (creator) {
          const videos = await getVideosForCreator(creator.id);
          context = videos.slice(0, 10).map((v) => ({ caption: v.caption, views: v.views, likes: v.likes }));
        }
      }
    }

    const { ideas, model } = await generateContentIdeas({ platform, topic: topic.trim(), context });
    res.json({ ideas, model, groundedOnOwnData: Boolean(context && context.length > 0) });
  } catch (err) {
    if (err instanceof AiNotConfiguredError || err instanceof AiRequestError || err instanceof AiResponseError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

studioRouter.get("/drafts", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    const drafts = await listDrafts(ownerId);
    res.json({ drafts: drafts.map(serializeDraft) });
  } catch (err) {
    next(err);
  }
});

studioRouter.post("/drafts", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;

    const { platform, creatorId, topic, hook, script, caption, hashtags, aiModel } = req.body as {
      platform?: string;
      creatorId?: string | null;
      topic?: string;
      hook?: string;
      script?: string;
      caption?: string;
      hashtags?: string[];
      aiModel?: string | null;
    };
    if (!isPlatform(platform)) return res.status(400).json({ error: "platform 'instagram' немесе 'tiktok' болуы керек" });

    const draft = await createDraft({
      ownerId,
      platform,
      creatorId: creatorId ?? null,
      topic: topic ?? "",
      hook: hook ?? "",
      script: script ?? "",
      caption: caption ?? "",
      hashtags: Array.isArray(hashtags) ? hashtags : [],
      aiModel: aiModel ?? null,
    });
    res.status(201).json({ draft: serializeDraft(draft) });
  } catch (err) {
    next(err);
  }
});

studioRouter.patch("/drafts/:id", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;

    const existing = await getDraft(req.params.id, ownerId);
    if (!existing) return res.status(404).json({ error: "жоба табылмады", code: "DRAFT_NOT_FOUND" });

    const { topic, hook, script, caption, hashtags, status, scheduledAt, linkedVideoId } = req.body as {
      topic?: string;
      hook?: string;
      script?: string;
      caption?: string;
      hashtags?: string[];
      status?: ContentDraftRecord["status"];
      scheduledAt?: string | null;
      linkedVideoId?: string | null;
    };

    const draft = await updateDraft(req.params.id, ownerId, {
      topic,
      hook,
      script,
      caption,
      hashtags,
      status,
      scheduledAt,
      linkedVideoId,
    });
    res.json({ draft: draft ? serializeDraft(draft) : null });
  } catch (err) {
    next(err);
  }
});

studioRouter.delete("/drafts/:id", async (req, res, next) => {
  try {
    const ownerId = requireOwnerId(req, res);
    if (!ownerId) return;
    await deleteDraft(req.params.id, ownerId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

function serializeDraft(d: ContentDraftRecord) {
  return { ...d, hashtags: JSON.parse(d.hashtags || "[]") as string[] };
}
