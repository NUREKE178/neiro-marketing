import { useNavigate } from "react-router-dom";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { PlatformIcon } from "./PlatformIcon";
import { formatCompactNumber } from "../lib/format";
import { useLanguage } from "../i18n/LanguageContext";
import type { Platform, VerificationStatus } from "../lib/api";
import styles from "./CreatorCard.module.css";

interface CreatorCardProps {
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  region: string | null;
  nicheTags: string[];
  totalViews: number;
  totalLikes: number;
  followers: number | null;
  verificationStatus?: VerificationStatus;
  rank?: number;
}

export function CreatorCard({
  platform,
  username,
  displayName,
  avatarUrl,
  region,
  nicheTags,
  totalViews,
  totalLikes,
  followers,
  verificationStatus,
  rank,
}: CreatorCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Card
      interactive
      padding="md"
      className={styles.card}
      onClick={() => navigate(`/analyze/${platform}/${username}`)}
    >
      {rank && <span className={styles.rank}>#{rank}</span>}
      <div className={styles.head}>
        <div className={styles.avatarWrap}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{displayName.slice(0, 1).toUpperCase() || "?"}</div>
          )}
          <span className={styles.platformBadge}>
            <PlatformIcon platform={platform} size={12} />
          </span>
        </div>
        <div className={styles.identity}>
          <span className={styles.name}>{displayName || username}</span>
          <span className={styles.handle}>@{username}</span>
        </div>
      </div>

      <div className={styles.badges}>
        {verificationStatus && (
          <Badge tone={verificationStatus === "verified" ? "lime" : "outline"}>
            {verificationStatus === "verified" ? t("verification.verifiedShort") : t("verification.partiallyVerifiedShort")}
          </Badge>
        )}
        {region && <Badge tone="accent">{region}</Badge>}
        {followers !== null && (
          <Badge tone="outline">
            {formatCompactNumber(followers)} {t("common.followers")}
          </Badge>
        )}
      </div>

      {nicheTags.length > 0 && (
        <div className={styles.tags}>
          {nicheTags.slice(0, 4).map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className={styles.stats}>
        <div>
          <span className={styles.statValue}>{formatCompactNumber(totalViews)}</span>
          <span className={styles.statLabel}>views</span>
        </div>
        <div>
          <span className={styles.statValue}>{formatCompactNumber(totalLikes)}</span>
          <span className={styles.statLabel}>likes</span>
        </div>
      </div>
    </Card>
  );
}
