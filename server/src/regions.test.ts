import { test } from "node:test";
import assert from "node:assert/strict";
import { nearestCity, inferRegionFromText, findCityByIdOrName, KZ_CITIES } from "./regions.js";

test("nearestCity: finds the closest known city by real coordinates", () => {
  // Coordinates right in central Almaty.
  const city = nearestCity(43.238, 76.889);
  assert.equal(city.id, "almaty");
});

test("nearestCity: Astana coordinates resolve to Astana, not Almaty", () => {
  const city = nearestCity(51.169, 71.449);
  assert.equal(city.id, "astana");
});

test("inferRegionFromText: finds a city name mentioned in bio text", () => {
  const city = inferRegionFromText("Алматыда тұрамын, сыйлықтар дүкені");
  assert.equal(city?.id, "almaty");
});

test("inferRegionFromText: returns null when no known city is mentioned — never guesses", () => {
  const city = inferRegionFromText("Мен әртүрлі қалаларды аралаймын");
  assert.equal(city, null);
});

test("findCityByIdOrName: matches by id or by localized name, case-insensitively", () => {
  assert.equal(findCityByIdOrName("almaty")?.name, "Алматы");
  assert.equal(findCityByIdOrName("Алматы")?.id, "almaty");
  assert.equal(findCityByIdOrName("АЛМАТЫ")?.id, "almaty");
  assert.equal(findCityByIdOrName("nowhere"), null);
});

test("every city in the list is unique by id", () => {
  const ids = new Set(KZ_CITIES.map((c) => c.id));
  assert.equal(ids.size, KZ_CITIES.length);
});
