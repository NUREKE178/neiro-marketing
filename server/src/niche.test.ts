import { test } from "node:test";
import assert from "node:assert/strict";
import { extractTags, deriveNicheTags, buildSearchBlob } from "./niche.js";

test("extractTags: pulls hashtags and meaningful words, lowercased", () => {
  const tags = extractTags("Жаңа #ойыншық шолуы! Балаларға арналған керемет сыйлық.");
  assert.ok(tags.includes("ойыншық"));
  assert.ok(tags.includes("балаларға") || tags.includes("керемет"));
});

test("extractTags: drops short words and stopwords", () => {
  const tags = extractTags("de da and the for");
  assert.deepEqual(tags, []);
});

test("deriveNicheTags: ranks by frequency across captions", () => {
  const tags = deriveNicheTags([
    "ойыншық шолуы бір",
    "ойыншық шолуы екі",
    "мүлде басқа тақырып",
  ]);
  assert.equal(tags[0], "ойыншық");
});

test("buildSearchBlob: concatenates and lowercases all searchable fields", () => {
  const blob = buildSearchBlob({
    username: "ToyShopKZ",
    displayName: "Toy Shop",
    bio: "Ойыншықтар",
    nicheTags: ["ойыншық"],
    captions: ["жаңа #ойыншық"],
  });
  assert.equal(blob, blob.toLocaleLowerCase("ru"));
  assert.ok(blob.includes("toyshopkz"));
  assert.ok(blob.includes("ойыншық"));
});
