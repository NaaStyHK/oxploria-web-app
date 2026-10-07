import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n/config'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.oxploria.com'

export function localizedMetadata(locale: Locale, pathByLocale: Record<Locale, string>, title: string, description: string, image = '/og-image.png'): Metadata {
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
    openGraph: { title, description, url: canonical, type: 'website', siteName: 'Oxploria', images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}
