import type { ReactNode } from "react";
import styles from "./StatTile.module.css";

interface StatTileProps {
  label: string;
  value: string;
  tint?: "surface" | "primary" | "secondary" | "accent" | "lime";
  icon?: ReactNode;
  sub?: string;
}

export function StatTile({ label, value, tint = "surface", icon, sub }: StatTileProps) {
  return (
    <div className={[styles.tile, styles[tint]].join(" ")}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.value}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
