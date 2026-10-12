import type { PlaceSummary } from '@/lib/types'
import { hasEditorialCollection } from '@/lib/place-taxonomy'

function diverseSelection(places: PlaceSummary[], limit: number, used: Set<string>): PlaceSummary[] {
  const selected: PlaceSummary[] = []
  const categories = new Map<string, PlaceSummary[]>()
  for (const place of places) {
    if (used.has(place.id)) continue
    const group = categories.get(place.category.id) ?? []
    group.push(place)
    categories.set(place.category.id, group)
  }
  while (selected.length < limit && categories.size) {
    for (const [category, group] of categories) {
      const place = group.shift()
      if (place) {
        selected.push(place)
        used.add(place.id)
      }
      if (!group.length) categories.delete(category)
      if (selected.length === limit) break
    }
  }
  return selected
}

export function selectCitySuggestions(places: PlaceSummary[], limit = 8): PlaceSummary[] {
  const used = new Set<string>()
  const mustSees = places.filter((place) => hasEditorialCollection(place, 'Incontournables'))
  const featured = places.filter((place) => place.featured)
  const selected = diverseSelection(mustSees, limit, used)
  selected.push(...diverseSelection(featured, limit - selected.length, used))
  selected.push(...diverseSelection(places, limit - selected.length, used))
  return selected
}
