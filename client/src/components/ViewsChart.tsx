import { useId } from "react";
import { formatCompactNumber } from "../lib/format";
import styles from "./ViewsChart.module.css";

interface Point {
  label: string;
  value: number;
}

export function ViewsChart({ points, color = "var(--color-accent)" }: { points: Point[]; color?: string }) {
  const gradId = useId();
  if (points.length === 0) return null;

  const width = 100;
  const height = 34;
  const max = Math.max(...points.map((p) => p.value), 1);
  const barWidth = width / points.length;

  return (
    <div className={styles.wrap}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={styles.svg} role="img" aria-label="Видео қаралымдары">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {points.map((p, i) => {
          const h = (p.value / max) * (height - 2);
          return (
            <rect
              key={i}
              x={i * barWidth + barWidth * 0.15}
              y={height - h}
              width={barWidth * 0.7}
              height={Math.max(h, 0.6)}
              fill={`url(#${gradId})`}
              rx={0.6}
            >
              <title>
                {p.label}: {formatCompactNumber(p.value)}
              </title>
            </rect>
          );
        })}
      </svg>
      <div className={styles.axis}>
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
