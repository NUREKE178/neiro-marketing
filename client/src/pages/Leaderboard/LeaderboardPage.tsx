import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Spinner } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { CreatorCard } from "../../components/CreatorCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import type { City, LeaderboardEntry, Platform } from "../../lib/api";
import styles from "./LeaderboardPage.module.css";

type RangePreset = "1" | "7" | "30" | "custom";
type PlatformFilter = Platform | "all";

const LOCALE: Record<string, string> = { kk: "kk-KZ", ru: "ru-RU", en: "en-US" };

export function LeaderboardPage() {
  const { t, lang } = useLanguage();
  const [preset, setPreset] = useState<RangePreset>("7");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [metric, setMetric] = useState<"views" | "likes">("views");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [region, setRegion] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [results, setResults] = useState<LeaderboardEntry[] | null>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.regions().then((r) => setCities(r.cities)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .leaderboard({
        platform: platform === "all" ? undefined : platform,
        region: region || undefined,
        metric,
        days: preset === "custom" ? undefined : Number(preset),
        from: preset === "custom" && from ? from : undefined,
        to: preset === "custom" && to ? to : undefined,
      })
      .then((r) => {
        setResults(r.results);
        setRange(r.range);
      })
      .catch(() => setError(t("leaderboard.error")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, from, to, metric, platform, region]);

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.headRow}>
        <h1 className={styles.title}>{t("leaderboard.title")}</h1>
        <p className={styles.subtitle}>{t("leaderboard.subtitle")}</p>
      </div>

      <Card padding="md" className={styles.controls}>
        <div className={styles.row}>
          <span className={styles.label}>{t("leaderboard.period")}</span>
          <SegmentedControl
            value={preset}
            onChange={setPreset}
            options={[
              { value: "1", label: t("leaderboard.period24h") },
              { value: "7", label: t("leaderboard.period7d") },
              { value: "30", label: t("leaderboard.period30d") },
              { value: "custom", label: t("leaderboard.periodCustom") },
            ]}
          />
        </div>

        {preset === "custom" && (
          <div className={styles.dateRow}>
            <label>
              {t("leaderboard.from")}
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={styles.date} />
            </label>
            <label>
              {t("leaderboard.to")}
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={styles.date} />
            </label>
          </div>
        )}

        <div className={styles.row}>
          <span className={styles.label}>{t("leaderboard.metric")}</span>
          <SegmentedControl
            value={metric}
            onChange={setMetric}
            tint="secondary"
            options={[
              { value: "views", label: t("leaderboard.metricViews") },
              { value: "likes", label: t("leaderboard.metricLikes") },
            ]}
          />
        </div>

        <div className={styles.row}>
          <span className={styles.label}>{t("leaderboard.platform")}</span>
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
        </div>

        <div className={styles.row}>
          <span className={styles.label}>{t("leaderboard.region")}</span>
          <select className={styles.select} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">{t("leaderboard.allRegions")}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {range && (
        <p className={styles.rangeText}>
          {new Date(range.from).toLocaleDateString(LOCALE[lang])} —{" "}
          {new Date(range.to).toLocaleDateString(LOCALE[lang])}
        </p>
      )}

      {loading && <Spinner label={t("leaderboard.loading")} />}

      {!loading && error && <EmptyState tone="danger" title={t("common.errorTitle")} description={error} />}

      {!loading && !error && results && results.length === 0 && (
        <EmptyState title={t("leaderboard.emptyTitle")} description={t("leaderboard.emptyDesc")} />
      )}

      {!loading && !error && results && results.length > 0 && (
        <div className={styles.grid}>
          {results.map((r, i) => (
            <CreatorCard
              key={r.id}
              rank={i + 1}
              platform={r.platform}
              username={r.username}
              displayName={r.display_name}
              avatarUrl={r.avatar_url}
              region={r.region}
              nicheTags={JSON.parse(r.niche_tags || "[]")}
              totalViews={r.period_views}
              totalLikes={r.period_likes}
              followers={r.followers}
            />
          ))}
        </div>
      )}
    </div>
  );
}
