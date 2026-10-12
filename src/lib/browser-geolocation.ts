import { toNearbyPosition, type NearbyPosition } from '@/lib/nearby-position'

export type GeolocationFailure = 'insecure' | 'unsupported' | 'denied' | 'unavailable' | 'timeout' | 'error'
export type GeolocationResult = { ok: true; coordinates: NearbyPosition } | { ok: false; reason: GeolocationFailure }

export const CURRENT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12_000,
  maximumAge: 0,
}

export const NEARBY_WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 20_000,
  maximumAge: 30_000,
}

function failureReason(error: GeolocationPositionError): GeolocationFailure {
  return error.code === error.PERMISSION_DENIED
    ? 'denied'
    : error.code === error.POSITION_UNAVAILABLE
      ? 'unavailable'
      : error.code === error.TIMEOUT
        ? 'timeout'
        : 'error'
}

function nearbyPosition(position: GeolocationPosition): NearbyPosition | null {
  return toNearbyPosition({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  })
}

export function requestCurrentPosition(): Promise<GeolocationResult> {
  if (typeof window === 'undefined' || !window.isSecureContext) return Promise.resolve({ ok: false, reason: 'insecure' })
  if (!navigator.geolocation) return Promise.resolve({ ok: false, reason: 'unsupported' })

  return new Promise((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = nearbyPosition(position)
          resolve(coordinates ? { ok: true, coordinates } : { ok: false, reason: 'unavailable' })
        },
        (error) => resolve({ ok: false, reason: failureReason(error) }),
        CURRENT_POSITION_OPTIONS,
      )
    } catch {
      resolve({ ok: false, reason: 'error' })
    }
  })
}

let activeWatch: { id: number; token: symbol } | null = null

export function stopNearbyPositionWatch(): void {
  if (!activeWatch || typeof navigator === 'undefined' || !navigator.geolocation) return
  navigator.geolocation.clearWatch(activeWatch.id)
  activeWatch = null
}

export function watchNearbyPosition(
  onPosition: (position: NearbyPosition) => void,
  onError: (reason: GeolocationFailure) => void,
): (() => void) | GeolocationFailure {
  if (typeof window === 'undefined' || !window.isSecureContext) return 'insecure'
  if (!navigator.geolocation) return 'unsupported'

  stopNearbyPositionWatch()
  const token = Symbol('nearby-position-watch')
  let id: number
  try {
    id = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates = nearbyPosition(position)
        if (coordinates) onPosition(coordinates)
      },
      (error) => onError(failureReason(error)),
      NEARBY_WATCH_OPTIONS,
    )
  } catch {
    return 'error'
  }
  activeWatch = { id, token }

  return () => {
    if (activeWatch?.token !== token) return
    navigator.geolocation.clearWatch(id)
    activeWatch = null
  }
}
