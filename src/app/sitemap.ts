import type { MetadataRoute } from 'next'
import { cityRecords, guideRecords } from '@/lib/data/mock-data'
import { firebasePlaceRepository } from '@/lib/data/firebase-place-repository'
import { locales } from '@/lib/i18n/config'
import { route } from '@/lib/routes'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = []
  for (const locale of locales) {
    pages.push({ path: route.home(locale), priority: 1, changeFrequency: 'weekly' })
    pages.push({ path: route.guides(locale), priority: .8, changeFrequency: 'weekly' })
    for (const key of ['about', 'contact', 'privacy', 'cookies', 'legal', 'terms'] as const) pages.push({ path: route.page(locale, key), priority: .3, changeFrequency: 'yearly' })
    for (const city of cityRecords) {
      const places = await firebasePlaceRepository.listPlaces(locale, city.id)
      const categories = [...new Map(places.map((place) => [place.category.id, place.category])).values()]
      pages.push({ path: route.city(locale, city.slug[locale]), priority: .9, changeFrequency: 'weekly' })
      pages.push({ path: route.places(locale, city.slug[locale]), priority: .8, changeFrequency: 'weekly' })
      pages.push({ path: route.guides(locale, city.slug[locale]), priority: .75, changeFrequency: 'weekly' })
      for (const category of categories) pages.push({ path: route.category(locale, city.slug[locale], category.slug[locale]), priority: .65, changeFrequency: 'weekly' })
      for (const place of places) pages.push({ path: route.place(locale, city.slug[locale], place.slug), priority: .85, changeFrequency: 'monthly' })
      for (const guide of guideRecords.filter((item) => item.cityId === city.id)) pages.push({ path: route.guide(locale, city.slug[locale], guide.slug[locale]), priority: .8, changeFrequency: 'monthly' })
    }
  }
  return pages.map((page) => ({ url: `${SITE_URL}${page.path}`, changeFrequency: page.changeFrequency, priority: page.priority }))
}
