import { Card } from "./Card";
import { formatCompactNumber, formatDate } from "../lib/format";
import type { Video } from "../lib/api";
import styles from "./VideoCard.module.css";

export function VideoCard({ video, rank }: { video: Video; rank?: number }) {
  const content = (
    <>
      <div className={styles.thumbWrap}>
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt="" className={styles.thumb} loading="lazy" />
        ) : (
          <div className={styles.thumbFallback}>▶</div>
        )}
        {rank && <span className={styles.rank}>#{rank}</span>}
      </div>
      <p className={styles.caption}>{video.caption || "Сипаттама жоқ"}</p>
      <div className={styles.metrics}>
        <span>
          <b>{formatCompactNumber(video.views)}</b> views
        </span>
        <span>
          <b>{formatCompactNumber(video.likes)}</b> likes
        </span>
        <span>
          <b>{formatCompactNumber(video.comments)}</b> comments
        </span>
      </div>
      <span className={styles.date}>{formatDate(video.posted_at)}</span>
    </>
  );

  if (video.url) {
    return (
      <Card padding="sm" className={styles.card}>
        <a href={video.url} target="_blank" rel="noreferrer" className={styles.link}>
          {content}
        </a>
      </Card>
    );
  }

  return (
    <Card padding="sm" className={styles.card}>
      {content}
    </Card>
  );
}
