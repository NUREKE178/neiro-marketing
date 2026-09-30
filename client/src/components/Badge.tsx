import type { HTMLAttributes } from "react";
import styles from "./Badge.module.css";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "primary" | "secondary" | "accent" | "lime" | "ink" | "danger" | "outline";
}

export function Badge({ tone = "outline", className, children, ...rest }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </span>
  );
}
