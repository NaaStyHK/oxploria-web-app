import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock3, ExternalLink, Mail, MapPin, Phone, Route as RouteIcon, Ticket } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { AdSlot } from '@/components/ad-slot'
import { BookingCard } from '@/components/booking-card'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { FavouriteButton } from '@/components/favourite-button'
import { GuideCard } from '@/components/guide-card'
import { MiniLocation } from '@/components/mini-location'
import { PlaceCard } from '@/components/place-card'
import { SafeImage } from '@/components/safe-image'
import { EmptyState } from '@/components/empty-state'
import { categories as knownCategories, cityRecords, guideRecords } from '@/lib/data/mock-data'
import { getCityById, mockRepository } from '@/lib/data/mock-repository'
import { distanceInKm, hasCoordinates } from '@/lib/geo'
import { firebasePlaceRepository } from '@/lib/data/firebase-place-repository'
import { resolveGuidePlaces } from '@/lib/data/guide-place-resolution'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { route, segments } from '@/lib/routes'
import { breadcrumbJsonLd, localizedMetadata, SITE_URL } from '@/lib/seo'

type Props = { params: Promise<{ locale: string; city: string; section: string; slug: string }> }

export const dynamicParams = false

function decodeRouteSlug(value: string): string | null {
  try { return decodeURIComponent(value) } catch { return null }
}

export async function generateStaticParams() {
  const params = []
  for (const locale of locales) for (const city of cityRecords) {
    const places = await firebasePlaceRepository.listPlaceSummaries(locale, city.id)
    const categories = [...new Map([...knownCategories, ...places.map((place) => place.category)].map((category) => [category.id, category])).values()]
    params.push(
      ...places.map((place) => ({ locale, city: city.slug[locale], section: segments.places[locale], slug: place.slug })),
      ...categories.map((category) => ({ locale, city: city.slug[locale], section: segments.categories[locale], slug: category.slug[locale] })),
      ...guideRecords.filter((guide) => guide.cityId === city.id).map((guide) => ({ locale, city: city.slug[locale], section: segments.guides[locale], slug: guide.slug[locale] })),
    )
  }
  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value, city: citySlug, section, slug } = await params
  if (!isLocale(value)) return {}
  const decodedSlug = decodeRouteSlug(slug)
  if (!decodedSlug) return {}
  const city = mockRepository.getCityBySlug(citySlug, value)
  if (!city) return {}
  const cityRecord = cityRecords.find((item) => item.id === city.id)!
  if (section === segments.places[value]) {
    const place = await firebasePlaceRepository.getPlaceBySlug(decodedSlug, value, city.id)
    if (!place) return {}
    const localizedPlaces = await Promise.all(locales.map((locale) => firebasePlaceRepository.getPlaceById(place.id, locale, city.id)))
    const paths = Object.fromEntries(locales.map((locale, index) => [locale, route.place(locale, cityRecord.slug[locale], localizedPlaces[index]?.slug ?? place.slug)])) as Record<Locale, string>
    return localizedMetadata(value, paths, `${place.name} — ${city.name} | Oxploria`, place.description, place.images[0])
  }
  if (section === segments.categories[value]) {
    const cityCategories = [...new Map([...knownCategories, ...(await firebasePlaceRepository.listPlaceSummaries(value, city.id)).map((place) => place.category)].map((category) => [category.id, category])).values()]
    const category = cityCategories.find((item) => item.slug[value] === decodedSlug)
    if (!category) return {}
    const paths = Object.fromEntries(locales.map((locale) => [locale, route.category(locale, cityRecord.slug[locale], category.slug[locale])])) as Record<Locale, string>
    return localizedMetadata(value, paths, `${category.name[value]} — ${city.name} | Oxploria`, `${category.name[value]} · ${city.description}`)
  }
  if (section === segments.guides[value]) {
    const guide = mockRepository.getGuideBySlug(decodedSlug, value, city.id)
    const record = guideRecords.find((item) => item.id === guide?.id)
    if (!guide || !record) return {}
    const paths = Object.fromEntries(locales.map((locale) => [locale, route.guide(locale, cityRecord.slug[locale], record.slug[locale])])) as Record<Locale, string>
    return localizedMetadata(value, paths, `${guide.title} | Oxploria`, guide.intro, guide.image, 'article')
  }
  return {}
}

export default async function EntityPage({ params }: Props) {
  const { locale: value, city: citySlug, section, slug } = await params
  if (!isLocale(value)) notFound()
  const decodedSlug = decodeRouteSlug(slug)
  if (!decodedSlug) notFound()
  const city = mockRepository.getCityBySlug(citySlug, value)
  if (!city) notFound()
  if (section === segments.places[value]) return <PlaceDetail locale={value} cityId={city.id} slug={decodedSlug} />
  if (section === segments.categories[value]) return <CategoryDetail locale={value} cityId={city.id} slug={decodedSlug} />
  if (section === segments.guides[value]) return <GuideDetail locale={value} cityId={city.id} slug={decodedSlug} />
  notFound()
}

async function PlaceDetail({ locale, cityId, slug }: { locale: Locale; cityId: string; slug: string }) {
  const t = getDictionary(locale)
  const city = getCityById(cityId, locale)
  const place = await firebasePlaceRepository.getPlaceBySlug(slug, locale, cityId)
  if (!city || !place) notFound()
  if (place.slug !== slug) redirect(route.place(locale, city.slug, place.slug))
  const cityPlaces = await firebasePlaceRepository.listPlaceSummaries(locale, city.id)
  const nearby = place.coordinates ? cityPlaces.filter(hasCoordinates).filter((item) => item.id !== place.id).sort((a, b) => distanceInKm(place.coordinates!, a.coordinates) - distanceInKm(place.coordinates!, b.coordinates)).slice(0, 3) : []
  const guides = mockRepository.listGuides(locale, city.id).filter((guide) => resolveGuidePlaces(guide, cityPlaces).some((item) => item.id === place.id))
  const directionsUrl = place.coordinates ? `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.latitude},${place.coordinates.longitude}` : null
  const jsonLd = { '@context': 'https://schema.org', '@type': 'TouristAttraction', name: place.name, description: place.description, url: `${SITE_URL}${route.place(locale, city.slug, place.slug)}`, image: place.images, address: place.address, ...(place.coordinates ? { geo: { '@type': 'GeoCoordinates', latitude: place.coordinates.latitude, longitude: place.coordinates.longitude } } : {}) }
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Oxploria', path: route.home(locale) }, { name: city.name, path: route.city(locale, city.slug) }, { name: t.places.title, path: route.places(locale, city.slug) }, { name: place.name, path: route.place(locale, city.slug, place.slug) }])
  return <main id="main-content" className="page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbs]).replace(/</g, '\\u003c') }} /><section className="page-hero"><div className="container"><Breadcrumbs label={t.common.breadcrumb} items={[{ label: 'Oxploria', href: route.home(locale) }, { label: city.name, href: route.city(locale, city.slug) }, { label: t.places.title, href: route.places(locale, city.slug) }, { label: place.name }]} /><div className="place-title-row"><div><span className="place-tag">{place.categoryName}</span><h1>{place.name}</h1><p>{place.description}</p></div><FavouriteButton placeId={place.id} saveLabel={t.places.save} savedLabel={t.places.saved} compact={false} /></div><div className="place-gallery" aria-label={t.places.gallery}>{[0,1,2].map((index) => <div key={index} className={index === 0 ? 'gallery-main' : 'gallery-small'}><SafeImage src={place.images[index] || ''} alt={index === 0 ? place.name : `${place.name} · ${index + 1}`} fill preload={index === 0} sizes={index === 0 ? '(max-width: 639px) 100vw, 66vw' : '(max-width: 639px) 100vw, 33vw'} fallbackLabel={t.places.photoUnavailable}/></div>)}</div></div></section>
    <section className="section-tight"><div className="container place-content-grid"><article className="place-article"><h2>{t.places.about}</h2><p>{place.about}</p><AdSlot locale={locale} /><h2>{t.places.nearby}</h2><div className="place-grid nearby-grid">{nearby.map((item) => <PlaceCard key={item.id} place={item} locale={locale} showCity={false}/>)}</div>{guides.length > 0 && <><h2>{t.places.inGuide}</h2><div className="guide-grid">{guides.map((guide) => <GuideCard key={guide.id} guide={guide} city={city} locale={locale}/>)}</div></>}{place.bookingOffers.length > 0 && <><h2>{t.places.tickets}</h2><div className="place-grid">{place.bookingOffers.map((offer) => <BookingCard key={`${offer.provider}-${offer.title}`} offer={offer}/>)}</div></>}</article>
      <aside className="info-panel"><h2 className="info-panel-title">{t.places.practical}</h2><ul className="info-list">{place.address && <li><MapPin size={19}/><div><strong>{t.places.address}</strong>{place.address}</div></li>}{place.hours && <li><Clock3 size={19}/><div><strong>{t.places.hours}</strong>{place.hours}</div></li>}{place.price && <li><Ticket size={19}/><div><strong>{t.places.price}</strong>{place.price}</div></li>}{place.telephone && <li><Phone size={19}/><div><strong>{t.places.phone}</strong><a href={`tel:${place.telephone}`}>{place.telephone}</a></div></li>}{place.email && <li><Mail size={19}/><div><strong>{t.places.email}</strong><a href={`mailto:${place.email}`}>{place.email}</a></div></li>}{place.website && <li><ExternalLink size={19}/><div><strong>{t.places.website}</strong><a href={place.website} target="_blank" rel="noreferrer">{new URL(place.website).hostname}</a></div></li>}</ul>{place.coordinates && <><div className="info-actions">{directionsUrl && <a className="button button-primary" href={directionsUrl} target="_blank" rel="noreferrer"><RouteIcon size={18}/>{t.places.directions}</a>}<Link className="button button-dark" href={`${route.map(locale, city.slug)}?place=${encodeURIComponent(place.id)}`}><MapPin size={18}/>{t.places.openMap}</Link></div><div className="info-panel-map"><MiniLocation coordinates={place.coordinates} label={`${place.name} · ${place.address}`} /></div></>}{place.credit && <p className="muted info-panel-credit">{t.places.credits}: {place.credit}</p>}</aside></div></section>
  </main>
}

async function CategoryDetail({ locale, cityId, slug }: { locale: Locale; cityId: string; slug: string }) {
  const t = getDictionary(locale)
  const city = getCityById(cityId, locale)
  if (!city) notFound()
  const cityPlaces = await firebasePlaceRepository.listPlaceSummaries(locale, city.id)
  const categories = [...new Map([...knownCategories, ...cityPlaces.map((place) => place.category)].map((category) => [category.id, category])).values()]
  const category = categories.find((item) => item.slug[locale] === slug)
  if (!category) notFound()
  const places = cityPlaces.filter((place) => place.category.id === category.id)
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Oxploria', path: route.home(locale) }, { name: city.name, path: route.city(locale, city.slug) }, { name: category.name[locale], path: route.category(locale, city.slug, category.slug[locale]) }])
  return <main id="main-content" className="page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} /><section className="page-hero"><div className="container"><Breadcrumbs label={t.common.breadcrumb} items={[{ label: city.name, href: route.city(locale, city.slug) }, { label: category.name[locale] }]} /><h1>{category.name[locale]}<br/>{city.name}</h1><p>{t.places.categoryTitle}</p><div className="category-strip">{categories.map((item) => <Link key={item.id} className="chip" aria-current={item.id === category.id ? 'page' : undefined} href={route.category(locale, city.slug, item.slug[locale])}>{item.name[locale]}</Link>)}</div></div></section><section className="section-tight"><div className="container">{places.length ? <div className="place-grid">{places.map((place) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false}/>)}</div> : <EmptyState title={t.places.categoryEmpty} body={t.places.categoryEmptyHelp} action={<Link className="button button-primary" href={route.map(locale, city.slug)}><MapPin size={18}/>{t.city.exploreMap}</Link>}/>}</div></section></main>
}

async function GuideDetail({ locale, cityId, slug }: { locale: Locale; cityId: string; slug: string }) {
  const t = getDictionary(locale)
  const city = getCityById(cityId, locale)
  const guide = mockRepository.getGuideBySlug(slug, locale, cityId)
  if (!city || !guide) notFound()
  const cityPlaces = await firebasePlaceRepository.listPlaceSummaries(locale, city.id)
  const guidePlaces = resolveGuidePlaces(guide, cityPlaces)
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: guide.title, description: guide.intro, image: `${SITE_URL}${guide.image}`, inLanguage: locale, about: guidePlaces.map((place) => place.name) }
  const breadcrumbs = breadcrumbJsonLd([{ name: 'Oxploria', path: route.home(locale) }, { name: city.name, path: route.city(locale, city.slug) }, { name: t.nav.guides, path: route.guides(locale, city.slug) }, { name: guide.title, path: route.guide(locale, city.slug, guide.slug) }])
  return <main id="main-content" className="page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbs]).replace(/</g, '\\u003c') }} /><section className="guide-hero"><SafeImage src={guide.image} alt="" fill preload sizes="100vw" fallbackLabel={t.places.photoUnavailable}/><div className="container guide-hero-content"><Breadcrumbs label={t.common.breadcrumb} items={[{ label: city.name, href: route.city(locale, city.slug) }, { label: t.nav.guides, href: route.guides(locale, city.slug) }, { label: guide.title }]} /><span className="mono">{guide.readMinutes} {t.common.minutes}</span><h1>{guide.title}</h1><p>{guide.intro}</p></div></section><section className="section"><div className="container guide-body"><article>{guide.sections.map((section) => { const sectionPlaces = resolveGuidePlaces({ ...guide, placeIds: section.placeIds }, cityPlaces); return <section key={section.title} className="guide-section"><h2>{section.title}</h2><p>{section.body}</p><div className="place-grid guide-places-grid">{sectionPlaces.map((place) => <PlaceCard key={place.id} place={place} locale={locale}/>)}</div></section> })}<AdSlot locale={locale} /></article><aside className="info-panel"><h2 className="info-panel-title">{t.guides.places}</h2><ol>{guidePlaces.map((place) => <li key={place.id}><Link href={route.place(locale, city.slug, place.slug)}>{place.name}</Link></li>)}</ol><Link className="button button-primary" href={`${route.map(locale, city.slug)}?guide=${guide.id}`}><MapPin size={18}/>{t.guides.route}</Link></aside></div></section></main>
}
