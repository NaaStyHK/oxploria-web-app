import { distanceInKm } from '@/lib/geo'
import type { Coordinates } from '@/lib/types'

export const NEARBY_REFRESH_DISTANCE_METERS = 200

// A fix whose uncertainty is larger than half the movement threshold cannot
// reliably distinguish a real 200 m walk from GPS drift.
export const MAX_NEARBY_POSITION_ACCURACY_METERS = NEARBY_REFRESH_DISTANCE_METERS / 2

export type NearbyPosition = Coordinates & {
  accuracy: number
  timestamp: number
}

type PositionSample = {
  latitude: number
  longitude: number
  accuracy: number
  timestamp?: number
}

export function toNearbyPosition(sample: PositionSample): NearbyPosition | null {
  const { latitude, longitude, accuracy } = sample
  if (
    !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || Math.abs(latitude) > 90
    || Math.abs(longitude) > 180
    || !Number.isFinite(accuracy)
    || accuracy < 0
    || accuracy > MAX_NEARBY_POSITION_ACCURACY_METERS
  ) return null

  return {
    latitude,
    longitude,
    accuracy,
    timestamp: Number.isFinite(sample.timestamp) ? sample.timestamp as number : Date.now(),
  }
}

export function hasMovedEnough(
  previous: Coordinates,
  next: Coordinates,
  thresholdMeters = NEARBY_REFRESH_DISTANCE_METERS,
): boolean {
  // Geodesic conversion can produce 199.999999… for an exact 200 m input.
  // Compare whole metres because browser accuracy is never sub-metre here.
  return Math.round(distanceInKm(previous, next) * 1000) >= thresholdMeters
}

export function nextNearbyReference(
  previous: NearbyPosition | null,
  candidate: NearbyPosition,
): NearbyPosition {
  return !previous || hasMovedEnough(previous, candidate) ? candidate : previous
}
