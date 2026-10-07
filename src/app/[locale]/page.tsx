import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'
import { CityCard } from '@/components/city-card'
import { GuideCard } from '@/components/guide-card'
import { HomeLocationButton } from '@/components/home-location-button'
import { PlaceCard } from '@/components/place-card'
import { RouteGraphic } from '@/components/route-graphic'
import { getCityById, mockRepository } from '@/lib/data/mock-repository'
import { firebasePlaceRepository } from '@/lib/data/firebase-place-repository'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { route } from '@/lib/routes'
import { localizedMetadata } from '@/lib/seo'

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
  const t = getDictionary(locale)
  const cities = mockRepository.listCities(locale)
  const barcelona = cities[0]
  const cityPlaceGroups = await Promise.all(cities.map((city) => firebasePlaceRepository.listPlaces(locale, city.id)))
  const barcelonaPlaces = cityPlaceGroups[0]
  const places = barcelonaPlaces.filter((place) => place.featured).slice(0, 4)
  const categories = [...new Map(barcelonaPlaces.map((place) => [place.category.id, place.category])).values()]
  const guides = mockRepository.listGuides(locale)
  return <main>
    <section className="hero"><div className="container hero-grid">
      <div><h1 className="hero-title">{t.home.title}</h1><p className="hero-copy">{t.home.intro}</p><div className="hero-actions"><HomeLocationButton locale={locale} cities={cities} label={t.home.nearMe} locatingLabel={t.map.locating} /><Link className="button button-light" href={route.map(locale, barcelona.slug)}><MapPin size={19} />{t.home.exploreBarcelona}</Link></div></div>
      <div className="hero-map-card" aria-hidden="true"><svg className="hero-map-lines" viewBox="0 0 520 430" preserveAspectRatio="xMidYMid slice"><path d="M-30 108 94 85l52 45 88-12 35-69 112 29 48 80 123-22M-20 294l125-28 41-93 108 75 89-49 58 80 140-34M85-20l39 109-33 103 78 96-30 164M317-20l-48 69 23 129 51 76-32 198M451-20l-22 122 41 103-29 127 42 120" fill="none" stroke="rgba(255,255,255,.24)" strokeWidth="2"/><path d="M48 350c65-45 64-137 134-157 82-23 92 53 152 20 46-26 41-104 129-123" fill="none" stroke="#FFD400" strokeWidth="6" strokeLinecap="round"/><g transform="translate(321 198)"><path d="M0-25c-14 0-25 11-25 25 0 17 25 39 25 39S25 17 25 0C25-14 14-25 0-25Z" fill="#FFD400"/><circle r="9" fill="#151515"/></g></svg><div className="hero-map-copy"><div className="hero-promise">{t.home.promise}</div><span className="mono">41.3874° N<br/>2.1686° E</span></div></div>
    </div></section>

    <section className="section" id="cities"><div className="container"><div className="section-heading"><h2>{t.home.citiesTitle}</h2></div><div className="city-grid">{cities.map((city, index) => <CityCard key={city.id} city={city} locale={locale} count={cityPlaceGroups[index].length} />)}</div></div></section>

    <section className="section-tight"><div className="container"><div className="section-heading"><h2>{t.home.popularTitle}</h2><Link className="button button-light button-small" href={route.places(locale, barcelona.slug)}>{t.common.viewAll}<ArrowRight size={17}/></Link></div><div className="place-grid">{places.map((place) => <PlaceCard key={place.id} place={place} locale={locale} />)}</div></div></section>

    <section className="section-tight"><div className="container"><div className="section-heading"><h2>{t.home.categoriesTitle}</h2></div><div className="category-strip">{categories.map((category) => <Link className="chip" key={category.id} href={route.category(locale, barcelona.slug, category.slug[locale])}>{category.name[locale]}</Link>)}</div></div></section>

    <section className="section"><div className="container route-statement"><div><h2>{t.home.methodTitle}</h2><p>{t.home.methodBody}</p><Link className="button button-primary" href={route.map(locale, barcelona.slug)}>{t.nav.explore}<ArrowRight size={18}/></Link></div><RouteGraphic label={t.home.methodTitle} /></div></section>

    <section className="section-tight"><div className="container"><div className="section-heading"><h2>{t.home.guidesTitle}</h2><Link href={route.guides(locale)} className="button button-light button-small">{t.common.viewAll}<ArrowRight size={17}/></Link></div><div className="guide-grid">{guides.map((guide) => { const city = getCityById(guide.cityId, locale); return city ? <GuideCard key={guide.id} guide={guide} city={city} locale={locale} /> : null })}</div></div></section>
  </main>
}

export function generateStaticParams() { return locales.map((locale) => ({ locale })) }
