import { Link } from "react-router-dom";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={["container", styles.page].join(" ")}>
      <EmptyState
        title="404 — бет табылмады"
        description="Бұл сілтеме дұрыс емес немесе жойылған болуы мүмкін."
        action={
          <Link to="/">
            <Button variant="primary">Басты бетке оралу</Button>
          </Link>
        }
      />
    </div>
  );
}
