import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowRight, Compass, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'
import { GuideCard } from '@/components/guide-card'
import { LegalPage } from '@/components/legal-page'
import { DiscoveryRail } from '@/components/discovery-rail'
import { SearchExperience } from '@/components/search-experience'
import { SafeImage } from '@/components/safe-image'
import { CityNearby } from '@/components/city-nearby'
import { cityRecords } from '@/lib/data/mock-data'
import { getCityById, mockRepository } from '@/lib/data/mock-repository'
import { firebasePlaceRepository } from '@/lib/data/firebase-place-repository'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { route, segments } from '@/lib/routes'
import { localizedMetadata } from '@/lib/seo'
import { getLegalDocument } from '@/lib/legal-content'
import { legalConfig } from '@/lib/legal-config'
import { hasEditorialCollection, isGoingOutPlace, markerIconPath, markerTypeForCategoryId } from '@/lib/place-taxonomy'

type Props = { params: Promise<{ locale: string; city: string }> }
export const dynamicParams = false
const topPages = ['guides', 'search', 'about', 'contact', 'privacy', 'cookies', 'legal', 'terms'] as const
type TopPage = (typeof topPages)[number]
function topPageForSlug(slug: string, locale: Locale): TopPage | null { return topPages.find((key) => segments[key][locale] === slug) ?? null }
export function generateStaticParams() { return locales.flatMap((locale) => [...cityRecords.map((city) => ({ locale, city: city.slug[locale] })), ...topPages.map((key) => ({ locale, city: segments[key][locale] }))]) }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value, city: slug } = await params
  if (!isLocale(value)) return {}
  const city = mockRepository.getCityBySlug(slug, value)
  const t = getDictionary(value)
  if (!city) {
    const page = topPageForSlug(slug, value)
    if (!page) return {}
    const paths = Object.fromEntries(locales.map((locale) => [locale, page === 'guides' ? route.guides(locale) : page === 'search' ? route.search(locale) : route.page(locale, page)])) as Record<Locale, string>
    const titles: Record<TopPage, string> = { guides: t.guides.title, search: t.search.title, about: getLegalDocument(value, 'about').title, contact: getLegalDocument(value, 'contact').title, privacy: getLegalDocument(value, 'privacy').title, cookies: getLegalDocument(value, 'cookies').title, legal: getLegalDocument(value, 'legal').title, terms: getLegalDocument(value, 'terms').title }
    const descriptions: Record<TopPage, string> = { guides: t.guides.intro, search: t.search.description, about: getLegalDocument(value, 'about').description, contact: getLegalDocument(value, 'contact').description, privacy: getLegalDocument(value, 'privacy').description, cookies: getLegalDocument(value, 'cookies').description, legal: getLegalDocument(value, 'legal').description, terms: getLegalDocument(value, 'terms').description }
    const metadata = localizedMetadata(value, paths, `${titles[page]} | Oxploria`, descriptions[page])
    if (page === 'search') return { ...metadata, robots: { index: false, follow: true } }
    if (page !== 'guides') {
      const canonical = `${legalConfig.publicSiteUrl}${paths[value]}`
      return {
        ...metadata,
        alternates: { canonical, languages: { fr: `${legalConfig.publicSiteUrl}${paths.fr}`, es: `${legalConfig.publicSiteUrl}${paths.es}`, en: `${legalConfig.publicSiteUrl}${paths.en}`, 'x-default': `${legalConfig.publicSiteUrl}${paths.en}` } },
        openGraph: { ...metadata.openGraph, url: canonical },
      }
    }
    return metadata
  }
  const record = cityRecords.find((item) => item.id === city.id)!
  const paths = Object.fromEntries(locales.map((locale) => [locale, route.city(locale, record.slug[locale])])) as Record<Locale, string>
  return localizedMetadata(value, paths, `${city.name} — Oxploria`, t.metadata.cityDescription.replace('{city}', city.name), city.image)
}

export default async function CityPage({ params }: Props) {
  const { locale: value, city: slug } = await params
  if (!isLocale(value)) notFound()
  const city = mockRepository.getCityBySlug(slug, value)
  const t = getDictionary(value)
  if (!city) {
    const page = topPageForSlug(slug, value)
    if (!page) notFound()
    if (page === 'guides') {
      const guides = mockRepository.listGuides(value)
      return <main id="main-content" className="page-shell"><section className="page-hero"><div className="container"><h1>{t.guides.title}</h1><p>{t.guides.intro}</p></div></section><section className="section-tight"><div className="container"><div className="guide-grid">{guides.map((guide) => { const guideCity = getCityById(guide.cityId, value); return guideCity ? <GuideCard key={guide.id} guide={guide} city={guideCity} locale={value}/> : null })}</div></div></section></main>
    }
    if (page === 'search') return <main id="main-content" className="page-shell"><section className="page-hero"><div className="container"><h1>{t.search.title}</h1><p>{t.search.description}</p></div></section><section className="section-tight"><div className="container"><SearchExperience locale={value} places={await firebasePlaceRepository.listPlaceSummaries(value)}/></div></section></main>
    return <LegalPage locale={value} page={page}/>
  }
  const places = await firebasePlaceRepository.listPlaceSummaries(value, city.id)
  const guides = mockRepository.listGuides(value, city.id)
  const categories = [...new Map(places.map((place) => [place.category.id, place.category])).values()]
  const mustSees = places.filter((place) => hasEditorialCollection(place, 'Incontournables')).slice(0, 8)
  const family = places.filter((place) => hasEditorialCollection(place, 'En famille')).slice(0, 8)
  const goingOut = places.filter(isGoingOutPlace).slice(0, 8)
  const allPlacesAction = { href: route.places(value, city.slug), label: t.common.viewAll }
  const coordinatesLabel = `${Math.abs(city.coordinates.latitude).toFixed(4)}° ${city.coordinates.latitude >= 0 ? 'N' : 'S'} · ${Math.abs(city.coordinates.longitude).toFixed(4)}° ${city.coordinates.longitude >= 0 ? 'E' : 'W'}`
  return <main id="main-content">
    <section className="city-hero"><SafeImage src={city.image} alt="" fill preload sizes="100vw" fallbackLabel={t.places.photoUnavailable} /><div className="container city-hero-content"><span className="mono">{city.country} · {places.length} {t.city.places}</span><h1>{city.name}</h1><p>{city.description}</p><nav className="city-mode-switch" aria-label={t.city.viewNavigation}><Link href={route.city(value, city.slug)} aria-current="page"><Compass size={18} aria-hidden="true" />{t.nav.explore}</Link><Link href={route.map(value, city.slug)}><MapPin size={18} aria-hidden="true" />{t.nav.map}</Link></nav><div className="page-hero-actions"><Link className="button button-primary" href="#discover"><Compass size={19} aria-hidden="true" />{t.city.startExploring}</Link><Link className="button button-light" href={route.places(value, city.slug)}>{t.places.title}<ArrowRight size={18} aria-hidden="true" /></Link></div></div></section>
    <section className="explorer-intro" id="discover"><div className="container"><h2>{t.city.exploreTitle.replace('{city}', city.name)}</h2><p>{t.city.exploreBody}</p><div className="explorer-coordinate"><span className="explorer-route-line" aria-hidden="true"><span className="route-dot" /></span><span className="mono">{coordinatesLabel}</span><Link href={route.map(value, city.slug)}>{t.city.exploreMap}<ArrowRight size={16} aria-hidden="true" /></Link></div></div></section>
    <CityNearby locale={value} city={city} places={places}/>
    <DiscoveryRail locale={value} title={t.city.popular} body={t.city.popularBody} items={mustSees.map((place) => ({ place }))} action={allPlacesAction} />
    <DiscoveryRail locale={value} title={t.city.family} body={t.city.familyBody} items={family.map((place) => ({ place }))} action={allPlacesAction} />
    <DiscoveryRail locale={value} title={t.city.goingOut} body={t.city.goingOutBody} items={goingOut.map((place) => ({ place }))} action={allPlacesAction} tone="dark" />
    <section className="section-tight"><div className="container"><div className="section-heading"><h2>{t.city.categories}</h2></div><div className="category-strip">{categories.map((category) => { const icon = markerIconPath(markerTypeForCategoryId(category.id)); return <Link key={category.id} className="chip" href={route.category(value, city.slug, category.slug[value])}><span className="marker-type-icon" style={{ '--marker-icon': `url(${icon})` } as CSSProperties} aria-hidden="true" />{category.name[value]}</Link> })}</div></div></section>
    {guides.length > 0 && <section className="section"><div className="container"><div className="section-heading"><h2>{t.city.guides}</h2><Link className="button button-light button-small" href={route.guides(value, city.slug)}>{t.common.viewAll}<ArrowRight size={17}/></Link></div><div className="guide-grid">{guides.map((guide) => <GuideCard key={guide.id} guide={guide} city={city} locale={value} />)}</div></div></section>}
  </main>
}
