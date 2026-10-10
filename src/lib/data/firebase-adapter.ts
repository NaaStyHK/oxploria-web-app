import { normalizePlaceCoordinates } from '@/lib/geo'
import type { Locale, Localized } from '@/lib/i18n/config'
import type { Place, RawFirebasePlace } from '@/lib/types'
import { resolvePlaceCategory } from '@/lib/place-taxonomy'
import { placeSlug } from '@/lib/slug'

const fieldLegacy: Record<string, string> = { name: 'nom', style: 'style', description: 'description', about: 'apropos', hours: 'horaires', price: 'prix', address: 'adresse', credit: 'credit' }
const fallbackOrder: Locale[] = ['fr', 'es', 'en']
const cleanString = (value: unknown) => typeof value === 'string' ? value.trim() : ''

function translated(raw: RawFirebasePlace, locale: Locale, field: keyof typeof fieldLegacy): string {
  const order = [locale, ...fallbackOrder.filter((item) => item !== locale)]
  if (raw.translations && typeof raw.translations === 'object') {
    for (const language of order) {
      const languageData = (raw.translations as Record<string, unknown>)[language]
      if (languageData && typeof languageData === 'object') {
        const result = cleanString((languageData as Record<string, unknown>)[field])
        if (result) return result
      }
    }
  }
  const legacy = fieldLegacy[field]
  return cleanString(raw[legacy]) || cleanString(raw[`${legacy}_${locale}`]) || order.map((language) => cleanString(raw[`${legacy}_${language}`])).find(Boolean) || ''
}

function localizedValues(raw: RawFirebasePlace, field: keyof typeof fieldLegacy): Localized { return { fr: translated(raw, 'fr', field), es: translated(raw, 'es', field), en: translated(raw, 'en', field) } }

function stringList(value: unknown): string[] { if (Array.isArray(value)) return value.map(cleanString).filter(Boolean); const item = cleanString(value); return item ? [item] : [] }
export function safeHttpUrl(value: unknown): string | undefined { const candidate = cleanString(value); if (!candidate) return undefined; try { const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined } catch { return undefined } }
export function safeImageUrl(value: unknown): string | undefined {
  const candidate = cleanString(value)
  if (!candidate) return undefined
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:') return undefined
    const bucket = 'lr-histoire-388a2.firebasestorage.app'
    const validStoragePath = url.hostname === 'storage.googleapis.com' && url.pathname.startsWith(`/${bucket}/`)
    const validDownloadPath = url.hostname === 'firebasestorage.googleapis.com' && url.pathname.startsWith(`/v0/b/${bucket}/o/`)
    return validStoragePath || validDownloadPath ? url.toString() : undefined
  } catch {
    return undefined
  }
}

export function normalizeFirebasePlace(raw: RawFirebasePlace, locale: Locale, cityId: string): Place | null {
  const names = localizedValues(raw, 'name')
  const name = names[locale]
  if (!name) { if (process.env.NODE_ENV === 'development') console.warn(`[Oxploria] Firestore place ${cityId}/${raw.id} has no usable name.`); return null }
  const coordinates = normalizePlaceCoordinates(raw)
  if (!coordinates && process.env.NODE_ENV === 'development') console.warn(`[Oxploria] Firestore place ${cityId}/${raw.id} has no valid coordinates; its page remains available but it is excluded from maps.`)
  const category = resolvePlaceCategory(raw.trie)
  const collections = stringList(raw.categories)
  return {
    id: raw.id, cityId, slug: placeSlug(name, raw.id), name, style: translated(raw, locale, 'style'), description: translated(raw, locale, 'description'), about: translated(raw, locale, 'about'), hours: translated(raw, locale, 'hours'), price: translated(raw, locale, 'price'), address: translated(raw, locale, 'address'), credit: translated(raw, locale, 'credit'), coordinates, category, categoryName: category.name[locale], categorySlug: category.slug[locale], collections, images: [raw.imageactivite, raw.imageactivite1, raw.imageactivite2].map(safeImageUrl).filter((image): image is string => Boolean(image)), website: safeHttpUrl(raw.siteinternet), telephone: cleanString(raw.telephone) || undefined, email: cleanString(raw.email) || undefined, featured: collections.includes('Incontournables'), bookingOffers: [],
  }
}
