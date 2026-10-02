import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Badge } from "../../components/Badge";
import { Spinner } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { SegmentedControl } from "../../components/SegmentedControl";
import { StatTile } from "../../components/StatTile";
import { ReactionChart } from "../../components/ReactionChart";
import type { ReactionSeries } from "../../components/ReactionChart";
import { useLanguage } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import type { Creative, CreativeAggregate, NeuroVerdict, Test, TimeBucket } from "../../lib/api";
import styles from "./TestDetailPage.module.css";

const SERIES_COLORS = ["var(--chart-series-1)", "var(--chart-series-2)", "var(--chart-series-3)", "var(--chart-series-4)"];
type Metric = "avg_smile" | "avg_brow_furrow" | "avg_attention";

export function TestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [test, setTest] = useState<Test | null>(null);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiConfigured, setAiConfigured] = useState(true);

  function load() {
    if (!id) return;
    api.tests
      .get(id)
      .then((r) => {
        setTest(r.test);
        setCreatives(r.creatives);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)));
  }

  useEffect(() => {
    load();
    api.configStatus().then((s) => setAiConfigured(s.aiConfigured)).catch(() => setAiConfigured(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loadError) {
    return (
      <div className="container">
        <EmptyState tone="danger" title={t("testDetail.notFoundTitle")} description={loadError} />
      </div>
    );
  }
  if (!test || !id) return <Spinner />;

  const viewerUrl = `${window.location.origin}/watch/${id}`;

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.headRow}>
        <h1 className={styles.title}>{test.title}</h1>
        {test.goal && <p className={styles.subtitle}>{test.goal}</p>}
      </div>

      <CreativesSection testId={id} creatives={creatives} onChange={load} />

      {creatives.length >= 2 && <ViewerLinkCard viewerUrl={viewerUrl} />}

      {creatives.length >= 1 && (
        <ResultsSection testId={id} test={test} creatives={creatives} aiConfigured={aiConfigured} onAnalyzed={load} />
      )}
    </div>
  );
}

function CreativesSection({
  testId,
  creatives,
  onChange,
}: {
  testId: string;
  creatives: Creative[];
  onChange: () => void;
}) {
  const { t } = useLanguage();
  const [label, setLabel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.tests.addCreative(testId, label.trim() || String.fromCharCode(65 + creatives.length), imageUrl.trim(), caption.trim());
      setLabel("");
      setImageUrl("");
      setCaption("");
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(creativeId: string) {
    await api.tests.removeCreative(testId, creativeId);
    onChange();
  }

  return (
    <Card padding="lg" className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("testDetail.creativesTitle")}</h2>

      {creatives.length > 0 && (
        <div className={styles.creativesGrid}>
          {creatives.map((c) => (
            <div key={c.id} className={styles.creativeCard}>
              <img src={c.image_url} alt={c.label} className={styles.creativeThumb} />
              <div className={styles.creativeMeta}>
                <Badge tone="outline">{c.label}</Badge>
                {c.caption && <p className={styles.creativeCaption}>{c.caption}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
                {t("testDetail.removeBtn")}
              </Button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className={styles.addForm}>
        <Input placeholder={t("testDetail.labelPlaceholder")} value={label} onChange={(e) => setLabel(e.target.value)} />
        <Input
          placeholder={t("testDetail.imageUrlPlaceholder")}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Input placeholder={t("testDetail.captionPlaceholder")} value={caption} onChange={(e) => setCaption(e.target.value)} />
        <Button type="submit" variant="primary" disabled={busy || !imageUrl.trim()}>
          {t("testDetail.addCreativeBtn")}
        </Button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      {creatives.length === 1 && <p className={styles.hint}>{t("testDetail.needSecondHint")}</p>}
    </Card>
  );
}

function ViewerLinkCard({ viewerUrl }: { viewerUrl: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(viewerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — the link is still visible/selectable
    }
  }

  return (
    <Card tint="lime" padding="lg" className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("testDetail.viewerLinkTitle")}</h2>
      <p className={styles.hint}>{t("testDetail.viewerLinkDesc")}</p>
      <div className={styles.linkRow}>
        <code className={styles.linkCode}>{viewerUrl}</code>
        <Button variant="dark" size="sm" onClick={copy}>
          {copied ? t("testDetail.copied") : t("testDetail.copyBtn")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.open(viewerUrl, "_blank")}>
          {t("testDetail.tryItBtn")}
        </Button>
      </div>
    </Card>
  );
}

function ResultsSection({
  testId,
  test,
  creatives,
  aiConfigured,
  onAnalyzed,
}: {
  testId: string;
  test: Test;
  creatives: Creative[];
  aiConfigured: boolean;
  onAnalyzed: () => void;
}) {
  const { t } = useLanguage();
  const [aggregates, setAggregates] = useState<CreativeAggregate[] | null>(null);
  const [timeBuckets, setTimeBuckets] = useState<TimeBucket[]>([]);
  const [metric, setMetric] = useState<Metric>("avg_smile");
  const [verdict, setVerdict] = useState<NeuroVerdict | null>(
    test.last_analysis_json ? (JSON.parse(test.last_analysis_json).verdict as NeuroVerdict) : null,
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  function load() {
    api.tests
      .results(testId)
      .then((r) => {
        setAggregates(r.aggregates);
        setTimeBuckets(r.timeBuckets);
      })
      .catch(() => {
        setAggregates([]);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  async function analyze() {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const { verdict: v } = await api.tests.analyze(testId);
      setVerdict(v);
      onAnalyzed();
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalyzing(false);
    }
  }

  if (aggregates === null) return <Spinner />;

  const totalSessions = aggregates.reduce((sum, a) => sum + a.session_count, 0);
  const maxMs = timeBuckets.reduce((max, b) => Math.max(max, b.bucket_ms), 0);

  const series: ReactionSeries[] = creatives.map((c, i) => ({
    label: c.label,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
    points: timeBuckets
      .filter((b) => b.creative_id === c.id)
      .map((b) => ({ ms: b.bucket_ms, value: b[metric] })),
  }));

  return (
    <Card padding="lg" className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("testDetail.resultsTitle")}</h2>

      {totalSessions === 0 ? (
        <EmptyState title={t("testDetail.noSessionsTitle")} description={t("testDetail.noSessionsDesc")} />
      ) : (
        <>
          {totalSessions < 3 && <p className={styles.warnBanner}>{t("testDetail.lowSampleWarning", { count: totalSessions })}</p>}

          <div className={styles.statsGrid}>
            {creatives.map((c, i) => {
              const agg = aggregates.find((a) => a.creative_id === c.id);
              return (
                <StatTile
                  key={c.id}
                  label={c.label}
                  value={`${agg?.session_count ?? 0} ${t("testDetail.viewersUnit")}`}
                  tint={i === 0 ? "primary" : i === 1 ? "secondary" : "accent"}
                  sub={`smile ${agg?.avg_smile?.toFixed(2) ?? "—"} · furrow ${agg?.avg_brow_furrow?.toFixed(2) ?? "—"} · attention ${agg?.avg_attention?.toFixed(2) ?? "—"}`}
                />
              );
            })}
          </div>

          <SegmentedControl
            value={metric}
            onChange={setMetric}
            tint="accent"
            options={[
              { value: "avg_smile", label: t("testDetail.metricSmile") },
              { value: "avg_brow_furrow", label: t("testDetail.metricFurrow") },
              { value: "avg_attention", label: t("testDetail.metricAttention") },
            ]}
          />
          <ReactionChart series={series} maxMs={maxMs} metricLabel={metric} />
        </>
      )}

      {creatives.length < 2 ? (
        <p className={styles.hint}>{t("testDetail.needSecondHint")}</p>
      ) : !aiConfigured ? (
        <EmptyState tone="primary" title={t("testDetail.aiNotConfiguredTitle")} description={t("testDetail.aiNotConfiguredDesc")} />
      ) : (
        <div className={styles.aiSection}>
          <Button variant="primary" disabled={analyzing || totalSessions === 0} onClick={analyze}>
            {analyzing ? <Spinner /> : verdict ? t("testDetail.reanalyzeBtn") : t("testDetail.analyzeBtn")}
          </Button>
          {analyzeError && <p className={styles.error}>{analyzeError}</p>}
          {verdict && (
            <Card tint="primary" padding="md" className={styles.verdictCard}>
              {verdict.winnerLabel && (
                <Badge tone="ink">{t("testDetail.winnerBadge", { label: verdict.winnerLabel })}</Badge>
              )}
              <p className={styles.verdictSummary}>{verdict.summary}</p>
              <ul className={styles.verdictNotes}>
                {verdict.perCreativeNotes.map((n) => (
                  <li key={n.label}>
                    <strong>{n.label}:</strong> {n.note}
                  </li>
                ))}
              </ul>
              <p className={styles.verdictSuggestion}>💡 {verdict.suggestion}</p>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
}
