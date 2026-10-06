import styles from "./SegmentedControl.module.css";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  tint?: "primary" | "secondary" | "accent";
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  tint = "primary",
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.wrap} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          type="button"
          aria-selected={opt.value === value}
          className={[styles.segment, opt.value === value ? styles[`active-${tint}`] : ""].join(" ")}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
