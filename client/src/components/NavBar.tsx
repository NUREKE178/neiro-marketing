import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";

const links = [
  { to: "/", label: "Басты бет", end: true },
  { to: "/discover", label: "Іздеу" },
  { to: "/leaderboard", label: "Топ-5" },
];

export function NavBar() {
  return (
    <header className={styles.header}>
      <div className={[styles.inner, "container"].join(" ")}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoMark}>N</span>
          NEIRO
        </NavLink>
        <nav className={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => [styles.link, isActive ? styles.active : ""].join(" ")}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
