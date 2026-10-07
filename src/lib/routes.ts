import type { Locale } from '@/lib/i18n/config'

export const segments = {
  map: { fr: 'carte', es: 'mapa', en: 'map' },
  places: { fr: 'lieux', es: 'lugares', en: 'places' },
  categories: { fr: 'categories', es: 'categorias', en: 'categories' },
  guides: { fr: 'guides', es: 'guias', en: 'guides' },
  search: { fr: 'recherche', es: 'buscar', en: 'search' },
  about: { fr: 'a-propos', es: 'acerca', en: 'about' },
  contact: { fr: 'contact', es: 'contacto', en: 'contact' },
  privacy: { fr: 'confidentialite', es: 'privacidad', en: 'privacy' },
  cookies: { fr: 'cookies', es: 'cookies', en: 'cookies' },
  legal: { fr: 'mentions-legales', es: 'legal', en: 'legal' },
  terms: { fr: 'conditions', es: 'condiciones', en: 'terms' },
} as const

export type SegmentKey = keyof typeof segments

export function localizedSegment(key: SegmentKey, locale: Locale): string {
  return segments[key][locale]
}

export const route = {
  home: (locale: Locale) => `/${locale}`,
  city: (locale: Locale, citySlug: string) => `/${locale}/${citySlug}`,
  map: (locale: Locale, citySlug: string) => `/${locale}/${citySlug}/${segments.map[locale]}`,
  places: (locale: Locale, citySlug: string) => `/${locale}/${citySlug}/${segments.places[locale]}`,
  place: (locale: Locale, citySlug: string, placeSlug: string) => `/${locale}/${citySlug}/${segments.places[locale]}/${encodeURIComponent(placeSlug)}`,
  category: (locale: Locale, citySlug: string, categorySlug: string) => `/${locale}/${citySlug}/${segments.categories[locale]}/${categorySlug}`,
  guides: (locale: Locale, citySlug?: string) => citySlug ? `/${locale}/${citySlug}/${segments.guides[locale]}` : `/${locale}/${segments.guides[locale]}`,
  guide: (locale: Locale, citySlug: string, guideSlug: string) => `/${locale}/${citySlug}/${segments.guides[locale]}/${guideSlug}`,
  search: (locale: Locale) => `/${locale}/${segments.search[locale]}`,
  page: (locale: Locale, key: Extract<SegmentKey, 'about' | 'contact' | 'privacy' | 'cookies' | 'legal' | 'terms'>) => `/${locale}/${segments[key][locale]}`,
}
