import { useLanguage } from "../i18n/LanguageContext";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className={styles.footer}>
      <div className={[styles.inner, "container"].join(" ")}>
        <span>{t("footer.tagline")}</span>
        <span className={styles.dim}>{t("footer.source")}</span>
      </div>
    </footer>
  );
}
