'use client'

import type { CSSProperties, MouseEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpenText, Compass, LocateFixed, Map, MapPin, MousePointer2 } from 'lucide-react'
import { CityCard } from '@/components/city-card'
import { GuideCard } from '@/components/guide-card'
import { HomeLocationButton } from '@/components/home-location-button'
import { PlaceCard } from '@/components/place-card'
import { RouteGraphic } from '@/components/route-graphic'
import { readActiveCityPreference, writeActiveCityPreference } from '@/lib/browser-storage'
import { getCityById } from '@/lib/data/mock-repository'
import { getDictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { markerIconPath, markerTypeForCategoryId } from '@/lib/place-taxonomy'
import { route } from '@/lib/routes'
import type { Category, City, Guide, PlaceSummary } from '@/lib/types'

export interface HomeCityBundle {
  city: City
  count: number
  mustSees: PlaceSummary[]
  family: PlaceSummary[]
  categories: Category[]
}

export function HomeDiscovery({ locale, cityBundles, guides }: { locale: Locale; cityBundles: HomeCityBundle[]; guides: Guide[] }) {
  const t = getDictionary(locale)
  const defaultCityId = cityBundles[0]?.city.id ?? 'barcelona'
  const [activeCityId, setActiveCityId] = useState(defaultCityId)
  const activeBundle = useMemo(() => cityBundles.find(({ city }) => city.id === activeCityId) ?? cityBundles[0], [activeCityId, cityBundles])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedCityId = readActiveCityPreference(cityBundles.map(({ city }) => city.id))
      if (savedCityId) setActiveCityId(savedCityId)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [cityBundles])

  if (!activeBundle) return null
  const { city, mustSees, family, categories } = activeBundle
  const chooseCity = (cityId: string) => {
    setActiveCityId(cityId)
    writeActiveCityPreference(cityId)
  }
  const scrollToCities = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const target = document.getElementById('cities')
    if (!target) return
    event.preventDefault()
    if (window.location.hash !== '#cities') window.history.pushState(null, '', '#cities')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }
  const sectionAction = () => <Link className="discovery-action" href={route.places(locale, city.slug)}>{t.common.viewAll}<ArrowRight size={17} aria-hidden="true" /></Link>

  return <main id="main-content">
    <section className="hero"><div className="container hero-grid">
      <div className="hero-content"><span className="hero-eyebrow"><Compass size={17} aria-hidden="true" />{t.home.eyebrow}</span><h1 className="hero-title">{t.home.title}</h1><p className="hero-copy">{t.home.intro}</p><div className="hero-benefits" aria-label={t.home.benefitsLabel}><span><Map size={17} aria-hidden="true" />{t.home.benefitMap}</span><span><MapPin size={17} aria-hidden="true" />{t.home.benefitPlaces}</span><span><BookOpenText size={17} aria-hidden="true" />{t.home.benefitStories}</span></div><div className="hero-actions"><HomeLocationButton locale={locale} cities={cityBundles.map(({ city: item }) => item)} label={t.home.nearMe} locatingLabel={t.map.locating} /><Link className="button button-light" href="#cities" onClick={scrollToCities}>{t.home.chooseCity}<ArrowRight size={18} aria-hidden="true" /></Link></div></div>
      <Link className="hero-map-card" href="#cities" aria-label={`${t.home.chooseCity}: ${t.home.citiesTitle}`} onClick={scrollToCities}><svg className="hero-map-lines" viewBox="0 0 520 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-30 108 94 85l52 45 88-12 35-69 112 29 48 80 123-22M-20 294l125-28 41-93 108 75 89-49 58 80 140-34M85-20l39 109-33 103 78 96-30 164M317-20l-48 69 23 129 51 76-32 198M451-20l-22 122 41 103-29 127 42 120" fill="none" stroke="var(--line-on-dark)" strokeWidth="2"/><path d="M48 350c65-45 64-137 134-157 82-23 92 53 152 20 46-26 41-104 129-123" fill="none" stroke="var(--yellow)" strokeWidth="6" strokeLinecap="round"/><g transform="translate(463 51)"><path d="M0-25c-14 0-25 11-25 25 0 17 25 39 25 39S25 17 25 0C25-14 14-25 0-25Z" fill="var(--yellow)"/><circle r="9" fill="var(--ink)"/></g></svg><div className="hero-map-copy"><div className="hero-promise">{t.home.exploreMap}</div><ArrowRight size={28} aria-hidden="true" /></div></Link>
    </div></section>

    <section className="section home-cities" id="cities"><div className="container"><div className="section-heading home-heading"><div><span className="section-kicker">{t.home.destinationsKicker}</span><h2>{t.home.citiesTitle}</h2><p>{t.home.citiesIntro}</p></div></div><div className="city-grid">{cityBundles.map(({ city: item, count }) => <CityCard key={item.id} city={item} locale={locale} count={count} />)}</div>
      <div className="home-city-picker"><div><strong>{t.home.activeCityTitle}</strong><p>{t.home.activeCityBody}</p></div><div className="home-city-options" role="group" aria-label={t.home.activeCityTitle}>{cityBundles.map(({ city: item }) => <button key={item.id} className="home-city-option" type="button" aria-pressed={item.id === city.id} onClick={() => chooseCity(item.id)}><MapPin size={17} aria-hidden="true" />{item.name}</button>)}</div></div>
    </div></section>

    <section className="home-active-city" aria-live="polite"><div className="container home-active-city-intro"><div><span className="section-kicker">{t.home.selectedCity}</span><h2>{city.name}</h2></div><Link className="button button-dark button-small" href={route.map(locale, city.slug)}><Map size={17} aria-hidden="true" />{t.home.exploreMap}</Link></div></section>

    <section className="discovery-section discovery-section-paper"><div className="container"><div className="discovery-heading"><div><span className="section-kicker">01</span><h2>{t.home.mustSeeTitle}</h2><p>{t.home.mustSeeBody.replace('{city}', city.name)}</p></div>{sectionAction()}</div><div className="discovery-rail">{mustSees.map((place) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} />)}</div></div></section>

    <section className="discovery-section discovery-section-yellow"><div className="container"><div className="discovery-heading"><div><span className="section-kicker">02</span><h2>{t.home.familyTitle}</h2><p>{t.home.familyBody.replace('{city}', city.name)}</p></div>{sectionAction()}</div><div className="discovery-rail">{family.map((place) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} />)}</div></div></section>

    <section className="section-tight home-categories"><div className="container"><div className="section-heading home-heading"><div><span className="section-kicker">03</span><h2>{t.home.categoriesTitle}</h2><p>{t.home.categoriesBody.replace('{city}', city.name)}</p></div></div><div className="category-strip">{categories.map((category) => { const icon = markerIconPath(markerTypeForCategoryId(category.id)); return <Link className="chip" key={category.id} href={route.category(locale, city.slug, category.slug[locale])}><span className="marker-type-icon" style={{ '--marker-icon': `url(${icon})` } as CSSProperties} aria-hidden="true" />{category.name[locale]}</Link> })}</div></div></section>

    <section className="section home-method-section"><div className="container route-statement home-method"><div><span className="section-kicker section-kicker-light">{t.home.howKicker}</span><h2>{t.home.methodTitle}</h2><p>{t.home.methodBody}</p><Link className="button button-primary" href={route.map(locale, city.slug)}>{t.home.exploreMap}<ArrowRight size={18} aria-hidden="true" /></Link></div><ol className="home-steps"><li><MousePointer2 aria-hidden="true" /><span><strong>{t.home.stepChooseTitle}</strong>{t.home.stepChooseBody}</span></li><li><Map aria-hidden="true" /><span><strong>{t.home.stepMapTitle}</strong>{t.home.stepMapBody}</span></li><li><LocateFixed aria-hidden="true" /><span><strong>{t.home.stepNearTitle}</strong>{t.home.stepNearBody}</span></li><li><BookOpenText aria-hidden="true" /><span><strong>{t.home.stepStoryTitle}</strong>{t.home.stepStoryBody}</span></li></ol><RouteGraphic label={t.home.methodTitle} /></div></section>

    <section className="section-tight home-guides"><div className="container"><div className="section-heading home-heading"><div><span className="section-kicker">{t.home.guidesKicker}</span><h2>{t.home.guidesTitle}</h2><p>{t.home.guidesBody}</p></div><Link href={route.guides(locale)} className="button button-light button-small">{t.common.viewAll}<ArrowRight size={17} aria-hidden="true" /></Link></div><div className="guide-grid">{guides.map((guide) => { const guideCity = getCityById(guide.cityId, locale); return guideCity ? <GuideCard key={guide.id} guide={guide} city={guideCity} locale={locale} /> : null })}</div></div></section>
  </main>
}
