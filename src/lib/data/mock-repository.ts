import type { Locale } from '@/lib/i18n/config'
import type { City, Guide, Place, PlaceRepository } from '@/lib/types'
import { categories, cityRecords, guideRecords, placeRecords } from '@/lib/data/mock-data'

function cityForLocale(id: string, locale: Locale): City | null {
  const record = cityRecords.find((city) => city.id === id)
  if (!record) return null
  return { id: record.id, slug: record.slug[locale], name: record.name[locale], country: record.country[locale], coordinates: record.coordinates, zoom: record.zoom, image: record.image, description: record.description[locale] }
}

function placeForLocale(id: string, locale: Locale): Place | null {
  const record = placeRecords.find((place) => place.id === id)
  if (!record) return null
  const category = categories.find((item) => item.id === record.categoryId) ?? categories[0]
  return {
    id: record.id, cityId: record.cityId, slug: record.slug[locale], name: record.name[locale], style: record.style[locale], description: record.description[locale], about: record.about[locale], hours: record.hours[locale], price: record.price[locale], address: record.address[locale], credit: record.credit[locale], coordinates: record.coordinates, category, categoryName: category.name[locale], categorySlug: category.slug[locale], collections: record.collections, images: record.images.filter(Boolean), website: record.website, telephone: record.telephone, email: record.email, featured: Boolean(record.featured), bookingOffers: record.bookingOffers,
  }
}

function guideForLocale(id: string, locale: Locale): Guide | null {
  const record = guideRecords.find((guide) => guide.id === id)
  if (!record) return null
  return { id: record.id, cityId: record.cityId, slug: record.slug[locale], title: record.title[locale], intro: record.intro[locale], image: record.image, readMinutes: record.readMinutes, sections: record.sections.map((section) => ({ title: section.title[locale], body: section.body[locale], placeIds: section.placeIds })), placeIds: record.placeIds }
}

export const mockRepository: PlaceRepository = {
  listCities: (locale) => cityRecords.map((record) => cityForLocale(record.id, locale)).filter((city): city is City => Boolean(city)),
  getCityBySlug: (slug, locale) => {
    const record = cityRecords.find((city) => city.slug[locale] === slug)
    return record ? cityForLocale(record.id, locale) : null
  },
  listPlaces: (locale, cityId) => placeRecords.filter((place) => !cityId || place.cityId === cityId).map((record) => placeForLocale(record.id, locale)).filter((place): place is Place => Boolean(place)),
  getPlaceBySlug: (slug, locale, cityId) => {
    const record = placeRecords.find((place) => place.slug[locale] === slug && (!cityId || place.cityId === cityId))
    return record ? placeForLocale(record.id, locale) : null
  },
  listGuides: (locale, cityId) => guideRecords.filter((guide) => !cityId || guide.cityId === cityId).map((record) => guideForLocale(record.id, locale)).filter((guide): guide is Guide => Boolean(guide)),
  getGuideBySlug: (slug, locale, cityId) => {
    const record = guideRecords.find((guide) => guide.slug[locale] === slug && (!cityId || guide.cityId === cityId))
    return record ? guideForLocale(record.id, locale) : null
  },
}

export function getCityById(id: string, locale: Locale): City | null { return cityForLocale(id, locale) }
export function getPlaceById(id: string, locale: Locale): Place | null { return placeForLocale(id, locale) }
export function getGuideById(id: string, locale: Locale): Guide | null { return guideForLocale(id, locale) }
