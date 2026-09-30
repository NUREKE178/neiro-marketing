import { NavLink } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./NavBar.module.css";

const links: { to: string; key: string; end?: boolean }[] = [
  { to: "/", key: "nav.home", end: true },
  { to: "/discover", key: "nav.discover" },
  { to: "/leaderboard", key: "nav.leaderboard" },
];

export function NavBar() {
  const { t } = useLanguage();

  return (
    <header className={styles.header}>
      <div className={[styles.inner, "container"].join(" ")}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoMark}>N</span>
          NEIRO
        </NavLink>
        <div className={styles.right}>
          <nav className={styles.nav}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => [styles.link, isActive ? styles.active : ""].join(" ")}
              >
                {t(l.key)}
              </NavLink>
            ))}
          </nav>
          <div className={styles.controls}>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
