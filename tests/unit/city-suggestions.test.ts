import { describe, expect, it } from 'vitest'
import { selectCitySuggestions } from '@/lib/city-suggestions'
import { resolvePlaceCategory } from '@/lib/place-taxonomy'
import type { PlaceSummary } from '@/lib/types'

function place(id: string, categoryName: string, collections: string[] = [], featured = false): PlaceSummary {
  const category = resolvePlaceCategory(categoryName)
  return { id, cityId: 'barcelona', slug: id, name: id, style: categoryName, address: '', coordinates: null, category, categoryName: category.name.fr, categorySlug: category.slug.fr, collections, images: [], featured }
}

describe('city suggestions before geolocation', () => {
  it('prioritizes editorial signals and keeps categories diverse without inventing distance', () => {
    const places = [
      place('culture-a', 'Culture & lieux', ['Incontournables']),
      place('culture-b', 'Culture & lieux', ['Incontournables']),
      place('nature-a', 'Nature & plein air', ['Incontournables']),
      place('local-a', 'Vie locale', [], true),
      place('activity-a', 'Loisirs & activités'),
    ]
    const selected = selectCitySuggestions(places, 4)
    expect(selected.map((item) => item.id)).toEqual(['culture-a', 'nature-a', 'culture-b', 'local-a'])
    expect(new Set(selected.map((item) => item.id)).size).toBe(4)
  })
})
