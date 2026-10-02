import kk from './kk.json'
import ru from './ru.json'
import en from './en.json'
import { useState, useEffect } from 'react'

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
  // Use fixed formatting to avoid hydration mismatch - always use en-US base then replace
  // Server and client will produce same output for same locale
  try {
    if (num >= 10000) {
      if (locale === 'kk') {
        if (num >= 1000000) {
          const formatted = new Intl.NumberFormat('kk-KZ', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
          return formatted.replace('М', ' млн').replace('K', ' мың')
        }
        return new Intl.NumberFormat('kk-KZ', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
      }
      return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(num)
    }
    
    if (locale === 'kk') {
      return new Intl.NumberFormat('kk-KZ').format(num).replace(/,/g, ' ')
    }
    return new Intl.NumberFormat(locale).format(num)
  } catch {
    // Fallback deterministic formatting if Intl fails
    if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num/1000).toFixed(1)}K`
    return num.toString()
  }
}

// Fixed date formatting to avoid hydration mismatch - always ISO or fixed locale
export function formatDateSafe(date: Date | string | null, locale: Locale = 'kk'): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    // Use fixed format YYYY-MM-DD to ensure server/client match
    return d.toISOString().split('T')[0]
  } catch {
    return '—'
  }
}

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('kk')
  
  useEffect(() => {
    // Only read localStorage after mount to avoid hydration mismatch
    const stored = localStorage.getItem('locale') as Locale
    if (stored && ['kk', 'ru', 'en'].includes(stored)) {
      setLocale(stored)
    }
  }, [])
  
  return locale
}

// Hook version that also provides setter
export function useLocaleWithSetter(): [Locale, (l: Locale) => void] {
  const [locale, setLocaleState] = useState<Locale>('kk')
  
  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale
    if (stored && ['kk', 'ru', 'en'].includes(stored)) {
      setLocaleState(stored)
    }
  }, [])
  
  const setLocale = (l: Locale) => {
    localStorage.setItem('locale', l)
    setLocaleState(l)
  }
  
  return [locale, setLocale]
}
