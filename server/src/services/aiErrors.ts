// Split out from AIGenerationService.ts on purpose: tests reload that module
// fresh (cache-busted import) to re-read ANTHROPIC_API_KEY after toggling
// it, which would otherwise mint a new, `instanceof`-incompatible copy of
// these classes on every reload. Keeping them in a module that's never
// cache-busted keeps `instanceof` checks (here and in routes/studio.ts)
// working against a single stable class identity, same as providers/errors.ts.

/** ANTHROPIC_API_KEY isn't set — not a bug, not a request failure. */
export class AiNotConfiguredError extends Error {
  code = "AI_NOT_CONFIGURED" as const;
  status = 503;
  constructor() {
    super("AI генерациясы теңшелмеген: ANTHROPIC_API_KEY env var орнатылмаған.");
    this.name = "AiNotConfiguredError";
  }
}

/** The HTTP call to Anthropic itself failed or returned non-2xx. */
export class AiRequestError extends Error {
  code = "AI_REQUEST_FAILED" as const;
  status = 502;
  constructor(public httpStatus: number, detail?: string) {
    super(`AI провайдерінен сұраныс сәтсіз аяқталды (HTTP ${httpStatus})${detail ? `: ${detail}` : ""}.`);
    this.name = "AiRequestError";
  }
}

/** The call succeeded but the tool_use payload didn't match the expected shape — never guessed/filled in. */
export class AiResponseError extends Error {
  code = "AI_RESPONSE_INVALID" as const;
  status = 502;
  constructor(detail: string) {
    super(`AI жауабы күтілген форматта келмеді: ${detail}`);
    this.name = "AiResponseError";
  }
}
