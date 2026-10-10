'use client'

import { LoaderCircle, LocateFixed } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { City, Coordinates, PlaceSummary } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { distanceInKm, formatDistance, hasCoordinates } from '@/lib/geo'
import { DiscoveryRail } from '@/components/discovery-rail'
import { track } from '@/lib/analytics'
import { requestCurrentPosition, type GeolocationFailure } from '@/lib/browser-geolocation'

type LocationState = 'idle' | 'loading' | 'granted' | GeolocationFailure

export function CityNearby({ locale, city, places }: { locale: Locale; city: City; places: PlaceSummary[] }) {
  const t = getDictionary(locale)
  const [position, setPosition] = useState<Coordinates | null>(null)
  const [state, setState] = useState<LocationState>('idle')
  const fallback = useMemo(() => {
    const candidates = places.filter(hasCoordinates)
    const lessObvious = candidates.filter((place) => !place.featured)
    return (lessObvious.length >= 4 ? lessObvious : candidates).slice(0, 8)
  }, [places])
  const nearby = useMemo(() => position ? places.filter(hasCoordinates).sort((a, b) => distanceInKm(position, a.coordinates) - distanceInKm(position, b.coordinates)).slice(0, 8) : [], [places, position])
  const items = position
    ? nearby.map((place) => ({ place, distance: formatDistance(distanceInKm(position, place.coordinates), locale) }))
    : fallback.map((place) => ({ place }))
  const message = state === 'insecure' ? t.map.locationInsecure : state === 'denied' ? t.map.locationDenied : state === 'unavailable' ? t.map.locationUnavailable : state === 'timeout' ? t.map.locationTimeout : state === 'unsupported' ? t.map.locationUnsupported : state === 'error' ? t.map.locationError : null

  const locate = async () => {
    track('location_requested', { context: 'city', city: city.id })
    setState('loading')
    const result = await requestCurrentPosition()
    if (result.ok) {
      setPosition(result.coordinates)
      setState('granted')
      track('location_granted', { context: 'city', city: city.id })
      return
    }
    setState(result.reason)
    track('location_denied', { context: 'city', city: city.id, reason: result.reason })
  }

  return <div className="city-nearby-section">
    <DiscoveryRail locale={locale} title={t.city.nearby} body={position ? t.city.nearbyActive : t.city.nearbyBody} items={items} tone="yellow" headingControl={state !== 'granted' ? <button type="button" className="button button-dark" onClick={locate} disabled={state === 'loading'}>{state === 'loading' ? <LoaderCircle size={18} className="spin" aria-hidden="true"/> : <LocateFixed size={18} aria-hidden="true"/>}{state === 'loading' ? t.map.locating : t.city.nearbyAction}</button> : undefined} />
    {message && <div className="container city-nearby-message"><div className="notice city-nearby-notice" role="status">{message}</div></div>}
  </div>
}
