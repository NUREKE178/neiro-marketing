import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "md" | "lg";
}

export function Input({ size = "md", className, ...rest }: InputProps) {
  return <input className={[styles.input, styles[size], className].filter(Boolean).join(" ")} {...rest} />;
}
