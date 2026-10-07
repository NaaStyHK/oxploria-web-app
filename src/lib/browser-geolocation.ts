import type { Coordinates } from '@/lib/types'

export type GeolocationFailure = 'insecure' | 'unsupported' | 'denied' | 'unavailable' | 'timeout' | 'error'
export type GeolocationResult = { ok: true; coordinates: Coordinates } | { ok: false; reason: GeolocationFailure }

export function requestCurrentPosition(): Promise<GeolocationResult> {
  if (typeof window === 'undefined' || !window.isSecureContext) return Promise.resolve({ ok: false, reason: 'insecure' })
  if (!navigator.geolocation) return Promise.resolve({ ok: false, reason: 'unsupported' })

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ ok: true, coordinates: { latitude: position.coords.latitude, longitude: position.coords.longitude } }),
      (error) => resolve({
        ok: false,
        reason: error.code === error.PERMISSION_DENIED
          ? 'denied'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'unavailable'
            : error.code === error.TIMEOUT
              ? 'timeout'
              : 'error',
      }),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 120000 },
    )
  })
}
