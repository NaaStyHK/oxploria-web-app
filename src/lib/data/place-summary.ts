import type { Place, PlaceSummary } from '@/lib/types'

export function toPlaceSummary(place: Place): PlaceSummary {
  return {
    id: place.id,
    cityId: place.cityId,
    slug: place.slug,
    name: place.name,
    style: place.style,
    address: place.address,
    coordinates: place.coordinates,
    category: place.category,
    categoryName: place.categoryName,
    categorySlug: place.categorySlug,
    collections: place.collections,
    images: place.images[0] ? [place.images[0]] : [],
    featured: place.featured,
  }
}
