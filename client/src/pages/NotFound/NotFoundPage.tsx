import { Link } from "react-router-dom";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { useLanguage } from "../../i18n/LanguageContext";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div className={["container", styles.page].join(" ")}>
      <EmptyState
        title={t("notfound.title")}
        description={t("notfound.desc")}
        action={
          <Link to="/">
            <Button variant="primary">{t("notfound.action")}</Button>
          </Link>
        }
      />
    </div>
  );
}
