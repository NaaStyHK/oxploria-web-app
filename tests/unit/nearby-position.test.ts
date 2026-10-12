import { describe, expect, it } from 'vitest'
import {
  MAX_NEARBY_POSITION_ACCURACY_METERS,
  NEARBY_REFRESH_DISTANCE_METERS,
  hasMovedEnough,
  nextNearbyReference,
  toNearbyPosition,
  type NearbyPosition,
} from '@/lib/nearby-position'
import { distanceInKm } from '@/lib/geo'

const origin: NearbyPosition = {
  latitude: 41.385,
  longitude: 2.173,
  accuracy: 20,
  timestamp: 1,
}

function northBy(metres: number, timestamp = metres): NearbyPosition {
  return {
    ...origin,
    latitude: origin.latitude + (metres / 6_371_000) * (180 / Math.PI),
    timestamp,
  }
}

describe('nearby position refresh threshold', () => {
  it.each([
    [50, false],
    [199, false],
    [201, true],
    [500, true],
  ])('treats a %i m displacement as update=%s', (metres, expected) => {
    expect(hasMovedEnough(origin, northBy(metres))).toBe(expected)
  })

  it('uses the central 200 m threshold and converts kilometres to metres correctly', () => {
    const candidate = northBy(NEARBY_REFRESH_DISTANCE_METERS)
    expect(distanceInKm(origin, candidate) * 1000).toBeCloseTo(200, 5)
    expect(hasMovedEnough(origin, candidate)).toBe(true)
  })

  it('updates the reference only after the threshold is crossed', () => {
    const drift = northBy(50, 2)
    const walk = northBy(500, 3)
    expect(nextNearbyReference(origin, drift)).toBe(origin)
    expect(nextNearbyReference(origin, walk)).toBe(walk)
  })
})

describe('nearby position quality and retention', () => {
  it('rejects fixes whose uncertainty is too large for a 200 m movement decision', () => {
    expect(MAX_NEARBY_POSITION_ACCURACY_METERS).toBe(100)
    expect(toNearbyPosition({ ...origin, accuracy: 100 })).toEqual({ ...origin, accuracy: 100 })
    expect(toNearbyPosition({ ...origin, accuracy: 101 })).toBeNull()
    expect(toNearbyPosition({ ...origin, accuracy: 500 })).toBeNull()
  })

  it('keeps one flat latest reference rather than a position history', () => {
    const accepted = nextNearbyReference(origin, northBy(500, 4))
    expect(accepted).toEqual(northBy(500, 4))
    expect(Object.keys(accepted).sort()).toEqual(['accuracy', 'latitude', 'longitude', 'timestamp'])
    expect(Object.values(accepted).some(Array.isArray)).toBe(false)
  })
})
