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
import { useLanguage } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import type { City, Platform, SearchResult } from "../../lib/api";
import styles from "./DiscoverPage.module.css";

type PlatformFilter = Platform | "all";

export function DiscoverPage() {
  const { t } = useLanguage();
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
      .catch(() => setError(t("discover.error")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, regionName, platform]);

  const hasRegion = geo.status === "resolved";

  function submitKeyword() {
    setParams(keywordInput ? { keyword: keywordInput } : {});
  }

  const resultsWithoutRegionCount = useMemo(() => results?.length ?? 0, [results]);

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.headRow}>
        <h1 className={styles.title}>{t("discover.title")}</h1>
        <p className={styles.subtitle}>{t("discover.subtitle")}</p>
      </div>

      <Card padding="md" className={styles.controls}>
        <div className={styles.searchRow}>
          <Input
            placeholder={t("discover.keywordPlaceholder")}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitKeyword()}
          />
          <Button variant="secondary" onClick={submitKeyword}>
            {t("discover.searchBtn")}
          </Button>
        </div>

        <SegmentedControl
          value={platform}
          onChange={setPlatform}
          tint="accent"
          options={[
            { value: "all", label: t("discover.platformAll") },
            { value: "instagram", label: "Instagram" },
            { value: "tiktok", label: "TikTok" },
          ]}
        />

        <div className={styles.regionRow}>
          {!hasRegion ? (
            <>
              <Button variant="dark" onClick={geo.locate} disabled={geo.status === "locating"}>
                {geo.status === "locating" ? t("discover.locating") : t("discover.locateBtn")}
              </Button>
              <span className={styles.orText}>{t("discover.orManual")}</span>
              <select
                className={styles.select}
                defaultValue=""
                onChange={(e) => {
                  const city = cities.find((c) => c.id === e.target.value);
                  if (city) geo.setManualCity(city);
                }}
              >
                <option value="" disabled>
                  {t("discover.cityPlaceholder")}
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
                {t("discover.changeRegion")}
              </button>
            </>
          )}
          {geo.error && <span className={styles.geoError}>{geo.error}</span>}
        </div>
      </Card>

      {loading && <Spinner label={t("discover.loading")} />}

      {!loading && error && <EmptyState tone="danger" title={t("common.errorTitle")} description={error} />}

      {!loading && !error && results && results.length === 0 && (
        <EmptyState
          title={t("discover.emptyTitle")}
          description={
            hasRegion
              ? t("discover.emptyWithRegion", { region: regionName ?? "" })
              : t("discover.emptyNoRegion")
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
              verificationStatus={r.verification_status}
            />
          ))}
        </div>
      )}

      {!loading && !error && resultsWithoutRegionCount > 0 && (
        <p className={styles.footnote}>{t("discover.footnote")}</p>
      )}
    </div>
  );
}
