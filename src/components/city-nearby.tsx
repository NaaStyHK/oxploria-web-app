'use client'

import { LoaderCircle, LocateFixed } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { City, Coordinates, Place } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { distanceInKm, formatDistance, hasCoordinates } from '@/lib/geo'
import { PlaceCard } from '@/components/place-card'
import { track } from '@/lib/analytics'
import { requestCurrentPosition, type GeolocationFailure } from '@/lib/browser-geolocation'

type LocationState = 'idle' | 'loading' | 'granted' | GeolocationFailure

export function CityNearby({ locale, city, places }: { locale: Locale; city: City; places: Place[] }) {
  const t = getDictionary(locale)
  const [position, setPosition] = useState<Coordinates | null>(null)
  const [state, setState] = useState<LocationState>('idle')
  const nearby = useMemo(() => position ? places.filter(hasCoordinates).sort((a, b) => distanceInKm(position, a.coordinates) - distanceInKm(position, b.coordinates)).slice(0, 3) : [], [places, position])
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

  return <section className="section city-nearby-section"><div className="container">
    <div className="section-heading"><div><h2>{t.city.nearby}</h2><p>{t.city.nearbyBody}</p></div>{state !== 'granted' && <button type="button" className="button button-primary" onClick={locate} disabled={state === 'loading'}>{state === 'loading' ? <LoaderCircle size={18} className="spin" aria-hidden="true"/> : <LocateFixed size={18} aria-hidden="true"/>}{state === 'loading' ? t.map.locating : t.city.nearbyAction}</button>}</div>
    {message && <div className="notice city-nearby-notice" role="status">{message}</div>}
    {position && <div className="place-grid">{nearby.map((place) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} distance={formatDistance(distanceInKm(position, place.coordinates), locale)}/>)}</div>}
  </div></section>
}
