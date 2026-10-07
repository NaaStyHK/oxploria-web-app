'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocateFixed, LoaderCircle } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { City } from '@/lib/types'
import { route } from '@/lib/routes'
import { distanceInKm } from '@/lib/geo'
import { track } from '@/lib/analytics'
import { requestCurrentPosition, type GeolocationFailure } from '@/lib/browser-geolocation'
import { writePendingLocation } from '@/lib/browser-storage'
import { getDictionary } from '@/lib/i18n/dictionaries'

export function HomeLocationButton({ locale, cities, label, locatingLabel }: { locale: Locale; cities: City[]; label: string; locatingLabel: string }) {
  const router = useRouter()
  const t = getDictionary(locale)
  const [state, setState] = useState<'idle' | 'loading' | GeolocationFailure>('idle')
  const request = async () => {
    track('location_requested'); setState('loading')
    const result = await requestCurrentPosition()
    if (!result.ok) {
      setState(result.reason)
      track('location_denied', { reason: result.reason })
      return
    }
    const city = [...cities].sort((a, b) => distanceInKm(result.coordinates, a.coordinates) - distanceInKm(result.coordinates, b.coordinates))[0]
    track('location_granted')
    const stored = writePendingLocation(result.coordinates)
    router.push(`${route.map(locale, city.slug)}${stored ? '' : '?locate=1'}`)
  }
  const message = state === 'insecure' ? t.map.locationInsecure : state === 'denied' ? t.map.locationDenied : state === 'unavailable' ? t.map.locationUnavailable : state === 'timeout' ? t.map.locationTimeout : state === 'unsupported' ? t.map.locationUnsupported : state === 'error' ? t.map.locationError : null
  return <><button className="button button-dark" type="button" onClick={request} disabled={state === 'loading'}>{state === 'loading' ? <LoaderCircle size={19} className="spin" aria-hidden="true" /> : <LocateFixed size={19} aria-hidden="true" />}{state === 'loading' ? locatingLabel : label}</button>{message && <span className="location-inline-notice" role="status">{message}</span>}</>
}
