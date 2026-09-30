import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Badge } from "../../components/Badge";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Spinner } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { CreatorCard } from "../../components/CreatorCard";
import { useGeolocation } from "../../hooks/useGeolocation";
import { api } from "../../lib/api";
import type { City, Platform, SearchResult } from "../../lib/api";
import styles from "./DiscoverPage.module.css";

type PlatformFilter = Platform | "all";

export function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const keyword = params.get("keyword") ?? "";
  const [keywordInput, setKeywordInput] = useState(keyword);
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [cities, setCities] = useState<City[]>([]);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geo = useGeolocation();

  useEffect(() => {
    api.regions().then((r) => setCities(r.cities)).catch(() => {});
  }, []);

  useEffect(() => {
    setKeywordInput(keyword);
  }, [keyword]);

  const regionName = geo.city?.name ?? null;

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .search({
        keyword: keyword || undefined,
        region: regionName ?? undefined,
        platform: platform === "all" ? undefined : platform,
      })
      .then((r) => setResults(r.results))
      .catch(() => setError("Іздеу кезінде қате орын алды."))
      .finally(() => setLoading(false));
  }, [keyword, regionName, platform]);

  const hasRegion = geo.status === "resolved";

  function submitKeyword() {
    setParams(keywordInput ? { keyword: keywordInput } : {});
  }

  const resultsWithoutRegionCount = useMemo(() => results?.length ?? 0, [results]);

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.headRow}>
        <h1 className={styles.title}>Креатор іздеу</h1>
        <p className={styles.subtitle}>
          Ниша бойынша (мысалы: «ойыншық», «сұлулық») немесе тек аймақ бойынша, талданған аккаунттар арасынан
          ізде.
        </p>
      </div>

      <Card padding="md" className={styles.controls}>
        <div className={styles.searchRow}>
          <Input
            placeholder="Ниша немесе кілт сөз (бос қалдыруға болады)"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitKeyword()}
          />
          <Button variant="secondary" onClick={submitKeyword}>
            Іздеу
          </Button>
        </div>

        <SegmentedControl
          value={platform}
          onChange={setPlatform}
          tint="accent"
          options={[
            { value: "all", label: "Барлығы" },
            { value: "instagram", label: "Instagram" },
            { value: "tiktok", label: "TikTok" },
          ]}
        />

        <div className={styles.regionRow}>
          {!hasRegion ? (
            <>
              <Button
                variant="dark"
                onClick={geo.locate}
                disabled={geo.status === "locating"}
              >
                {geo.status === "locating" ? "Анықталуда…" : "📍 Орналасуымды анықта"}
              </Button>
              <span className={styles.orText}>немесе қолмен таңда:</span>
              <select
                className={styles.select}
                defaultValue=""
                onChange={(e) => {
                  const city = cities.find((c) => c.id === e.target.value);
                  if (city) geo.setManualCity(city);
                }}
              >
                <option value="" disabled>
                  Қала таңдау…
                </option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <Badge tone="accent">📍 {regionName}</Badge>
              <button className={styles.changeLink} onClick={geo.reset}>
                аймақты өзгерту
              </button>
            </>
          )}
          {geo.error && <span className={styles.geoError}>{geo.error}</span>}
        </div>
      </Card>

      {loading && <Spinner label="Ізделуде…" />}

      {!loading && error && (
        <EmptyState tone="danger" title="Қате орын алды" description={error} />
      )}

      {!loading && !error && results && results.length === 0 && (
        <EmptyState
          title="Бұл критерийлер бойынша креатор табылмады"
          description={
            hasRegion
              ? `«${regionName}» аймағында сәйкес аккаунт әлі талданбаған. Аймақ сүзгісін алып тастап көріңіз немесе аккаунтты өзің талда — ол дерекқорға қосылады.`
              : "Іздеу сөзін өзгертіп көріңіз немесе аймақ бойынша сүзгіні қосыңыз."
          }
        />
      )}

      {!loading && !error && results && results.length > 0 && (
        <div className={styles.grid}>
          {results.map((r) => (
            <CreatorCard
              key={r.id}
              platform={r.platform}
              username={r.username}
              displayName={r.display_name}
              avatarUrl={r.avatar_url}
              region={r.region}
              nicheTags={JSON.parse(r.niche_tags || "[]")}
              totalViews={r.total_views}
              totalLikes={r.total_likes}
              followers={r.followers}
            />
          ))}
        </div>
      )}

      {!loading && !error && resultsWithoutRegionCount > 0 && (
        <p className={styles.footnote}>
          Дерекқор «Аккаунтты талда» арқылы тексерілген шоттармен толықтырылады — неғұрлым көп аккаунт
          талданса, соғұрлым іздеу нәтижесі бай болады.
        </p>
      )}
    </div>
  );
}
