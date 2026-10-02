import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tint?: "surface" | "primary" | "secondary" | "accent" | "lime" | "ink";
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
}

export function Card({
  tint = "surface",
  padding = "md",
  interactive,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[styles.card, styles[tint], styles[`pad-${padding}`], interactive ? styles.interactive : "", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
