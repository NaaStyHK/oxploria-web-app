import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomeDiscovery, type HomeCityBundle } from '@/components/home-discovery'
import { mockRepository } from '@/lib/data/mock-repository'
import { firebasePlaceRepository } from '@/lib/data/firebase-place-repository'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { localizedMetadata } from '@/lib/seo'
import { hasEditorialCollection } from '@/lib/place-taxonomy'

type Props = { params: Promise<{ locale: string }> }

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value } = await params
  if (!isLocale(value)) return {}
  const t = getDictionary(value)
  return localizedMetadata(value, { fr: '/fr', es: '/es', en: '/en' }, t.metadata.homeTitle, t.metadata.homeDescription)
}

export default async function HomePage({ params }: Props) {
  const { locale: value } = await params
  if (!isLocale(value)) notFound()
  const locale: Locale = value
  const cities = mockRepository.listCities(locale)
  const cityPlaceGroups = await Promise.all(cities.map((city) => firebasePlaceRepository.listPlaceSummaries(locale, city.id)))
  const guides = mockRepository.listGuides(locale)
  const cityBundles: HomeCityBundle[] = cities.map((city, index) => {
    const places = cityPlaceGroups[index]
    return {
      city,
      count: places.length,
      mustSees: places.filter((place) => hasEditorialCollection(place, 'Incontournables')).slice(0, 4),
      family: places.filter((place) => hasEditorialCollection(place, 'En famille')).slice(0, 4),
      categories: [...new Map(places.map((place) => [place.category.id, place.category])).values()],
    }
  })
  return <HomeDiscovery locale={locale} cityBundles={cityBundles} guides={guides} />
}

export function generateStaticParams() { return locales.map((locale) => ({ locale })) }
