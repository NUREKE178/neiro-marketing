import type { Platform } from "./api";

/** Client-side mirror of the server's extractUsername — keeps analyze URLs clean (/analyze/instagram/username). */
export function extractHandle(platform: Platform, raw: string): string {
  let value = raw.trim();
  if (value.startsWith("@")) value = value.slice(1);

  try {
    if (value.includes("://") || value.startsWith("www.")) {
      const url = new URL(value.startsWith("www.") ? `https://${value}` : value);
      const parts = url.pathname.split("/").filter(Boolean);
      if (platform === "instagram") {
        value = parts[0] ?? value;
      } else {
        const at = parts.find((p) => p.startsWith("@"));
        value = (at ?? parts[0] ?? value).replace(/^@/, "");
      }
    }
  } catch {
    // not a URL
  }

  return value.replace(/\/+$/, "").toLowerCase();
}
