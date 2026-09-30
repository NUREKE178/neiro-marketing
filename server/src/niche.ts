const STOPWORDS = new Set([
  "және", "мен", "бен", "пен", "де", "да", "үшін", "бірақ", "the", "and", "for", "with",
  "this", "that", "you", "your", "from", "are", "was", "not", "but",
]);

/** Extracts #hashtags plus meaningful words (>=4 chars, not a stopword) from a caption. */
export function extractTags(text: string): string[] {
  const tags = new Set<string>();

  for (const match of text.matchAll(/#([\p{L}\p{N}_]+)/gu)) {
    tags.add(match[1].toLocaleLowerCase("ru"));
  }

  const words = text
    .toLocaleLowerCase("ru")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));

  for (const w of words.slice(0, 15)) tags.add(w);

  return [...tags];
}

/** Aggregates the most frequent tags across a creator's captions into a niche list. */
export function deriveNicheTags(captions: string[], limit = 12): string[] {
  const counts = new Map<string, number>();
  for (const caption of captions) {
    for (const tag of extractTags(caption)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function buildSearchBlob(fields: {
  username: string;
  displayName: string;
  bio: string;
  nicheTags: string[];
  captions: string[];
}): string {
  return [fields.username, fields.displayName, fields.bio, ...fields.nicheTags, ...fields.captions]
    .join(" \n ")
    .toLocaleLowerCase("ru");
}
