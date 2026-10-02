import { Platform } from "./types.js";

/** Credentials (API key, OAuth app) simply aren't set — not a bug, not a provider failure. */
export class ProviderNotConfiguredError extends Error {
  code = "PROVIDER_NOT_CONFIGURED" as const;
  status = 503;
  constructor(platform: Platform, detail?: string) {
    super(
      `${platform} деректер провайдері теңшелмеген${detail ? `: ${detail}` : ""}.`,
    );
    this.name = "ProviderNotConfiguredError";
  }
}

/** Provider returned 401/403 — our credentials are invalid, revoked, or lack the needed scope. */
export class ProviderAuthError extends Error {
  code = "PROVIDER_AUTH_ERROR" as const;
  status = 401;
  constructor(
    public platform: Platform,
    public httpStatus: number,
    detail?: string,
  ) {
    super(`${platform} провайдері авторизацияны қабылдамады (HTTP ${httpStatus})${detail ? `: ${detail}` : ""}.`);
    this.name = "ProviderAuthError";
  }
}

/** Provider returned 429 — we're being rate-limited, this is not a data problem. */
export class ProviderRateLimitError extends Error {
  code = "PROVIDER_RATE_LIMITED" as const;
  status = 429;
  constructor(public platform: Platform, public retryAfter?: string) {
    super(`${platform} провайдері сұраныс шегінен асты (429)${retryAfter ? ` — ${retryAfter} секундтан кейін қайталаңыз` : ""}.`);
    this.name = "ProviderRateLimitError";
  }
}

/** Provider returned 5xx — their server is failing, not ours. */
export class ProviderServerError extends Error {
  code = "PROVIDER_SERVER_ERROR" as const;
  status = 502;
  constructor(public platform: Platform, public httpStatus: number) {
    super(`${platform} провайдерінің сервері қате қайтарды (HTTP ${httpStatus}).`);
    this.name = "ProviderServerError";
  }
}

/** Any other non-2xx we didn't specifically classify. */
export class ProviderRequestError extends Error {
  code = "PROVIDER_REQUEST_FAILED" as const;
  status = 502;
  constructor(public platform: Platform, public httpStatus: number, detail?: string) {
    super(`${platform} провайдерінен сұраныс сәтсіз аяқталды (HTTP ${httpStatus})${detail ? `: ${detail}` : ""}.`);
    this.name = "ProviderRequestError";
  }
}

/**
 * The HTTP call succeeded (2xx) but the JSON shape didn't match what the
 * mapping code expects — a required field is missing or of the wrong type.
 * This must NEVER be silently coerced to 0/empty; it means the provider
 * changed their response shape (or our mapping was wrong to begin with) and
 * needs a human to look at the raw response again.
 */
export class SchemaMappingError extends Error {
  code = "SCHEMA_MAPPING_ERROR" as const;
  status = 502;
  constructor(public platform: Platform, public field: string, detail?: string) {
    super(`${platform} жауабында "${field}" өрісі күтілгендей келмеді${detail ? `: ${detail}` : ""}. Response mapping-ті тексеру керек.`);
    this.name = "SchemaMappingError";
  }
}

/** Account genuinely doesn't exist / isn't public, as distinct from a request failure. */
export class AccountNotFoundError extends Error {
  code = "ACCOUNT_NOT_FOUND" as const;
  status = 404;
  constructor(public platform: Platform, public username: string) {
    super(`@${username} (${platform}) табылмады — аккаунт жоқ немесе жабық.`);
    this.name = "AccountNotFoundError";
  }
}
