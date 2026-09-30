import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { SegmentedControl } from "../../components/SegmentedControl";
import { PlatformIcon } from "../../components/PlatformIcon";
import { extractHandle } from "../../lib/handle";
import type { Platform } from "../../lib/api";
import styles from "./HomePage.module.css";

type Mode = "analyze" | "discover";

export function HomePage() {
  const navigate = useNavigate();
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
          <span className={styles.kicker}>КРЕАТОР АНАЛИТИКАСЫ · KZ</span>
          <h1 className={styles.title}>
            Аймағыңдағы ең <span className={styles.highlight}>күшті креаторды</span> тап
          </h1>
          <p className={styles.subtitle}>
            Instagram/TikTok аккаунтын талда — видеолардың views/likes статистикасын көр. Немесе ниша бойынша
            іздеп, өз өңіріңдегі белсенді блогерлерден таңда.
          </p>

          <Card padding="lg" className={styles.searchCard}>
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={[
                { value: "analyze", label: "Аккаунтты талда" },
                { value: "discover", label: "Креатор ізде" },
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
                {mode === "discover" && <span className={styles.hint}>ниша барлық платформалардан ізделеді</span>}
              </div>

              <div className={styles.inputRow}>
                <Input
                  size="lg"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setTouched(false);
                  }}
                  placeholder={
                    mode === "analyze" ? "@username немесе профиль сілтемесі" : "мысалы: ойыншық, сұлулық, ресторан…"
                  }
                  aria-invalid={touched}
                />
                <Button type="submit" size="lg" variant={mode === "analyze" ? "primary" : "secondary"}>
                  {mode === "analyze" ? "Талдау" : "Іздеу"}
                </Button>
              </div>
              {touched && <p className={styles.error}>Алдымен нені іздейтініңізді жазыңыз.</p>}
            </form>
          </Card>
        </div>
      </section>

      <section className={[styles.features, "container"].join(" ")}>
        <Card tint="primary" padding="lg">
          <h3 className={styles.featureTitle}>Толық видео статистика</h3>
          <p className={styles.featureText}>
            Әр аккаунттың барлық видеосы: views, likes, comments, күні — views бойынша сұрыпталған.
          </p>
        </Card>
        <Card tint="secondary" padding="lg">
          <h3 className={styles.featureTitle}>Геолокация бойынша сәйкестік</h3>
          <p className={styles.featureText}>Іздеу кезінде орналасуыңды анықтап, сол өңірдегі креаторларды ұсынамыз.</p>
        </Card>
        <Card tint="accent" padding="lg">
          <h3 className={styles.featureTitle}>Апталық Топ-5 рейтинг</h3>
          <p className={styles.featureText}>Кез келген күн аралығында ең көп қаралым/лайк жинаған аккаунттар.</p>
        </Card>
      </section>
    </div>
  );
}
