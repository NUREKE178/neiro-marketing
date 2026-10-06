import { useTheme } from "../theme/ThemeContext";
import type { Theme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import styles from "./LanguageToggle.module.css";

const ORDER: Theme[] = ["system", "light", "dark"];
const ICON: Record<Theme, string> = { system: "🖥", light: "☀", dark: "🌙" };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
  }

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={cycle}
      title={`${t("settings.theme")}: ${t(`theme.${theme}`)}`}
      data-testid="theme-toggle"
    >
      {ICON[theme]}
    </button>
  );
}
