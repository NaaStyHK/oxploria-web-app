import type { Locale } from '@/lib/i18n/config'
import { isLocale } from '@/lib/i18n/config'
import { categories, cityRecords, guideRecords, placeRecords } from '@/lib/data/mock-data'
import { route, segments, type SegmentKey } from '@/lib/routes'

function keyForSegment(segment: string, locale: Locale): SegmentKey | null {
  return (Object.keys(segments) as SegmentKey[]).find((key) => segments[key][locale] === segment) ?? null
}

function decodePathSegment(segment: string): string {
  try { return decodeURIComponent(segment) } catch { return segment }
}

export function translatePathname(pathname: string, target: Locale): string {
  const parts = pathname.split('/').filter(Boolean)
  const source = parts[0]
  if (!source || !isLocale(source)) return route.home(target)
  if (parts.length === 1) return route.home(target)

  const topLevelKey = keyForSegment(parts[1], source)
  if (topLevelKey) {
    if (topLevelKey === 'guides') return route.guides(target)
    if (topLevelKey === 'search') return route.search(target)
    if (['about', 'contact', 'privacy', 'cookies', 'legal', 'terms'].includes(topLevelKey)) {
      return route.page(target, topLevelKey as 'about' | 'contact' | 'privacy' | 'cookies' | 'legal' | 'terms')
    }
  }

  const cityRecord = cityRecords.find((city) => city.slug[source] === parts[1])
  if (!cityRecord) return route.home(target)
  const targetCity = cityRecord.slug[target]
  if (parts.length === 2) return route.city(target, targetCity)

  const section = keyForSegment(parts[2], source)
  if (section === 'map') return route.map(target, targetCity)
  if (section === 'places') {
    if (!parts[3]) return route.places(target, targetCity)
    const placeSegment = decodePathSegment(parts[3])
    if (placeSegment.includes('--')) return route.place(target, targetCity, placeSegment)
    const place = placeRecords.find((item) => item.cityId === cityRecord.id && item.slug[source] === placeSegment)
    return place ? route.place(target, targetCity, place.slug[target]) : route.places(target, targetCity)
  }
  if (section === 'categories' && parts[3]) {
    const category = categories.find((item) => item.slug[source] === parts[3])
    return category ? route.category(target, targetCity, category.slug[target]) : route.city(target, targetCity)
  }
  if (section === 'guides') {
    if (!parts[3]) return route.guides(target, targetCity)
    const guide = guideRecords.find((item) => item.cityId === cityRecord.id && item.slug[source] === parts[3])
    return guide ? route.guide(target, targetCity, guide.slug[target]) : route.guides(target, targetCity)
  }
  return route.city(target, targetCity)
}
