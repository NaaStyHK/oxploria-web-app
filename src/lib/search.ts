import type { PlaceSummary } from '@/lib/types'

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim()
}

export function matchesPlace(place: PlaceSummary, query: string): boolean {
  const needle = normalizeSearch(query)
  if (!needle) return true
  const haystack = [
    place.name,
    place.style,
    place.address,
    place.categoryName,
    ...place.collections,
  ]
    .map(normalizeSearch)
    .join(' ')
  return haystack.includes(needle)
}
