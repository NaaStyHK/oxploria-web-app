import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ExploreExperience } from '@/components/map/explore-experience'
import { GuideCard } from '@/components/guide-card'
import { PlacesDirectory } from '@/components/places-directory'
import { cityRecords } from '@/lib/data/mock-data'
import { mockRepository } from '@/lib/data/mock-repository'
import { firebasePlaceRepository, listFreshPlaceSummaries } from '@/lib/data/firebase-place-repository'
import { resolveGuidePlaceIds } from '@/lib/data/guide-place-resolution'
import { getKnownPlaceCategory } from '@/lib/place-taxonomy'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { route, segments } from '@/lib/routes'
import { localizedMetadata } from '@/lib/seo'
import { parseEditorialFilter } from '@/lib/editorial-filters'

type Props = { params: Promise<{ locale: string; city: string; section: string }>; searchParams: Promise<{ place?: string; guide?: string; locate?: string; category?: string; editorial?: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((locale) => cityRecords.flatMap((city) => [segments.map[locale], segments.places[locale], segments.guides[locale]].map((section) => ({ locale, city: city.slug[locale], section }))))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale: value, city: citySlug, section } = await params
  if (!isLocale(value)) return {}
  const city = mockRepository.getCityBySlug(citySlug, value)
  if (!city) return {}
  const record = cityRecords.find((item) => item.id === city.id)!
  const t = getDictionary(value)
  if (section === segments.map[value]) {
    const paths = Object.fromEntries(locales.map((locale) => [locale, route.map(locale, record.slug[locale])])) as Record<Locale, string>
    const query = await searchParams
    return {
      ...localizedMetadata(value, paths, `${t.map.title} — ${city.name} | Oxploria`, t.metadata.mapDescription.replace('{city}', city.name)),
      ...(Object.keys(query).length > 0 ? { robots: { index: false, follow: true } } : {}),
    }
  }
  if (section === segments.places[value]) {
    const paths = Object.fromEntries(locales.map((locale) => [locale, route.places(locale, record.slug[locale])])) as Record<Locale, string>
    return localizedMetadata(value, paths, `${t.places.title} — ${city.name} | Oxploria`, t.metadata.cityDescription.replace('{city}', city.name))
  }
  if (section === segments.guides[value]) {
    const paths = Object.fromEntries(locales.map((locale) => [locale, route.guides(locale, record.slug[locale])])) as Record<Locale, string>
    return localizedMetadata(value, paths, `${t.guides.title} — ${city.name} | Oxploria`, t.metadata.guidesDescription.replace('{city}', city.name))
  }
  return {}
}

export default async function CitySectionPage({ params, searchParams }: Props) {
  const { locale: value, city: citySlug, section } = await params
  if (!isLocale(value)) notFound()
  const city = mockRepository.getCityBySlug(citySlug, value)
  if (!city) notFound()
  const t = getDictionary(value)
  if (section === segments.map[value]) {
    const query = await searchParams
    const guide = query.guide ? mockRepository.listGuides(value, city.id).find((item) => item.id === query.guide) : null
    const cityPlaces = await listFreshPlaceSummaries(value, city.id)
    const guidePlaceIds = guide ? resolveGuidePlaceIds(guide, cityPlaces) : []
    const initialPlaceId = query.place ?? guidePlaceIds[0]
    const mapPlaces = guide ? cityPlaces.filter((place) => guidePlaceIds.includes(place.id)) : cityPlaces
    const initialCategory = typeof query.category === 'string'
      ? mapPlaces.find((place) => place.category.id === query.category)?.category ?? getKnownPlaceCategory(query.category)
      : null
    const initialEditorial = parseEditorialFilter(query.editorial)
    return <main id="main-content"><h1 className="sr-only">{t.map.touristTitle.replace('{city}', city.name)}</h1><ExploreExperience locale={value} city={city} places={mapPlaces} initialPlaceId={initialPlaceId} initialCategory={initialCategory} initialEditorial={initialEditorial} collectionLabel={guide?.title} requestLocationOnMount={query.locate === '1'} /></main>
  }
  if (section === segments.places[value]) {
    const places = await firebasePlaceRepository.listPlaceSummaries(value, city.id)
    return <main id="main-content" className="page-shell"><section className="page-hero"><div className="container"><h1>{t.places.title}<br/>{city.name}</h1><p>{city.description}</p><div className="page-hero-actions"><Link className="button button-primary" href={route.map(value, city.slug)}><MapPin size={19}/>{t.city.exploreMap}</Link></div></div></section><section className="section-tight"><div className="container"><PlacesDirectory locale={value} places={places} /></div></section></main>
  }
  if (section === segments.guides[value]) {
    const guides = mockRepository.listGuides(value, city.id)
    return <main id="main-content" className="page-shell"><section className="page-hero"><div className="container"><h1>{t.guides.title}<br/>{city.name}</h1><p>{t.guides.intro}</p></div></section><section className="section-tight"><div className="container"><div className="guide-grid">{guides.map((guide) => <GuideCard key={guide.id} guide={guide} city={city} locale={value}/>)}</div></div></section></main>
  }
  notFound()
}
