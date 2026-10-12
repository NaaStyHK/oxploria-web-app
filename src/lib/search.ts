import type { PlaceSummary } from '@/lib/types'

export const SEARCH_RESULTS_BATCH_SIZE = 24

export function visibleSearchResults<T>(results: T[], limit: number): T[] {
  return results.slice(0, limit)
}

export function nextSearchResultsLimit(currentLimit: number, totalResults: number): number {
  return Math.min(currentLimit + SEARCH_RESULTS_BATCH_SIZE, totalResults)
}

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
