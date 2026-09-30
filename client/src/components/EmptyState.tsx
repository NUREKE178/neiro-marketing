import type { ReactNode } from "react";
import { Card } from "./Card";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "surface" | "danger" | "primary";
}

export function EmptyState({ icon, title, description, action, tone = "surface" }: EmptyStateProps) {
  return (
    <Card padding="lg" className={[styles.wrap, tone === "danger" ? styles.danger : ""].join(" ")}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </Card>
  );
}
