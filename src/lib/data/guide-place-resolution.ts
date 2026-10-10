import type { Guide } from '@/lib/types'
import { placeRecords } from '@/lib/data/mock-data'
import { slugify } from '@/lib/slug'

// Temporary bridge between the Phase 1 editorial guides and the existing
// Firestore document names. It can disappear when guides move to Firestore.
const referenceAliases: Record<string, string[]> = {
  'bcn-catedral': ['Cathédrale Sainte-Croix de Barcelone', 'Catedral de la Santa Creu i Santa Eulàlia', 'Barcelona Cathedral'],
  'lr-tours-vieux-port': ['Tour Saint-Nicolas', 'Tour de la Chaîne'],
  'lr-grosse-horloge': ['La Grosse Horloge', 'Grosse Horloge'],
}

type GuidePlace = { id: string; name: string }

export function resolveGuidePlaceIds(guide: Guide, places: GuidePlace[]): string[] {
  const resolved = guide.placeIds.flatMap((reference) => {
    if (places.some((place) => place.id === reference)) return [reference]
    const legacy = placeRecords.find((place) => place.id === reference)
    const candidateNames = [...(legacy ? Object.values(legacy.name) : []), ...(referenceAliases[reference] ?? [])].map(slugify)
    return places.filter((place) => candidateNames.includes(slugify(place.name))).map((place) => place.id)
  })
  return [...new Set(resolved)]
}

export function resolveGuidePlaces<T extends GuidePlace>(guide: Guide, places: T[]): T[] {
  const ids = resolveGuidePlaceIds(guide, places)
  return ids.map((id) => places.find((place) => place.id === id)).filter((place): place is T => Boolean(place))
}
