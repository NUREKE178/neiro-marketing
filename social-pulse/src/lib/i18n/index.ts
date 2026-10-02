import kk from './kk.json'
import ru from './ru.json'
import en from './en.json'

type Locale = 'kk' | 'ru' | 'en'

const translations: Record<Locale, any> = { kk, ru, en }

export function getTranslations(locale: Locale = 'kk') {
  return translations[locale] || translations.kk
}

export function t(key: string, locale: Locale = 'kk', params?: Record<string, any>): string {
  const keys = key.split('.')
  let value: any = getTranslations(locale)
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // fallback to kk
      let fallback: any = translations.kk
      for (const fk of keys) {
        fallback = fallback?.[fk]
      }
      value = fallback
      break
    }
  }
  
  if (typeof value !== 'string') {
    return key // return key if not found
  }
  
  // Replace {{param}} placeholders
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, p) => params[p]?.toString() || `{{${p}}}`)
  }
  
  return value
}

export function formatNumberLocale(num: number, locale: Locale = 'kk'): string {
  if (num >= 10000) {
    // Compact notation
    if (locale === 'kk') {
      if (num >= 1000000) {
        return new Intl.NumberFormat('kk-KZ', { notation: 'compact', maximumFractionDigits: 1 }).format(num).replace('М', ' млн').replace('K', ' мың')
      }
      // kk uses space as thousands separator, but compact
      return new Intl.NumberFormat('kk-KZ', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
    }
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(num)
  }
  
  // Normal formatting with locale
  if (locale === 'kk') {
    return new Intl.NumberFormat('kk-KZ').format(num).replace(/,/g, ' ')
  }
  return new Intl.NumberFormat(locale).format(num)
}

export function useLocale(): Locale {
  // In production, get from user settings, cookie, or Accept-Language
  // For now, default to kk
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale') as Locale
    if (stored && ['kk', 'ru', 'en'].includes(stored)) return stored
  }
  return 'kk'
}
