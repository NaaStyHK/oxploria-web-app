export const locales = ['fr', 'es', 'en'] as const
export type Locale = (typeof locales)[number]

export type Localized<T = string> = Record<Locale, T>

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function getLocale(value: string): Locale | null {
  return isLocale(value) ? value : null
}
