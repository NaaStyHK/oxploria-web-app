import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { PlaceSummary } from '@/lib/types'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getCityById } from '@/lib/data/mock-repository'
import { route } from '@/lib/routes'
import { FavouriteButton } from '@/components/favourite-button'
import { SafeImage } from '@/components/safe-image'

export function PlaceCard({ place, locale, distance, showCity = true, imagePreload = false }: { place: PlaceSummary; locale: Locale; distance?: string; showCity?: boolean; imagePreload?: boolean }) {
  const t = getDictionary(locale)
  const city = getCityById(place.cityId, locale)
  if (!city) return null
  const href = route.place(locale, city.slug, place.slug)
  return <article className="place-card">
    <div className="place-card-media"><SafeImage src={place.images[0] || ''} alt="" fill preload={imagePreload} sizes="(max-width: 639px) 100vw, (max-width: 1179px) 50vw, 25vw" fallbackLabel={t.places.photoUnavailable} /></div>
    <div className="place-card-body"><span className="place-tag">{place.categoryName}</span><h3>{place.name}</h3><span className="muted">{place.style}</span><div className="place-card-footer">{distance ? <span className="mono">{distance}</span> : showCity ? <span className="mono"><MapPin size={14} aria-hidden="true" /> {city.name}</span> : null}<ArrowUpRight size={18} aria-hidden="true" /></div></div>
    <Link href={href} className="place-card-link"><span className="sr-only">{t.common.discover} {place.name}</span></Link>
    <FavouriteButton placeId={place.id} saveLabel={t.places.save} savedLabel={t.places.saved} />
  </article>
}
