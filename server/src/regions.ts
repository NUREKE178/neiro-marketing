export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Major Kazakhstan cities/regions with approximate centers.
export const KZ_CITIES: City[] = [
  { id: "almaty", name: "Алматы", lat: 43.238949, lng: 76.889709 },
  { id: "astana", name: "Астана", lat: 51.169392, lng: 71.449074 },
  { id: "shymkent", name: "Шымкент", lat: 42.341839, lng: 69.590269 },
  { id: "karaganda", name: "Қарағанды", lat: 49.806720, lng: 73.088530 },
  { id: "aktobe", name: "Ақтөбе", lat: 50.283195, lng: 57.166978 },
  { id: "taraz", name: "Тараз", lat: 42.899976, lng: 71.366669 },
  { id: "pavlodar", name: "Павлодар", lat: 52.287964, lng: 76.957520 },
  { id: "ust-kamenogorsk", name: "Өскемен", lat: 49.948610, lng: 82.628460 },
  { id: "semey", name: "Семей", lat: 50.411520, lng: 80.227900 },
  { id: "atyrau", name: "Атырау", lat: 47.094990, lng: 51.923060 },
  { id: "kostanay", name: "Қостанай", lat: 53.214379, lng: 63.628539 },
  { id: "kyzylorda", name: "Қызылорда", lat: 44.852510, lng: 65.509120 },
  { id: "uralsk", name: "Орал", lat: 51.227870, lng: 51.377390 },
  { id: "petropavl", name: "Петропавл", lat: 54.874960, lng: 69.146820 },
  { id: "aktau", name: "Ақтау", lat: 43.650570, lng: 51.198350 },
  { id: "turkistan", name: "Түркістан", lat: 43.297470, lng: 68.251970 },
  { id: "kokshetau", name: "Көкшетау", lat: 53.284440, lng: 69.391430 },
  { id: "taldykorgan", name: "Талдықорған", lat: 45.016670, lng: 78.383330 },
  { id: "zhezkazgan", name: "Жезқазған", lat: 47.784450, lng: 67.708370 },
  { id: "ekibastuz", name: "Екібастұз", lat: 51.726190, lng: 75.327780 },
];

const CITY_BY_NAME = new Map(
  KZ_CITIES.map((c) => [c.name.toLocaleLowerCase("ru"), c]),
);

function haversineKm(a: City, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Nearest known KZ city to a raw lat/lng coming from the browser Geolocation API. */
export function nearestCity(lat: number, lng: number): City {
  let best = KZ_CITIES[0];
  let bestDist = Infinity;
  for (const city of KZ_CITIES) {
    const d = haversineKm(city, { lat, lng });
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best;
}

/**
 * Real (non-fabricated) region inference: scans a creator's actual bio text
 * fetched from the provider for a known city name. IG/TikTok don't expose a
 * structured "creator location" field for arbitrary public accounts, so this
 * is the honest signal we can extract without inventing data. Falls back to
 * null (shown as "region unknown, needs manual tagging" in the UI) rather
 * than guessing.
 */
export function inferRegionFromText(text: string): City | null {
  const lower = text.toLocaleLowerCase("ru");
  for (const [name, city] of CITY_BY_NAME) {
    if (lower.includes(name)) return city;
  }
  return null;
}

export function findCityByIdOrName(value: string): City | null {
  const lower = value.trim().toLocaleLowerCase("ru");
  return (
    KZ_CITIES.find((c) => c.id === lower || c.name.toLocaleLowerCase("ru") === lower) ??
    null
  );
}
