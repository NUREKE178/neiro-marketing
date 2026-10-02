import { useLanguage } from "../i18n/LanguageContext";
import { LANGUAGES } from "../i18n/translations";
import styles from "./LanguageToggle.module.css";

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const index = LANGUAGES.findIndex((l) => l.code === lang);

  function cycle() {
    const next = LANGUAGES[(index + 1) % LANGUAGES.length];
    setLang(next.code);
  }

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={cycle}
      title={t("settings.language")}
      data-testid="language-toggle"
    >
      {LANGUAGES[index].label}
    </button>
  );
}
