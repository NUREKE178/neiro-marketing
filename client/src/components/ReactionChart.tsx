import { useState } from "react";
import styles from "./ReactionChart.module.css";

export interface ReactionSeries {
  label: string;
  color: string;
  points: { ms: number; value: number | null }[];
}

interface ReactionChartProps {
  series: ReactionSeries[];
  maxMs: number;
  metricLabel: string;
}

const WIDTH = 600;
const HEIGHT = 220;
const PAD_LEFT = 34;
const PAD_RIGHT = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 26;

export function ReactionChart({ series, maxMs, metricLabel }: ReactionChartProps) {
  const [showTable, setShowTable] = useState(false);
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (ms: number) => PAD_LEFT + (maxMs > 0 ? (ms / maxMs) * plotW : 0);
  const y = (value: number) => PAD_TOP + (1 - value) * plotH;

  function buildPath(points: ReactionSeries["points"]): string {
    let d = "";
    let drawing = false;
    for (const p of points) {
      if (p.value === null) {
        drawing = false;
        continue;
      }
      const cmd = `${x(p.ms).toFixed(1)},${y(p.value).toFixed(1)}`;
      d += drawing ? ` L${cmd}` : ` M${cmd}`;
      drawing = true;
    }
    return d.trim();
  }

  const secondTicks = Array.from({ length: Math.floor(maxMs / 1000) + 1 }, (_, i) => i * 1000);
  const hasAnyData = series.some((s) => s.points.some((p) => p.value !== null));

  return (
    <div className={styles.wrap}>
      <div className={styles.legend}>
        {series.map((s) => (
          <span key={s.label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <button type="button" className={styles.tableToggle} onClick={() => setShowTable((v) => !v)}>
          {showTable ? "⟲ chart" : "⊞ table"}
        </button>
      </div>

      {!hasAnyData ? (
        <p className={styles.empty}>деректер жоқ</p>
      ) : showTable ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>t</th>
              {series.map((s) => (
                <th key={s.label}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {secondTicks.map((ms) => (
              <tr key={ms}>
                <td>{ms / 1000}s</td>
                {series.map((s) => {
                  const point = s.points.find((p) => p.ms === ms);
                  return <td key={s.label}>{point?.value === null || point?.value === undefined ? "—" : point.value.toFixed(2)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.svg} role="img" aria-label={metricLabel}>
          {[0, 0.5, 1].map((v) => (
            <g key={v}>
              <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y(v)} y2={y(v)} className={styles.gridline} />
              <text x={PAD_LEFT - 6} y={y(v)} className={styles.axisLabel} textAnchor="end" dominantBaseline="middle">
                {v}
              </text>
            </g>
          ))}
          {secondTicks.map((ms) => (
            <text key={ms} x={x(ms)} y={HEIGHT - 8} className={styles.axisLabel} textAnchor="middle">
              {ms / 1000}s
            </text>
          ))}

          {series.map((s) => (
            <path
              key={s.label}
              d={buildPath(s.points)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {series.map((s) =>
            s.points
              .filter((p) => p.value !== null)
              .map((p) => (
                <circle key={`${s.label}-${p.ms}`} cx={x(p.ms)} cy={y(p.value as number)} r={3} fill={s.color}>
                  <title>
                    {s.label}: {(p.value as number).toFixed(2)} ({(p.ms / 1000).toFixed(1)}s)
                  </title>
                </circle>
              )),
          )}
        </svg>
      )}
    </div>
  );
}
