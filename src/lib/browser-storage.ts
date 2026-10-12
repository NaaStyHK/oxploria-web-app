import { isLocale, type Locale } from '@/lib/i18n/config'
import type { Coordinates } from '@/lib/types'

const LOCALE_KEY = 'oxploria-locale'
const FAVOURITES_KEY = 'oxploria-favourites'
const SESSION_LOCATION_KEY = 'oxploria-session-location'
const ACTIVE_CITY_KEY = 'oxploria-active-city'

export function readLocalePreference(): Locale | null {
  try {
    const value = localStorage.getItem(LOCALE_KEY)
    return value && isLocale(value) ? value : null
  } catch {
    return null
  }
}

export function writeLocalePreference(locale: Locale): void {
  try { localStorage.setItem(LOCALE_KEY, locale) } catch { /* Storage can be disabled. */ }
  try { document.cookie = `${LOCALE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax` } catch { /* Cookies can be disabled. */ }
}

export function readFavouriteIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(FAVOURITES_KEY) ?? '[]')
    return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string'))] : []
  } catch {
    return []
  }
}

export function writeFavouriteIds(ids: string[]): boolean {
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(ids))
    return true
  } catch {
    return false
  }
}

export function writeSessionLocation(coordinates: Coordinates): boolean {
  try {
    sessionStorage.setItem(SESSION_LOCATION_KEY, JSON.stringify(coordinates))
    return true
  } catch {
    return false
  }
}

export function readSessionLocation(): Coordinates | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(SESSION_LOCATION_KEY) ?? 'null')
    if (!value || typeof value !== 'object') return null
    const { latitude, longitude } = value as Partial<Coordinates>
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude ?? 91) > 90 || Math.abs(longitude ?? 181) > 180) return null
    return { latitude: latitude as number, longitude: longitude as number }
  } catch {
    return null
  }
}

export function readActiveCityPreference(availableCityIds: string[]): string | null {
  try {
    const value = localStorage.getItem(ACTIVE_CITY_KEY)
    return value && availableCityIds.includes(value) ? value : null
  } catch {
    return null
  }
}

export function writeActiveCityPreference(cityId: string): void {
  try { localStorage.setItem(ACTIVE_CITY_KEY, cityId) } catch { /* Storage can be disabled. */ }
}
