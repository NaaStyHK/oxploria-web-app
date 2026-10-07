import type { Coordinates } from '@/lib/types'
import type { Place } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'

function validCoordinates(latitude: number, longitude: number): Coordinates | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return { latitude, longitude }
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || !value.trim() || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim())) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function parseFirebaseCoordinates(value: unknown): Coordinates | null {
  if (typeof value === 'string') {
    const parts = value.split(',').map(finiteNumber)
    return parts.length === 2 && parts[0] !== null && parts[1] !== null ? validCoordinates(parts[0], parts[1]) : null
  }
  if (value && typeof value === 'object') {
    const candidate = value as { latitude?: unknown; longitude?: unknown; _lat?: unknown; _long?: unknown }
    const latitude = finiteNumber(candidate.latitude ?? candidate._lat)
    const longitude = finiteNumber(candidate.longitude ?? candidate._long)
    return latitude !== null && longitude !== null ? validCoordinates(latitude, longitude) : null
  }
  return null
}

export function normalizePlaceCoordinates(raw: { location?: unknown; distance?: unknown; lat?: unknown; lng?: unknown }): Coordinates | null {
  for (const candidate of [raw.location, raw.distance]) {
    const parsed = parseFirebaseCoordinates(candidate)
    if (parsed) return parsed
  }
  const latitude = finiteNumber(raw.lat)
  const longitude = finiteNumber(raw.lng)
  return latitude !== null && longitude !== null ? validCoordinates(latitude, longitude) : null
}

export function hasCoordinates(place: Place): place is Place & { coordinates: Coordinates } { return place.coordinates !== null }

const EARTH_RADIUS_KM = 6371

export function distanceInKm(from: Coordinates, to: Coordinates): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = radians(to.latitude - from.latitude)
  const dLon = radians(to.longitude - from.longitude)
  const lat1 = radians(from.latitude)
  const lat2 = radians(to.latitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(kilometres: number, locale: Locale): string {
  if (!Number.isFinite(kilometres) || kilometres < 0) return ''
  if (kilometres < 1) return `${Math.max(10, Math.round((kilometres * 1000) / 10) * 10)} m`
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: kilometres < 10 ? 1 : 0 }).format(kilometres)} km`
}
