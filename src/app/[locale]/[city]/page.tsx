import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'
import { GuideCard } from '@/components/guide-card'
import { LegalPage } from '@/components/legal-page'
import { PlaceCard } from '@/components/place-card'
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
    const titles: Record<TopPage, string> = { guides: t.guides.title, search: t.search.title, about: t.legal.aboutTitle, contact: t.legal.contactTitle, privacy: t.legal.privacyTitle, cookies: t.legal.cookiesTitle, legal: t.legal.legalTitle, terms: t.legal.termsTitle }
    const descriptions: Record<TopPage, string> = { guides: t.guides.intro, search: t.search.description, about: t.legal.aboutBody, contact: t.legal.contactBody, privacy: t.legal.privacyBody, cookies: t.legal.cookiesBody, legal: t.legal.legalBody, terms: t.legal.termsBody }
    const metadata = localizedMetadata(value, paths, `${titles[page]} | Oxploria`, descriptions[page])
    return page === 'search' ? { ...metadata, robots: { index: false, follow: true } } : metadata
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
      return <main className="page-shell"><section className="page-hero"><div className="container"><h1>{t.guides.title}</h1><p>{t.guides.intro}</p></div></section><section className="section-tight"><div className="container"><div className="guide-grid">{guides.map((guide) => { const guideCity = getCityById(guide.cityId, value); return guideCity ? <GuideCard key={guide.id} guide={guide} city={guideCity} locale={value}/> : null })}</div></div></section></main>
    }
    if (page === 'search') return <main className="page-shell"><section className="page-hero"><div className="container"><h1>{t.search.title}</h1><p>{t.search.description}</p></div></section><section className="section-tight"><div className="container"><SearchExperience locale={value} places={await firebasePlaceRepository.listPlaces(value)}/></div></section></main>
    return <LegalPage locale={value} page={page}/>
  }
  const places = await firebasePlaceRepository.listPlaces(value, city.id)
  const guides = mockRepository.listGuides(value, city.id)
  const categories = [...new Map(places.map((place) => [place.category.id, place.category])).values()]
  const mustSees = places.filter((place) => place.collections.includes('Incontournables'))
  const editorial = places.filter((place) => !place.collections.includes('Incontournables')).slice(0, 3)
  return <main>
    <section className="city-hero"><SafeImage src={city.image} alt="" fill preload sizes="100vw" fallbackLabel={t.places.photoUnavailable} /><div className="container city-hero-content"><span className="mono">{city.country} · {places.length} {t.city.places}</span><h1>{city.name}</h1><p>{city.description}</p><div className="page-hero-actions"><Link className="button button-primary" href={route.map(value, city.slug)}><MapPin size={19}/>{t.city.exploreMap}</Link><Link className="button button-light" href={route.places(value, city.slug)}>{t.places.title}<ArrowRight size={18}/></Link></div></div></section>
    <section className="section"><div className="container"><div className="section-heading"><h2>{t.city.popular}</h2><Link className="button button-light button-small" href={route.places(value, city.slug)}>{t.common.viewAll}<ArrowRight size={17}/></Link></div><div className="place-grid">{mustSees.map((place) => <PlaceCard key={place.id} place={place} locale={value} showCity={false} />)}</div></div></section>
    {editorial.length > 0 && <section className="section city-editorial"><div className="container"><div className="section-heading"><div><span className="mono section-kicker">OXPLORIA</span><h2>{t.city.editorial}</h2><p>{t.city.editorialBody}</p></div><Link className="button button-light button-small" href={route.places(value, city.slug)}>{t.common.viewAll}<ArrowRight size={17}/></Link></div><div className="place-grid">{editorial.map((place) => <PlaceCard key={place.id} place={place} locale={value} showCity={false} />)}</div></div></section>}
    <CityNearby locale={value} city={city} places={places}/>
    <section className="section-tight"><div className="container"><div className="section-heading"><h2>{t.city.categories}</h2></div><div className="category-strip">{categories.map((category) => <Link key={category.id} className="chip" href={route.category(value, city.slug, category.slug[value])}>{category.name[value]}</Link>)}</div></div></section>
    {guides.length > 0 && <section className="section"><div className="container"><div className="section-heading"><h2>{t.city.guides}</h2><Link className="button button-light button-small" href={route.guides(value, city.slug)}>{t.common.viewAll}<ArrowRight size={17}/></Link></div><div className="guide-grid">{guides.map((guide) => <GuideCard key={guide.id} guide={guide} city={city} locale={value} />)}</div></div></section>}
  </main>
}
