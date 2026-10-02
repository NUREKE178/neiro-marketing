// AI Content Studio's text-generation backend. Calls the official Anthropic
// Messages API directly over fetch (no SDK dependency, same pattern as
// providers/httpClient.ts) — this is a first-party, officially documented
// API, not a scraper, so it needs no "partially verified" caveat the way
// RapidAPI data does. Like every other integration in this app: missing
// credentials throw a typed "not configured" error, never a silent fake
// result.
import { AiNotConfiguredError, AiRequestError, AiResponseError } from "./aiErrors.js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? "claude-sonnet-5-5";
const ANTHROPIC_VERSION = "2023-06-01";

export { AiNotConfiguredError, AiRequestError, AiResponseError };

export function isAiConfigured(): boolean {
  return Boolean(ANTHROPIC_API_KEY);
}

export interface ContentIdea {
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
}

export interface VideoContext {
  caption: string;
  views: number | null;
  likes: number | null;
}

export interface GenerateIdeasParams {
  platform: "instagram" | "tiktok";
  topic: string;
  /**
   * Captions + metrics from the owner's own connected account's videos —
   * grounds generation in what has actually worked for THIS creator rather
   * than generic advice. Optional: generation still works from a bare topic
   * with no connected account.
   */
  context?: VideoContext[];
}

const IDEAS_TOOL = {
  name: "submit_content_ideas",
  description: "Submit exactly 3 generated short-form video content ideas.",
  input_schema: {
    type: "object" as const,
    properties: {
      ideas: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            hook: { type: "string", description: "The opening line / first 3 seconds that stops the scroll." },
            script: { type: "string", description: "A short scene-by-scene script or outline for the full video." },
            caption: { type: "string", description: "The post caption text, ready to publish." },
            hashtags: {
              type: "array",
              items: { type: "string" },
              description: "5-8 relevant hashtags, no leading # character.",
            },
          },
          required: ["hook", "script", "caption", "hashtags"],
        },
      },
    },
    required: ["ideas"],
  },
};

function buildContextBlock(context: VideoContext[] | undefined): string {
  if (!context || context.length === 0) return "";
  const lines = context
    .slice(0, 10)
    .map((v, i) => {
      const caption = v.caption.trim().slice(0, 200) || "(caption жоқ)";
      const views = v.views ?? "белгісіз";
      const likes = v.likes ?? "белгісіз";
      return `${i + 1}. "${caption}" — views: ${views}, likes: ${likes}`;
    })
    .join("\n");
  return `\n\nБұл креатордың нақты бұрынғы постары (не жұмыс істеп, не істемегенін бағалау үшін контекст ретінде ғана — тікелей көшірме жасама):\n${lines}`;
}

/**
 * Generates exactly 3 content ideas via Claude's tool-use (forced JSON
 * output). Throws AiNotConfiguredError / AiRequestError / AiResponseError —
 * never returns a partially-filled or guessed idea.
 */
export async function generateContentIdeas(
  params: GenerateIdeasParams,
): Promise<{ ideas: ContentIdea[]; model: string }> {
  if (!ANTHROPIC_API_KEY) throw new AiNotConfiguredError();

  const platformLabel = params.platform === "instagram" ? "Instagram Reels" : "TikTok";
  const contextBlock = buildContextBlock(params.context);

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 2048,
        tools: [IDEAS_TOOL],
        tool_choice: { type: "tool", name: IDEAS_TOOL.name },
        messages: [
          {
            role: "user",
            content: `Сен ${platformLabel} үшін контент-продюсер көмекшісісің. Ниша/тақырып: "${params.topic}". Дәл осы тақырыпқа 3 түрлі, нақты түсіріп орындалатын қысқа видео идеясын ұсын: әрқайсысына hook, толық script, caption, hashtags керек.${contextBlock}`,
          },
        ],
      }),
    });
  } catch (err) {
    throw new AiRequestError(0, err instanceof Error ? err.message : "network error");
  }

  if (!res.ok) {
    let detail: string | undefined;
    try {
      detail = await res.text();
    } catch {
      // best-effort only
    }
    throw new AiRequestError(res.status, detail?.slice(0, 300));
  }

  let body: { content?: { type: string; input?: unknown }[] };
  try {
    body = (await res.json()) as typeof body;
  } catch {
    throw new AiResponseError("жауап JSON емес");
  }

  const toolUse = body.content?.find((block) => block.type === "tool_use") as
    | { type: "tool_use"; input?: { ideas?: unknown } }
    | undefined;
  const ideasRaw = toolUse?.input?.ideas;

  if (!Array.isArray(ideasRaw) || ideasRaw.length === 0) {
    throw new AiResponseError("tool_use ішінде 'ideas' массиві табылмады");
  }

  const ideas: ContentIdea[] = ideasRaw.map((raw, i) => {
    const idea = (raw ?? {}) as Record<string, unknown>;
    if (typeof idea.hook !== "string" || typeof idea.script !== "string" || typeof idea.caption !== "string") {
      throw new AiResponseError(`ideas[${i}] міндетті өрістерсіз келді (hook/script/caption)`);
    }
    return {
      hook: idea.hook,
      script: idea.script,
      caption: idea.caption,
      hashtags: Array.isArray(idea.hashtags)
        ? idea.hashtags.filter((h): h is string => typeof h === "string")
        : [],
    };
  });

  return { ideas, model: AI_MODEL };
}
