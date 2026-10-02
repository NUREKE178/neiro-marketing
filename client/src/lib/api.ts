export interface Test {
  id: string;
  owner_id: string;
  title: string;
  goal: string;
  status: "draft" | "active" | "closed";
  last_analysis_json: string | null;
  last_analyzed_at: string | null;
  created_at: string;
}

export interface Creative {
  id: string;
  test_id: string;
  label: string;
  image_url: string;
  caption: string;
  display_order: number;
  created_at: string;
}

export interface ViewerSession {
  id: string;
  test_id: string;
  started_at: string;
  completed_at: string | null;
  user_agent: string;
}

export interface ReactionSample {
  tMs: number;
  smile: number | null;
  browFurrow: number | null;
  surprise: number | null;
  attention: number | null;
}

export interface CreativeAggregate {
  creative_id: string;
  session_count: number;
  sample_count: number;
  avg_smile: number | null;
  avg_brow_furrow: number | null;
  avg_surprise: number | null;
  avg_attention: number | null;
}

export interface TimeBucket {
  creative_id: string;
  bucket_ms: number;
  avg_smile: number | null;
  avg_brow_furrow: number | null;
  avg_attention: number | null;
}

export interface NeuroVerdict {
  winnerLabel: string | null;
  summary: string;
  perCreativeNotes: { label: string; note: string }[];
  suggestion: string;
}

class ApiError extends Error {
  code?: string;
  status?: number;
  detail?: string;

  constructor(message: string, code?: string, status?: number, detail?: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

// Web build (Vercel): relative "/api" hits the same-origin serverless
// function — leave unset. Native builds (Android/Windows) have no origin of
// their own, so VITE_API_BASE_URL must point at the deployed backend, e.g.
// https://your-app.vercel.app/api (set at build time, see client/README.md).
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      body.error ?? `Сұраныс сәтсіз аяқталды (${res.status})`,
      body.code,
      res.status,
      body.detail,
    );
  }
  return body as T;
}

export const api = {
  configStatus: () => request<{ aiConfigured: boolean }>("/config/status"),

  tests: {
    create: (title: string, goal: string) =>
      request<{ test: Test }>("/tests", { method: "POST", body: JSON.stringify({ title, goal }) }),
    list: () => request<{ tests: Test[] }>("/tests"),
    get: (id: string) => request<{ test: Test; creatives: Creative[] }>(`/tests/${id}`),
    update: (id: string, patch: Partial<{ title: string; goal: string; status: Test["status"] }>) =>
      request<{ test: Test }>(`/tests/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    remove: (id: string) => request<{ ok: true }>(`/tests/${id}`, { method: "DELETE" }),

    addCreative: (testId: string, label: string, imageUrl: string, caption: string) =>
      request<{ creative: Creative }>(`/tests/${testId}/creatives`, {
        method: "POST",
        body: JSON.stringify({ label, imageUrl, caption }),
      }),
    removeCreative: (testId: string, creativeId: string) =>
      request<{ ok: true }>(`/tests/${testId}/creatives/${creativeId}`, { method: "DELETE" }),

    startSession: (testId: string) =>
      request<{ session: ViewerSession }>(`/tests/${testId}/sessions`, { method: "POST" }),
    sendReactions: (testId: string, sessionId: string, creativeId: string, samples: ReactionSample[]) =>
      request<{ ok: true }>(`/tests/${testId}/sessions/${sessionId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ creativeId, samples }),
      }),
    completeSession: (testId: string, sessionId: string) =>
      request<{ ok: true }>(`/tests/${testId}/sessions/${sessionId}/complete`, { method: "POST" }),

    results: (testId: string) =>
      request<{ creatives: Creative[]; aggregates: CreativeAggregate[]; timeBuckets: TimeBucket[] }>(
        `/tests/${testId}/results`,
      ),
    analyze: (testId: string) =>
      request<{ verdict: NeuroVerdict; model: string }>(`/tests/${testId}/analyze`, { method: "POST" }),
  },
};

export { ApiError };
