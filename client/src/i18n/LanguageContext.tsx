import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { dictionaries } from "./translations";
import type { Lang } from "./translations";

const STORAGE_KEY = "neiro-lang";

// Kazakh is the platform's primary language regardless of browser locale —
// Russian/English are opt-in via the switcher, not auto-detected, so the
// site doesn't silently switch language for KZ visitors on non-kk devices.
function detectDefaultLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "kk" || saved === "ru" || saved === "en") return saved;
  } catch {
    // localStorage unavailable (private mode, etc.)
  }
  return "kk";
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectDefaultLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore — per-viewer convenience only
    }
  }, [lang]);

  const t = useMemo(() => {
    const dict = dictionaries[lang];
    return (key: string, vars?: Record<string, string | number>) => {
      let str = dict[key] ?? dictionaries.kk[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v));
        }
      }
      return str;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
