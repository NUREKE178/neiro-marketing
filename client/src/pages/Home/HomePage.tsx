import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { SegmentedControl } from "../../components/SegmentedControl";
import { PlatformIcon } from "../../components/PlatformIcon";
import { extractHandle } from "../../lib/handle";
import { useLanguage } from "../../i18n/LanguageContext";
import type { Platform } from "../../lib/api";
import styles from "./HomePage.module.css";

type Mode = "analyze" | "discover";

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>("analyze");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value) {
      setTouched(true);
      return;
    }

    if (mode === "analyze") {
      const username = extractHandle(platform, value);
      navigate(`/analyze/${platform}/${encodeURIComponent(username)}`);
    } else {
      navigate(`/discover?keyword=${encodeURIComponent(value)}`);
    }
  }

  return (
    <div>
      <section className={styles.hero}>
        <div className={[styles.heroInner, "container"].join(" ")}>
          <span className={styles.kicker}>{t("home.kicker")}</span>
          <h1 className={styles.title}>
            {t("home.titleBefore")} <span className={styles.highlight}>{t("home.titleHighlight")}</span>{" "}
            {t("home.titleAfter")}
          </h1>
          <p className={styles.subtitle}>{t("home.subtitle")}</p>

          <Card padding="lg" className={styles.searchCard}>
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={[
                { value: "analyze", label: t("home.modeAnalyze") },
                { value: "discover", label: t("home.modeDiscover") },
              ]}
            />

            <form onSubmit={onSubmit} className={styles.form}>
              <div className={styles.platformRow}>
                <SegmentedControl
                  value={platform}
                  onChange={setPlatform}
                  tint="accent"
                  options={[
                    { value: "instagram", label: "Instagram", icon: <PlatformIcon platform="instagram" size={16} /> },
                    { value: "tiktok", label: "TikTok", icon: <PlatformIcon platform="tiktok" size={16} /> },
                  ]}
                />
                {mode === "discover" && <span className={styles.hint}>{t("home.discoverHint")}</span>}
              </div>

              <div className={styles.inputRow}>
                <Input
                  size="lg"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setTouched(false);
                  }}
                  placeholder={mode === "analyze" ? t("home.placeholderAnalyze") : t("home.placeholderDiscover")}
                  aria-invalid={touched}
                />
                <Button type="submit" size="lg" variant={mode === "analyze" ? "primary" : "secondary"}>
                  {mode === "analyze" ? t("home.btnAnalyze") : t("home.btnDiscover")}
                </Button>
              </div>
              {touched && <p className={styles.error}>{t("home.errorEmpty")}</p>}
            </form>
          </Card>
        </div>
      </section>

      <section className={[styles.features, "container"].join(" ")}>
        <Card tint="primary" padding="lg">
          <h3 className={styles.featureTitle}>{t("home.feature1Title")}</h3>
          <p className={styles.featureText}>{t("home.feature1Text")}</p>
        </Card>
        <Card tint="secondary" padding="lg">
          <h3 className={styles.featureTitle}>{t("home.feature2Title")}</h3>
          <p className={styles.featureText}>{t("home.feature2Text")}</p>
        </Card>
        <Card tint="accent" padding="lg">
          <h3 className={styles.featureTitle}>{t("home.feature3Title")}</h3>
          <p className={styles.featureText}>{t("home.feature3Text")}</p>
        </Card>
      </section>
    </div>
  );
}
