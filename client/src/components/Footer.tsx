import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={[styles.inner, "container"].join(" ")}>
        <span>NEIRO — креатор аналитика платформасы</span>
        <span className={styles.dim}>Instagram/TikTok деректері RapidAPI арқылы</span>
      </div>
    </footer>
  );
}
