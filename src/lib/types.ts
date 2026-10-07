import type { Localized, Locale } from '@/lib/i18n/config'

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Category {
  id: string
  name: Localized
  slug: Localized
}

export interface BookingOffer {
  provider: string
  title: string
  url: string
  price?: number
  currency?: string
  type: 'ticket' | 'tour' | 'experience'
}

export interface CityRecord {
  id: string
  slug: Localized
  name: Localized
  country: Localized
  coordinates: Coordinates
  zoom: number
  image: string
  description: Localized
}

export interface PlaceRecord {
  id: string
  cityId: string
  slug: Localized
  name: Localized
  style: Localized
  description: Localized
  about: Localized
  hours: Localized
  price: Localized
  address: Localized
  credit: Localized
  coordinates: Coordinates
  categoryId: string
  collections: string[]
  images: string[]
  website?: string
  telephone?: string
  email?: string
  featured?: boolean
  bookingOffers: BookingOffer[]
}

export interface GuideSectionRecord {
  title: Localized
  body: Localized
  placeIds: string[]
}

export interface GuideRecord {
  id: string
  cityId: string
  slug: Localized
  title: Localized
  intro: Localized
  image: string
  readMinutes: number
  sections: GuideSectionRecord[]
  placeIds: string[]
}

export interface City {
  id: string
  slug: string
  name: string
  country: string
  coordinates: Coordinates
  zoom: number
  image: string
  description: string
}

export interface Place {
  id: string
  cityId: string
  slug: string
  name: string
  style: string
  description: string
  about: string
  hours: string
  price: string
  address: string
  credit: string
  coordinates: Coordinates | null
  category: Category
  categoryName: string
  categorySlug: string
  collections: string[]
  images: string[]
  website?: string
  telephone?: string
  email?: string
  featured: boolean
  bookingOffers: BookingOffer[]
}

export interface GuideSection {
  title: string
  body: string
  placeIds: string[]
}

export interface Guide {
  id: string
  cityId: string
  slug: string
  title: string
  intro: string
  image: string
  readMinutes: number
  sections: GuideSection[]
  placeIds: string[]
}

export interface RawFirebasePlace {
  [key: string]: unknown
  id: string
  siteinternet?: string
  telephone?: string
  email?: string
  location?: unknown
  distance?: unknown
  lat?: unknown
  lng?: unknown
  translations?: unknown
  imageactivite?: string
  imageactivite1?: string
  imageactivite2?: string
  trie?: string
  categories?: string[] | string
  style_fr?: string
  style_es?: string
  style_en?: string
  nom_fr?: string
  nom_es?: string
  nom_en?: string
  horaires_fr?: string
  horaires_es?: string
  horaires_en?: string
  prix_fr?: string
  prix_es?: string
  prix_en?: string
  adresse_fr?: string
  adresse_es?: string
  adresse_en?: string
  credit_fr?: string
  credit_es?: string
  credit_en?: string
  description_fr?: string
  description_es?: string
  description_en?: string
  apropos_fr?: string
  apropos_es?: string
  apropos_en?: string
}

export interface PlaceRepository {
  listCities(locale: Locale): City[]
  getCityBySlug(slug: string, locale: Locale): City | null
  listPlaces(locale: Locale, cityId?: string): Place[]
  getPlaceBySlug(slug: string, locale: Locale, cityId?: string): Place | null
  listGuides(locale: Locale, cityId?: string): Guide[]
  getGuideBySlug(slug: string, locale: Locale, cityId?: string): Guide | null
}

export interface PublicPlaceRepository {
  listPlaces(locale: Locale, cityId?: string): Promise<Place[]>
  getPlaceById(id: string, locale: Locale, cityId: string): Promise<Place | null>
  getPlaceBySlug(slug: string, locale: Locale, cityId: string): Promise<Place | null>
}
