import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Badge } from "../../components/Badge";
import { Spinner } from "../../components/Spinner";
import { useLanguage } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import type { Test } from "../../lib/api";
import { formatDate } from "../../lib/format";
import styles from "./HomePage.module.css";

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [touched, setTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<Test[] | null>(null);

  useEffect(() => {
    api.tests
      .list()
      .then((r) => setTests(r.tests))
      .catch(() => setTests([]));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setTouched(true);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const { test } = await api.tests.create(title.trim(), goal.trim());
      navigate(`/tests/${test.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
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
            <form onSubmit={onSubmit} className={styles.form}>
              <Input
                size="lg"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTouched(false);
                }}
                placeholder={t("home.titlePlaceholder")}
                aria-invalid={touched}
              />
              <textarea
                className={styles.goalInput}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={t("home.goalPlaceholder")}
                rows={2}
              />
              <Button type="submit" size="lg" variant="primary" disabled={creating}>
                {creating ? <Spinner /> : t("home.createBtn")}
              </Button>
              {touched && <p className={styles.error}>{t("home.errorEmpty")}</p>}
              {error && <p className={styles.error}>{error}</p>}
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

      <section className={["container", styles.testsSection].join(" ")}>
        <h2 className={styles.testsTitle}>{t("home.myTests")}</h2>
        {tests === null ? (
          <Spinner />
        ) : tests.length === 0 ? (
          <p className={styles.testsEmpty}>{t("home.myTestsEmpty")}</p>
        ) : (
          <div className={styles.testsList}>
            {tests.map((test) => (
              <Card
                key={test.id}
                padding="md"
                interactive
                className={styles.testCard}
                onClick={() => navigate(`/tests/${test.id}`)}
              >
                <div className={styles.testCardHead}>
                  <span className={styles.testCardTitle}>{test.title}</span>
                  <Badge tone={test.status === "closed" ? "ink" : test.status === "active" ? "lime" : "outline"}>
                    {t(`home.status.${test.status}`)}
                  </Badge>
                </div>
                {test.goal && <p className={styles.testCardGoal}>{test.goal}</p>}
                <span className={styles.testCardDate}>{formatDate(test.created_at)}</span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
