import 'server-only'

import { unstable_cache } from 'next/cache'
import { collection, doc, getDocFromServer, getDocsFromServer, type DocumentData } from 'firebase/firestore'
import type { Locale } from '@/lib/i18n/config'
import type { Place, PlaceSummary, PublicPlaceRepository, RawFirebasePlace } from '@/lib/types'
import { getFirebaseFirestore } from '@/lib/firebase'
import { normalizeFirebasePlace } from '@/lib/data/firebase-adapter'
import { withFirestoreRetry } from '@/lib/data/firestore-retry'
import { toPlaceSummary } from '@/lib/data/place-summary'
import { documentIdFromPlaceSlug } from '@/lib/slug'

export const cityCollections = { barcelona: 'Barcelona', 'la-rochelle': 'La-Rochelle' } as const
export type PublicCityId = keyof typeof cityCollections
export const PLACES_REVALIDATE_SECONDS = 3600
const FIRESTORE_TIMEOUT_MS = 15000
const isPublicCityId = (value: string): value is PublicCityId => value in cityCollections

function withTimeout<T>(promise: Promise<T>, operation: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Firestore ${operation} timed out after ${FIRESTORE_TIMEOUT_MS} ms.`)), FIRESTORE_TIMEOUT_MS)
    promise.then(
      (value) => { clearTimeout(timer); resolve(value) },
      (error: unknown) => { clearTimeout(timer); reject(error) },
    )
  })
}

function plainValue(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  const coordinate = value as { latitude?: unknown; longitude?: unknown }
  if (typeof coordinate.latitude === 'number' && typeof coordinate.longitude === 'number') return { latitude: coordinate.latitude, longitude: coordinate.longitude }
  if (Array.isArray(value)) return value.map(plainValue)
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, plainValue(item)]))
}

const readCityDocuments = unstable_cache(async (cityId: PublicCityId): Promise<RawFirebasePlace[]> => {
  const operation = `collection read (${cityCollections[cityId]})`
  const snapshot = await withFirestoreRetry(operation, () => withTimeout(getDocsFromServer(collection(getFirebaseFirestore(), cityCollections[cityId])), operation))
  if (snapshot.empty) throw new Error(`Firestore collection ${cityCollections[cityId]} unexpectedly returned no public places.`)
  return snapshot.docs.map((item) => ({ ...(plainValue(item.data()) as DocumentData), id: item.id } as RawFirebasePlace))
}, ['firebase-public-places-city-v1'], { revalidate: PLACES_REVALIDATE_SECONDS, tags: ['firebase-public-places'] })

const readPlaceDocument = unstable_cache(async (cityId: PublicCityId, id: string): Promise<RawFirebasePlace | null> => {
  const operation = `document read (${cityCollections[cityId]}/${id})`
  const snapshot = await withFirestoreRetry(operation, () => withTimeout(getDocFromServer(doc(getFirebaseFirestore(), cityCollections[cityId], id)), operation))
  return snapshot.exists() ? ({ ...(plainValue(snapshot.data()) as DocumentData), id: snapshot.id } as RawFirebasePlace) : null
}, ['firebase-public-place-v1'], { revalidate: PLACES_REVALIDATE_SECONDS, tags: ['firebase-public-places'] })

async function listPlaces(locale: Locale, cityId?: string): Promise<Place[]> {
  const cityIds: PublicCityId[] = cityId ? (isPublicCityId(cityId) ? [cityId] : []) : ['barcelona', 'la-rochelle']
  const groups = await Promise.all(cityIds.map(async (id) => (await readCityDocuments(id)).map((raw) => normalizeFirebasePlace(raw, locale, id)).filter((place): place is Place => Boolean(place))))
  return groups.flat()
}

async function listPlaceSummaries(locale: Locale, cityId?: string): Promise<PlaceSummary[]> {
  return (await listPlaces(locale, cityId)).map(toPlaceSummary)
}

async function getPlaceById(id: string, locale: Locale, cityId: string): Promise<Place | null> {
  if (!isPublicCityId(cityId)) return null
  const raw = await readPlaceDocument(cityId, id)
  return raw ? normalizeFirebasePlace(raw, locale, cityId) : null
}

async function getPlaceBySlug(slug: string, locale: Locale, cityId: string): Promise<Place | null> {
  const id = documentIdFromPlaceSlug(slug)
  if (id) return getPlaceById(id, locale, cityId)
  return (await listPlaces(locale, cityId)).find((place) => place.slug === slug || place.slug.split('--')[0] === slug) ?? null
}

export const firebasePlaceRepository: PublicPlaceRepository = { listPlaces, listPlaceSummaries, getPlaceById, getPlaceBySlug }
