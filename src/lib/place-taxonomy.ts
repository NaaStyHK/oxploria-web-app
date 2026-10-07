import { categories } from '@/lib/data/mock-data'
import { slugify } from '@/lib/slug'
import type { Category, Place } from '@/lib/types'

export type PlaceMarkerType = 'culture' | 'nature' | 'activity' | 'local' | 'bar' | 'restaurant' | 'nightlife' | 'generic'

const additionalCategories: Category[] = [
  { id: 'leisure', name: { fr: 'Loisirs & activités', es: 'Ocio y actividades', en: 'Leisure & activities' }, slug: { fr: 'loisirs-activites', es: 'ocio-actividades', en: 'leisure-activities' } },
  { id: 'bars', name: { fr: 'Bars', es: 'Bares', en: 'Bars' }, slug: { fr: 'bars', es: 'bares', en: 'bars' } },
  { id: 'restaurants', name: { fr: 'Restaurants', es: 'Restaurantes', en: 'Restaurants' }, slug: { fr: 'restaurants', es: 'restaurantes', en: 'restaurants' } },
  { id: 'nightlife', name: { fr: 'Discothèques', es: 'Discotecas', en: 'Nightclubs' }, slug: { fr: 'discotheques', es: 'discotecas', en: 'nightclubs' } },
]

const knownCategories = [...categories, ...additionalCategories]
const categoryAliases: Record<string, string> = {
  'nature-outdoor': 'nature',
  'nature-outdoors': 'nature',
  'loisirs-activites': 'leisure',
  'ocio-actividades': 'leisure',
  'leisure-activities': 'leisure',
  bar: 'bars',
  bares: 'bars',
  restaurant: 'restaurants',
  restaurantes: 'restaurants',
  discotheque: 'nightlife',
  discotheques: 'nightlife',
  discoteca: 'nightlife',
  discotecas: 'nightlife',
  nightclub: 'nightlife',
  nightclubs: 'nightlife',
}

export const markerTypes: PlaceMarkerType[] = ['culture', 'nature', 'activity', 'local', 'bar', 'restaurant', 'nightlife', 'generic']

export function normalizeTaxonomyValue(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
}

export function resolvePlaceCategory(value: unknown): Category {
  const rawName = Array.isArray(value) ? String(value[0] ?? '').trim() : typeof value === 'string' ? value.trim() : ''
  const normalized = slugify(rawName)
  const stableId = categoryAliases[normalized] ?? normalized
  const known = knownCategories.find((category) => category.id === stableId || Object.values(category.name).some((name) => slugify(name) === normalized))
  if (known) return known
  const name = rawName || 'Autre'
  return { id: normalized || 'other', name: { fr: name, es: name, en: name }, slug: { fr: slugify(name), es: slugify(name), en: slugify(name) } }
}

function specificType(value: string): PlaceMarkerType | null {
  if (/\b(discotheques?|discotecas?|nightclubs?|night clubs?|clubs? de nuit)\b/.test(value)) return 'nightlife'
  if (/\b(restaurants?|restaurantes?|dining|brasserie)\b/.test(value)) return 'restaurant'
  if (/\b(bars?|bares|pubs?|cafe|cafeteria|cocktails?)\b/.test(value)) return 'bar'
  return null
}

function broadType(value: string): PlaceMarkerType | null {
  if (/\b(nature|outdoors?|plein air|parks?|parcs?|parques?|gardens?|jardins?|jardines|beaches|beach|plages?|playas?)\b/.test(value)) return 'nature'
  if (/\b(loisirs?|leisure|activities|activity|activites?|actividades?|ocio|aquariums?|telepheriques?|telefericos?|cable cars?|ferris wheels?|roues? panoramiques?|carousels?|maneges?|adventure|aventure|climbing|escalade)\b/.test(value)) return 'activity'
  if (/\b(vie locale|vida local|local life|markets?|marches?|mercados?|districts?|quartiers?|barrios?)\b/.test(value)) return 'local'
  if (/\b(culture|lieux|places|architecture|patrimoine|heritage|monuments?|museums?|musees?|museos?|churches|church|eglises?|iglesias?|cathedrals?|sculptures?|statues?|fontaines?|fountains?|fuentes?)\b/.test(value)) return 'culture'
  return null
}

export function resolvePlaceMarkerType(place: Pick<Place, 'category' | 'categoryName' | 'style'>): PlaceMarkerType {
  const category = normalizeTaxonomyValue(`${place.category.id} ${place.categoryName} ${Object.values(place.category.name).join(' ')}`)
  const style = normalizeTaxonomyValue(place.style)
  return specificType(category) ?? specificType(style) ?? broadType(category) ?? broadType(style) ?? 'generic'
}

export function markerTypeForCategoryId(categoryId: string): PlaceMarkerType {
  const category = knownCategories.find((item) => item.id === categoryId)
  if (!category) return broadType(normalizeTaxonomyValue(categoryId)) ?? 'generic'
  return resolvePlaceMarkerType({ category, categoryName: category.name.fr, style: '' })
}

export function markerIconPath(type: PlaceMarkerType): string {
  return `/map-markers/${type}.png`
}

export function hasEditorialCollection(place: Pick<Place, 'collections'>, expected: 'Incontournables' | 'En famille'): boolean {
  const normalizedExpected = normalizeTaxonomyValue(expected)
  return place.collections.some((collection) => normalizeTaxonomyValue(collection) === normalizedExpected)
}

export function isGoingOutPlace(place: Pick<Place, 'category' | 'categoryName' | 'style'>): boolean {
  const markerType = resolvePlaceMarkerType(place)
  return ['bar', 'restaurant', 'nightlife', 'local', 'activity'].includes(markerType)
}
