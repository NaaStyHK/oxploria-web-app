import type { Locale } from '@/lib/i18n/config'
import { hasEditorialCollection, isGoingOutPlace } from '@/lib/place-taxonomy'
import { route } from '@/lib/routes'
import type { PlaceSummary } from '@/lib/types'

export const editorialFilterKeys = ['must-see', 'family', 'local-life'] as const
export type EditorialFilterKey = (typeof editorialFilterKeys)[number]

export function parseEditorialFilter(value: string | undefined): EditorialFilterKey | null {
  return editorialFilterKeys.find((key) => key === value) ?? null
}

export function matchesEditorialFilter(place: PlaceSummary, filter: EditorialFilterKey): boolean {
  if (filter === 'must-see') return hasEditorialCollection(place, 'Incontournables')
  if (filter === 'family') return hasEditorialCollection(place, 'En famille')
  return isGoingOutPlace(place)
}

export function editorialMapHref(locale: Locale, citySlug: string, filter: EditorialFilterKey): string {
  return `${route.map(locale, citySlug)}?editorial=${filter}`
}
