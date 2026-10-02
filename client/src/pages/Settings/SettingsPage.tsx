import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PlatformIcon } from "../../components/PlatformIcon";
import { Spinner } from "../../components/Spinner";
import { useLanguage } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import type { ConnectionStatus, Platform } from "../../lib/api";
import { formatDate } from "../../lib/format";
import styles from "./SettingsPage.module.css";

const PLATFORMS: Platform[] = ["instagram", "tiktok"];

export function SettingsPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [banner, setBanner] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    const connected = params.get("connected");
    const error = params.get("error");
    if (connected) setBanner({ tone: "ok", text: t("settings.connectSuccess") });
    else if (error) setBanner({ tone: "error", text: `${t("settings.connectError")} (${error})` });

    if (connected || error) {
      const next = new URLSearchParams(params);
      next.delete("connected");
      next.delete("error");
      next.delete("platform");
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={["container", styles.page].join(" ")}>
      <div className={styles.headRow}>
        <h1 className={styles.title}>{t("settings.title")}</h1>
        <p className={styles.subtitle}>{t("settings.subtitle")}</p>
      </div>

      {banner && (
        <Card tint={banner.tone === "ok" ? "lime" : "secondary"} padding="sm" className={styles.banner}>
          {banner.text}
        </Card>
      )}

      <div className={styles.grid}>
        {PLATFORMS.map((platform) => (
          <IntegrationCard key={platform} platform={platform} />
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({ platform }: { platform: Platform }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api.auth.status(platform).then(setStatus).catch(() => setStatus(null));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  if (!status) {
    return (
      <Card padding="lg">
        <Spinner />
      </Card>
    );
  }

  async function resync() {
    setBusy(true);
    try {
      await api.auth.resync(platform);
    } catch {
      // status refresh below will surface the failure via last_error
    } finally {
      setBusy(false);
      load();
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await api.auth.disconnect(platform);
    } finally {
      setBusy(false);
      load();
    }
  }

  return (
    <Card padding="lg" className={styles.card}>
      <div className={styles.cardHead}>
        <PlatformIcon platform={platform} size={26} />
        <h2 className={styles.platformName}>{platform === "instagram" ? "Instagram" : "TikTok"}</h2>
        <Badge tone={status.connected ? "lime" : "outline"}>
          {status.connected ? t("settings.connected") : t("settings.notConnected")}
        </Badge>
      </div>

      {!status.configured ? (
        <div className={styles.notConfigured}>
          <p className={styles.notConfiguredTitle}>{t("settings.notConfiguredTitle")}</p>
          <p className={styles.notConfiguredDesc}>{t("settings.notConfiguredDesc")}</p>
        </div>
      ) : status.connected ? (
        <div className={styles.details}>
          <DetailRow label="@" value={status.username ?? ""} />
          <DetailRow label={t("settings.scopes")} value={(status.scopes ?? []).join(", ") || "—"} />
          <DetailRow label={t("settings.connectedSince")} value={status.connectedAt ? formatDate(status.connectedAt) : "—"} />
          <DetailRow
            label={t("settings.lastSync")}
            value={status.lastSyncAt ? formatDate(status.lastSyncAt) : t("settings.lastSyncNever")}
          />
          {status.lastSyncStatus === "failed" && status.lastError && (
            <DetailRow label={t("settings.lastError")} value={status.lastError} danger />
          )}
          {status.tokenExpired && <Badge tone="danger">{t("settings.tokenExpired")}</Badge>}

          <div className={styles.actions}>
            {status.tokenExpired ? (
              <Button variant="primary" size="sm" onClick={() => (window.location.href = api.auth.startUrl(platform))}>
                {t("settings.reconnectBtn")}
              </Button>
            ) : (
              <Button variant="dark" size="sm" disabled={busy} onClick={resync}>
                {t("settings.resyncBtn")}
              </Button>
            )}
            <Button variant="ghost" size="sm" disabled={busy} onClick={disconnect}>
              {t("settings.disconnectBtn")}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => (window.location.href = api.auth.startUrl(platform))}>
            {t("settings.connectBtn")}
          </Button>
        </div>
      )}
    </Card>
  );
}

function DetailRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={[styles.detailValue, danger ? styles.detailDanger : ""].join(" ")}>{value}</span>
    </div>
  );
}
