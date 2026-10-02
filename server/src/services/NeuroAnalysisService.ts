// Turns aggregated facial-reaction scores (0..1, FACS-grounded engagement
// proxies — never a clinical emotion diagnosis) into a written verdict via
// the official Anthropic Messages API. Pure function over its input: no DB
// access here, so it's fully testable with mocked fetch — the caller
// (routes/tests.ts) is responsible for aggregating reactions first.
import { AiNotConfiguredError, AiRequestError, AiResponseError } from "./aiErrors.js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? "claude-sonnet-5-5";
const ANTHROPIC_VERSION = "2023-06-01";

export { AiNotConfiguredError, AiRequestError, AiResponseError };

export function isAiConfigured(): boolean {
  return Boolean(ANTHROPIC_API_KEY);
}

export interface CreativeSummary {
  label: string;
  caption: string;
  sessionCount: number;
  avgSmile: number | null;
  avgBrowFurrow: number | null;
  avgSurprise: number | null;
  avgAttention: number | null;
  /** Precomputed by the caller (e.g. "ең жоғары brow_furrow 4-ші секундта") — keeps this module a pure "describe these numbers" function. */
  peakMoments: string[];
}

export interface AnalyzeReactionsParams {
  testTitle: string;
  testGoal: string;
  creatives: CreativeSummary[];
}

export interface NeuroVerdict {
  winnerLabel: string | null;
  summary: string;
  perCreativeNotes: { label: string; note: string }[];
  suggestion: string;
}

const VERDICT_TOOL = {
  name: "submit_neuro_verdict",
  description: "Submit the analysis of a facial-reaction ad creative test.",
  input_schema: {
    type: "object" as const,
    properties: {
      winnerLabel: {
        type: ["string", "null"],
        description:
          "The label of the creative with the strongest positive engagement, or null if the data doesn't support picking one yet.",
      },
      summary: { type: "string", description: "2-3 sentence overall verdict, in Kazakh." },
      perCreativeNotes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            note: { type: "string", description: "What the reaction data shows for this specific creative." },
          },
          required: ["label", "note"],
        },
      },
      suggestion: {
        type: "string",
        description: "One concrete, actionable suggestion to improve the weaker creative.",
      },
    },
    required: ["winnerLabel", "summary", "perCreativeNotes", "suggestion"],
  },
};

function describeScore(value: number | null): string {
  return value === null ? "деректер жоқ" : value.toFixed(2);
}

function buildPrompt(params: AnalyzeReactionsParams): string {
  const lines = params.creatives.map((c) => {
    const parts = [
      `- "${c.label}" (caption: "${c.caption || "жоқ"}"): ${c.sessionCount} көрермен.`,
      `  smile=${describeScore(c.avgSmile)}, brow_furrow=${describeScore(c.avgBrowFurrow)}, surprise=${describeScore(c.avgSurprise)}, attention=${describeScore(c.avgAttention)}`,
    ];
    if (c.peakMoments.length > 0) parts.push(`  ${c.peakMoments.join("; ")}`);
    return parts.join("\n");
  });

  return `Сен нейромаркетинг аналитигісің. Төменде жарнама креативтерін көрермендер камера арқылы қарағанда жиналған бет-экспрессия сигналдары бар (smile/brow_furrow/surprise/attention, 0-1 аралығында, FACS негізіндегі proxy — клиникалық эмоция диагностикасы емес, зейін/оң-теріс реакция белгісі ғана).

Тест: "${params.testTitle}" (мақсат: "${params.testGoal || "көрсетілмеген"}")

${lines.join("\n")}

Осы деректер негізінде қай креатив жақсы жұмыс істегенін және неліктен бағала, әр креативке қысқа түсініктеме бер, әлсіз креативті жақсарту үшін нақты бір ұсыныс жаса. Деректер аз болса (мыс. 1-2 көрермен), сақ болып, "алдын-ала" деп ескерт.`;
}

export async function analyzeReactions(
  params: AnalyzeReactionsParams,
): Promise<{ verdict: NeuroVerdict; model: string }> {
  if (!ANTHROPIC_API_KEY) throw new AiNotConfiguredError();

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
        max_tokens: 1500,
        tools: [VERDICT_TOOL],
        tool_choice: { type: "tool", name: VERDICT_TOOL.name },
        messages: [{ role: "user", content: buildPrompt(params) }],
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
    | { type: "tool_use"; input?: Record<string, unknown> }
    | undefined;
  const input = toolUse?.input;

  if (
    !input ||
    typeof input.summary !== "string" ||
    typeof input.suggestion !== "string" ||
    !Array.isArray(input.perCreativeNotes)
  ) {
    throw new AiResponseError("tool_use ішінде күтілген өрістер табылмады");
  }

  const perCreativeNotes = input.perCreativeNotes.map((raw, i) => {
    const note = (raw ?? {}) as Record<string, unknown>;
    if (typeof note.label !== "string" || typeof note.note !== "string") {
      throw new AiResponseError(`perCreativeNotes[${i}] міндетті өрістерсіз келді`);
    }
    return { label: note.label, note: note.note };
  });

  return {
    verdict: {
      winnerLabel: typeof input.winnerLabel === "string" ? input.winnerLabel : null,
      summary: input.summary,
      perCreativeNotes,
      suggestion: input.suggestion,
    },
    model: AI_MODEL,
  };
}
