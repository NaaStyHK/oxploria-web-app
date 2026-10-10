import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n/config'
import { siteUrlFromEnvironment } from '@/lib/site-url'

export const SITE_URL = siteUrlFromEnvironment()

export function localizedMetadata(locale: Locale, pathByLocale: Record<Locale, string>, title: string, description: string, image = '/og-image.png', type: 'website' | 'article' = 'website'): Metadata {
  const canonical = `${SITE_URL}${pathByLocale[locale]}`
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        fr: `${SITE_URL}${pathByLocale.fr}`,
        es: `${SITE_URL}${pathByLocale.es}`,
        en: `${SITE_URL}${pathByLocale.en}`,
        'x-default': `${SITE_URL}${pathByLocale.en}`,
      },
    },
    openGraph: { title, description, url: canonical, type, siteName: 'Oxploria', locale: locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_GB', alternateLocale: ['fr_FR', 'es_ES', 'en_GB'].filter((item) => item !== (locale === 'fr' ? 'fr_FR' : locale === 'es' ? 'es_ES' : 'en_GB')), images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
