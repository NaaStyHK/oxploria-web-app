'use client'

import Link from 'next/link'
import { Check, LoaderCircle, LocateFixed, Map as MapIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/empty-state'
import { PlaceCard } from '@/components/place-card'
import { distanceInKm, formatDistance, sortByDistance } from '@/lib/geo'
import { getDictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import type { PlaceSummary } from '@/lib/types'
import { useNearbyPosition } from '@/hooks/use-nearby-position'

const PAGE_SIZE = 36

export function CategoryPlaces({ locale, places, mapHref, emptyTitle, emptyBody }: { locale: Locale; places: PlaceSummary[]; mapHref: string; emptyTitle: string; emptyBody: string }) {
  const t = getDictionary(locale)
  const { position, state: locationState, active: locationActive, activate } = useNearbyPosition()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const orderedPlaces = useMemo(() => locationActive && position ? sortByDistance(places, position) : places, [places, locationActive, position])
  const visiblePlaces = orderedPlaces.slice(0, visibleCount)
  const locationMessage = locationState === 'insecure' ? t.map.locationInsecure : locationState === 'denied' ? t.map.locationDenied : locationState === 'unavailable' ? t.map.locationUnavailable : locationState === 'timeout' ? t.map.locationTimeout : locationState === 'unsupported' ? t.map.locationUnsupported : locationState === 'error' ? t.map.locationError : null

  const locate = async () => {
    await activate()
    setVisibleCount(PAGE_SIZE)
  }

  return <div className="category-directory">
    <div className="category-actions">
      <Link className="button button-primary" href={mapHref}><MapIcon size={18} aria-hidden="true" />{t.places.categoryMap}</Link>
      <button type="button" className="button button-light" aria-pressed={locationActive} onClick={locate} disabled={locationState === 'loading'}>{locationState === 'loading' ? <LoaderCircle size={18} className="spin" aria-hidden="true" /> : locationActive ? <Check size={18} aria-hidden="true" /> : <LocateFixed size={18} aria-hidden="true" />}{locationState === 'loading' ? t.map.locating : locationActive ? t.places.categoryByDistance : t.places.categoryNearMe}</button>
    </div>
    {locationMessage && <div className="notice category-location-notice" role="status">{locationMessage}</div>}
    {locationActive && <span className="sr-only" role="status">{t.map.locationActive}</span>}
    {orderedPlaces.length ? <><div className="place-grid">{visiblePlaces.map((place, index) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} imagePreload={index === 0} distance={locationActive && position && place.coordinates ? formatDistance(distanceInKm(position, place.coordinates), locale) : undefined} />)}</div>{visibleCount < orderedPlaces.length && <div className="directory-more"><button type="button" className="button button-dark" onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, orderedPlaces.length))}>{t.common.showMore}</button></div>}</> : <div className="category-empty"><EmptyState title={emptyTitle} body={emptyBody} /></div>}
  </div>
}
