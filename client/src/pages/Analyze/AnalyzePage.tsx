import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { StatTile } from "../../components/StatTile";
import { Spinner } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { PlatformIcon } from "../../components/PlatformIcon";
import { VideoCard } from "../../components/VideoCard";
import { ViewsChart } from "../../components/ViewsChart";
import { SegmentedControl } from "../../components/SegmentedControl";
import { api } from "../../lib/api";
import type { ApiError, City, Creator, Platform, Video } from "../../lib/api";
import { formatCompactNumber, formatDate } from "../../lib/format";
import styles from "./AnalyzePage.module.css";

type SortMode = "views" | "recent";

export function AnalyzePage() {
  const { platform, username } = useParams<{ platform: Platform; username: string }>();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [errorDetail, setErrorDetail] = useState<string | undefined>();
  const [sort, setSort] = useState<SortMode>("views");
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    api.regions().then((r) => setCities(r.cities)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!platform || !username) return;
    let cancelled = false;
    setLoading(true);
    setErrorMsg(null);
    setErrorCode(undefined);

    api
      .analyze(platform, username)
      .then((res) => {
        if (cancelled) return;
        setCreator(res.creator);
        setVideos(res.videos);
      })
      .catch(async (err: ApiError) => {
        if (cancelled) return;
        if (err.code === "PROVIDER_NOT_CONFIGURED") {
          const cached = await api.getCreator(platform, username).catch(() => null);
          if (cached && !cancelled) {
            setCreator(cached.creator);
            setVideos(cached.videos);
            setErrorCode("STALE_NO_PROVIDER");
            setErrorMsg(err.message);
            return;
          }
        }
        setErrorMsg(err.message);
        setErrorCode(err.code);
        setErrorDetail(err.detail);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [platform, username]);

  const sortedVideos = useMemo(() => {
    const copy = [...videos];
    if (sort === "views") copy.sort((a, b) => b.views - a.views);
    else copy.sort((a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""));
    return copy;
  }, [videos, sort]);

  const stats = useMemo(() => {
    const totalViews = videos.reduce((s, v) => s + v.views, 0);
    const totalLikes = videos.reduce((s, v) => s + v.likes, 0);
    const totalComments = videos.reduce((s, v) => s + v.comments, 0);
    const avgViews = videos.length ? Math.round(totalViews / videos.length) : 0;
    const engagement = totalViews ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2) : "0";
    return { totalViews, totalLikes, totalComments, avgViews, engagement };
  }, [videos]);

  const chartPoints = useMemo(
    () =>
      [...videos]
        .filter((v) => v.posted_at)
        .sort((a, b) => (a.posted_at ?? "").localeCompare(b.posted_at ?? ""))
        .slice(-14)
        .map((v) => ({ label: formatDate(v.posted_at), value: v.views })),
    [videos],
  );

  if (loading) {
    return (
      <div className="container">
        <Spinner label={`@${username} талдануда…`} />
      </div>
    );
  }

  if (errorMsg && errorCode !== "STALE_NO_PROVIDER") {
    return (
      <div className={["container", styles.page].join(" ")}>
        <EmptyState
          tone="danger"
          title={
            errorCode === "PROVIDER_NOT_CONFIGURED"
              ? "Дерек провайдері теңшелмеген"
              : errorCode === "PROVIDER_REQUEST_FAILED"
                ? "Провайдерден дерек алу сәтсіз аяқталды"
                : "Аккаунт табылмады немесе қате орын алды"
          }
          description={
            errorCode === "PROVIDER_NOT_CONFIGURED"
              ? "Серверде RAPIDAPI_KEY орнатылмаған. server/.env файлына кілтті қосыңыз — толығырақ server/README.md ішінде."
              : errorMsg
          }
        >
          {errorDetail && <p className={styles.errorDetail}>{errorDetail}</p>}
        </EmptyState>
      </div>
    );
  }

  if (!creator) return null;

  return (
    <div className={["container", styles.page].join(" ")}>
      {errorCode === "STALE_NO_PROVIDER" && (
        <Card tint="secondary" padding="sm" className={styles.staleBanner}>
          Деректер соңғы синхрондаудан бері жаңартылмады — провайдер теңшелмеген. Көрсетілгені{" "}
          {formatDate(creator.last_synced_at)} мезгіліндегі кэш.
        </Card>
      )}

      <Card padding="lg" className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.avatarWrap}>
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>{(creator.display_name || creator.username).slice(0, 1).toUpperCase()}</div>
            )}
          </div>
          <div className={styles.identity}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{creator.display_name || creator.username}</h1>
              <PlatformIcon platform={creator.platform} size={22} />
            </div>
            <span className={styles.handle}>@{creator.username}</span>
            {creator.bio && <p className={styles.bio}>{creator.bio}</p>}
            <div className={styles.badgeRow}>
              <Badge tone="primary">{formatCompactNumber(creator.followers)} жазылушы</Badge>
              <RegionEditor creator={creator} cities={cities} onChange={setCreator} />
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.stats}>
        <StatTile label="Жалпы views" value={formatCompactNumber(stats.totalViews)} tint="primary" />
        <StatTile label="Жалпы likes" value={formatCompactNumber(stats.totalLikes)} tint="secondary" />
        <StatTile label="Орташа views/видео" value={formatCompactNumber(stats.avgViews)} />
        <StatTile label="Engagement rate" value={`${stats.engagement}%`} tint="lime" sub="(likes+comments)/views" />
        <StatTile label="Видео саны" value={String(videos.length)} />
      </div>

      {chartPoints.length > 1 && (
        <Card padding="md">
          <h3 className={styles.sectionTitle}>Views динамикасы (соңғы {chartPoints.length} видео)</h3>
          <ViewsChart points={chartPoints} />
        </Card>
      )}

      <div className={styles.videoHead}>
        <h2 className={styles.sectionTitle}>Видеолар</h2>
        <SegmentedControl
          value={sort}
          onChange={setSort}
          options={[
            { value: "views", label: "Көп қаралған" },
            { value: "recent", label: "Жаңа" },
          ]}
        />
      </div>

      {sortedVideos.length === 0 ? (
        <EmptyState title="Видео табылмады" description="Бұл аккаунттың жария видеосы жоқ немесе провайдер қайтармады." />
      ) : (
        <div className={styles.grid}>
          {sortedVideos.map((v, i) => (
            <VideoCard key={v.id} video={v} rank={sort === "views" ? i + 1 : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

function RegionEditor({
  creator,
  cities,
  onChange,
}: {
  creator: Creator;
  cities: City[];
  onChange: (c: Creator) => void;
}) {
  const [saving, setSaving] = useState(false);

  return (
    <div className={styles.regionEditor}>
      {creator.region ? (
        <Badge tone={creator.region_source === "manual" ? "accent" : "outline"}>
          📍 {creator.region} {creator.region_source === "inferred" && "(болжам)"}
        </Badge>
      ) : (
        <Badge tone="outline">Аймақ белгісіз</Badge>
      )}
      <select
        className={styles.regionSelect}
        value=""
        disabled={saving}
        onChange={async (e) => {
          if (!e.target.value) return;
          setSaving(true);
          try {
            const res = await api.setRegion(creator.id, e.target.value);
            onChange(res.creator);
          } finally {
            setSaving(false);
          }
        }}
      >
        <option value="">Аймақты өзгерту…</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
