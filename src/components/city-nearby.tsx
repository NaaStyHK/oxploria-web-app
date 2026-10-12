'use client'

import { LoaderCircle, LocateFixed } from 'lucide-react'
import { useMemo } from 'react'
import type { City, PlaceSummary } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { distanceInKm, formatDistance, hasCoordinates } from '@/lib/geo'
import { DiscoveryRail } from '@/components/discovery-rail'
import { track } from '@/lib/analytics'
import { selectCitySuggestions } from '@/lib/city-suggestions'
import { useNearbyPosition } from '@/hooks/use-nearby-position'

export function CityNearby({ locale, city, places }: { locale: Locale; city: City; places: PlaceSummary[] }) {
  const t = getDictionary(locale)
  const { position, state, activate } = useNearbyPosition()
  const suggestions = useMemo(() => selectCitySuggestions(places), [places])
  const nearby = useMemo(() => position ? places.filter(hasCoordinates).sort((a, b) => distanceInKm(position, a.coordinates) - distanceInKm(position, b.coordinates)).slice(0, 8) : [], [places, position])
  const items = position
    ? nearby.map((place) => ({ place, distance: formatDistance(distanceInKm(position, place.coordinates), locale) }))
    : suggestions.map((place) => ({ place }))
  const message = state === 'insecure' ? t.map.locationInsecure : state === 'denied' ? t.map.locationDenied : state === 'unavailable' ? t.map.locationUnavailable : state === 'timeout' ? t.map.locationTimeout : state === 'unsupported' ? t.map.locationUnsupported : state === 'error' ? t.map.locationError : null

  const locate = async () => {
    track('location_requested', { context: 'city', city: city.id })
    const result = await activate()
    if (result.ok) {
      track('location_granted', { context: 'city', city: city.id })
      return
    }
    track('location_denied', { context: 'city', city: city.id, reason: result.reason })
  }

  return <div className="city-nearby-section">
    <DiscoveryRail locale={locale} title={position ? t.city.nearby : t.city.suggestions} body={position ? t.city.nearbyActive : t.city.suggestionsBody} items={items} tone="yellow" headingControl={<button type="button" className="button button-dark" onClick={locate} disabled={state === 'loading'}>{state === 'loading' ? <LoaderCircle size={18} className="spin" aria-hidden="true"/> : <LocateFixed size={18} aria-hidden="true"/>}{state === 'loading' ? t.map.locating : t.city.nearbyAction}</button>} />
    {message && <div className="container city-nearby-message"><div className="notice city-nearby-notice" role="status">{message}</div></div>}
  </div>
}
