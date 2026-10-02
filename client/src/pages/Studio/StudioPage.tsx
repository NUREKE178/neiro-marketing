import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Spinner } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { SegmentedControl } from "../../components/SegmentedControl";
import { PlatformIcon } from "../../components/PlatformIcon";
import { useLanguage } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import type { ContentIdea, Draft, DraftStatus, Platform, Video } from "../../lib/api";
import { formatCompactNumber } from "../../lib/format";
import styles from "./StudioPage.module.css";

const STATUS_COLUMNS: DraftStatus[] = ["idea", "draft", "scheduled", "posted"];
const ALL_STATUSES: DraftStatus[] = ["idea", "draft", "scheduled", "posted", "archived"];

export function StudioPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"generate" | "board">("generate");
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .configStatus()
      .then((s) => setAiConfigured(s.aiConfigured))
      .catch(() => setAiConfigured(false));
  }, []);

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.headRow}>
        <h1 className={styles.title}>{t("studio.title")}</h1>
        <p className={styles.subtitle}>{t("studio.subtitle")}</p>
      </div>

      <SegmentedControl
        options={[
          { value: "generate", label: t("studio.tabGenerate") },
          { value: "board", label: t("studio.tabBoard") },
        ]}
        value={tab}
        onChange={setTab}
      />

      {aiConfigured === null ? (
        <Spinner />
      ) : tab === "generate" ? (
        <GenerateTab aiConfigured={aiConfigured} />
      ) : (
        <BoardTab />
      )}
    </div>
  );
}

function GenerateTab({ aiConfigured }: { aiConfigured: boolean }) {
  const { t } = useLanguage();
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [topic, setTopic] = useState("");
  const [useOwnData, setUseOwnData] = useState(false);
  const [ownConnected, setOwnConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[] | null>(null);
  const [grounded, setGrounded] = useState(false);
  const [model, setModel] = useState<string | null>(null);
  const [savedIndex, setSavedIndex] = useState<Set<number>>(new Set());

  useEffect(() => {
    setOwnConnected(false);
    setUseOwnData(false);
    api.auth
      .status(platform)
      .then((s) => setOwnConnected(Boolean(s.connected)))
      .catch(() => setOwnConnected(false));
  }, [platform]);

  if (!aiConfigured) {
    return (
      <EmptyState
        tone="primary"
        title={t("studio.notConfiguredTitle")}
        description={t("studio.notConfiguredDesc")}
      />
    );
  }

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setSavedIndex(new Set());
    try {
      const res = await api.studio.generate(platform, topic.trim(), useOwnData && ownConnected);
      setIdeas(res.ideas);
      setGrounded(res.groundedOnOwnData);
      setModel(res.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIdeas(null);
    } finally {
      setLoading(false);
    }
  }

  async function save(idea: ContentIdea, index: number) {
    await api.studio.createDraft({
      platform,
      topic: topic.trim(),
      hook: idea.hook,
      script: idea.script,
      caption: idea.caption,
      hashtags: idea.hashtags,
      aiModel: model,
    });
    setSavedIndex((prev) => new Set(prev).add(index));
  }

  return (
    <div className={styles.generateWrap}>
      <Card padding="lg" className={styles.form}>
        <SegmentedControl
          options={[
            { value: "instagram", label: "Instagram" },
            { value: "tiktok", label: "TikTok" },
          ]}
          value={platform}
          onChange={setPlatform}
          tint="secondary"
        />
        <Input
          size="lg"
          placeholder={t("studio.topicPlaceholder")}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        {ownConnected && (
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={useOwnData} onChange={(e) => setUseOwnData(e.target.checked)} />
            {t("studio.useOwnData")}
          </label>
        )}
        <Button variant="primary" size="lg" disabled={loading || !topic.trim()} onClick={generate}>
          {loading ? <Spinner /> : t("studio.generateBtn")}
        </Button>
        {error && <p className={styles.error}>{error}</p>}
      </Card>

      {ideas && (
        <div className={styles.ideasSection}>
          {grounded && <Badge tone="lime">{t("studio.groundedBadge")}</Badge>}
          <div className={styles.ideasGrid}>
            {ideas.map((idea, i) => (
              <Card key={i} padding="lg" className={styles.ideaCard}>
                <Badge tone="accent">{t("studio.hookLabel")}</Badge>
                <p className={styles.hook}>{idea.hook}</p>
                <Badge tone="outline">{t("studio.scriptLabel")}</Badge>
                <p className={styles.script}>{idea.script}</p>
                <Badge tone="outline">{t("studio.captionLabel")}</Badge>
                <p className={styles.caption}>{idea.caption}</p>
                <div className={styles.hashtags}>
                  {idea.hashtags.map((h) => (
                    <span key={h} className={styles.hashtag}>
                      #{h}
                    </span>
                  ))}
                </div>
                <Button
                  variant={savedIndex.has(i) ? "dark" : "primary"}
                  disabled={savedIndex.has(i)}
                  onClick={() => save(idea, i)}
                >
                  {savedIndex.has(i) ? t("studio.saved") : t("studio.saveBtn")}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BoardTab() {
  const { t } = useLanguage();
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [ownVideos, setOwnVideos] = useState<Record<Platform, Video[]>>({ instagram: [], tiktok: [] });

  function load() {
    api.studio
      .listDrafts()
      .then((r) => setDrafts(r.drafts))
      .catch(() => setDrafts([]));
  }

  useEffect(() => {
    load();
    (["instagram", "tiktok"] as Platform[]).forEach((platform) => {
      api.auth
        .status(platform)
        .then((s) => {
          if (s.connected && s.username) {
            api.getCreator(platform, s.username).then((r) => {
              setOwnVideos((prev) => ({ ...prev, [platform]: r.videos }));
            });
          }
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (drafts === null) return <Spinner />;
  if (drafts.length === 0) {
    return <EmptyState title={t("studio.boardEmptyTitle")} description={t("studio.boardEmptyDesc")} />;
  }

  return (
    <div className={styles.board}>
      {STATUS_COLUMNS.map((status) => (
        <div key={status} className={styles.column}>
          <h3 className={styles.columnTitle}>
            {t(`studio.status.${status}`)}
            <Badge tone="outline">{drafts.filter((d) => d.status === status).length}</Badge>
          </h3>
          <div className={styles.columnList}>
            {drafts
              .filter((d) => d.status === status)
              .map((d) => (
                <DraftCard key={d.id} draft={d} ownVideos={ownVideos[d.platform]} onChange={load} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DraftCard({ draft, ownVideos, onChange }: { draft: Draft; ownVideos: Video[]; onChange: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState(draft);

  useEffect(() => setLocal(draft), [draft]);

  async function persist(patch: Partial<Draft>) {
    const next = { ...local, ...patch };
    setLocal(next);
    setBusy(true);
    try {
      await api.studio.updateDraft(draft.id, {
        status: next.status,
        scheduledAt: next.scheduled_at,
        linkedVideoId: next.linked_video_id,
        script: next.script,
      });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api.studio.deleteDraft(draft.id);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  const linkedVideo = ownVideos.find((v) => v.id === draft.linked_video_id);

  return (
    <Card padding="sm" className={styles.draftCard} interactive>
      <div className={styles.draftHead} onClick={() => setOpen((o) => !o)}>
        <PlatformIcon platform={draft.platform} size={16} />
        <span className={styles.draftTopic}>{draft.topic || draft.hook.slice(0, 40)}</span>
      </div>
      <p className={styles.draftHook} onClick={() => setOpen((o) => !o)}>
        {draft.hook}
      </p>

      {linkedVideo && (
        <div className={styles.actualStats}>
          {t("studio.actual")}: {formatCompactNumber(linkedVideo.views)} views ·{" "}
          {formatCompactNumber(linkedVideo.likes)} likes
        </div>
      )}

      {open && (
        <div className={styles.draftEdit}>
          <textarea
            className={styles.textarea}
            value={local.script}
            onChange={(e) => setLocal({ ...local, script: e.target.value })}
            onBlur={() => persist({ script: local.script })}
          />
          <select
            className={styles.select}
            value={local.status}
            disabled={busy}
            onChange={(e) => persist({ status: e.target.value as DraftStatus })}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`studio.status.${s}`)}
              </option>
            ))}
          </select>

          {local.status === "scheduled" && (
            <input
              type="date"
              className={styles.select}
              value={local.scheduled_at?.slice(0, 10) ?? ""}
              onChange={(e) =>
                persist({ scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null })
              }
            />
          )}

          {local.status === "posted" && ownVideos.length > 0 && (
            <select
              className={styles.select}
              value={local.linked_video_id ?? ""}
              onChange={(e) => persist({ linked_video_id: e.target.value || null })}
            >
              <option value="">{t("studio.linkVideoPlaceholder")}</option>
              {ownVideos.map((v) => (
                <option key={v.id} value={v.id}>
                  {(v.caption || v.external_id).slice(0, 40)}
                </option>
              ))}
            </select>
          )}

          <Button variant="ghost" size="sm" disabled={busy} onClick={remove}>
            {t("studio.deleteBtn")}
          </Button>
        </div>
      )}
    </Card>
  );
}
