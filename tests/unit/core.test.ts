import { describe, expect, it, vi } from 'vitest'
import { normalizeFirebasePlace, safeHttpUrl, safeImageUrl } from '@/lib/data/firebase-adapter'
import { withFirestoreRetry } from '@/lib/data/firestore-retry'
import { toPlaceSummary } from '@/lib/data/place-summary'
import { normalizePlaceCoordinates, parseFirebaseCoordinates } from '@/lib/geo'
import { resolvePlaceCategory } from '@/lib/place-taxonomy'
import { documentIdFromPlaceSlug, placeSlug, slugify } from '@/lib/slug'
import { siteUrlFromEnvironment } from '@/lib/site-url'
import type { Place, RawFirebasePlace } from '@/lib/types'

const category = resolvePlaceCategory('Architecture')

const completePlace: Place = {
  id: 'place/1', cityId: 'barcelona', slug: 'test--place%2F1', name: 'Test', style: 'Architecture', description: 'Long description', about: 'Long about', hours: '10–18', price: '10 €', address: '1 rue', credit: 'Photo', coordinates: { latitude: 41.38, longitude: 2.17 }, category, categoryName: category.name.fr, categorySlug: category.slug.fr, collections: ['Incontournables'], images: ['https://example.test/one.jpg', 'https://example.test/two.jpg'], featured: true, bookingOffers: [],
}

describe('slug and route identity', () => {
  it('normalizes accents and round-trips encoded document ids', () => {
    expect(slugify('Plaça de l’Àngel')).toBe('placa-de-l-angel')
    const slug = placeSlug('Plaça', 'document-123')
    expect(documentIdFromPlaceSlug(slug)).toBe('document-123')
    expect(documentIdFromPlaceSlug('unsafe--a/b')).toBeNull()
  })
})

describe('coordinates and taxonomy', () => {
  it('accepts supported Firestore coordinate shapes and rejects invalid ranges', () => {
    expect(parseFirebaseCoordinates({ _lat: 41.38, _long: 2.17 })).toEqual({ latitude: 41.38, longitude: 2.17 })
    expect(normalizePlaceCoordinates({ location: 'bad', lat: '46.15', lng: '-1.15' })).toEqual({ latitude: 46.15, longitude: -1.15 })
    expect(parseFirebaseCoordinates('91,2')).toBeNull()
  })

  it('normalizes known and unknown categories', () => {
    expect(resolvePlaceCategory('Arquitectura').id).toBe('architecture')
    expect(resolvePlaceCategory('Atelier secret').slug.fr).toBe('atelier-secret')
  })
})

describe('Firebase adapter and URL validation', () => {
  it('uses the requested translation then falls back without losing identity', () => {
    const raw: RawFirebasePlace = { id: 'abc', translations: { fr: { name: 'Nom français', style: 'Musée' }, en: { name: 'English name' } }, location: { latitude: 41, longitude: 2 }, trie: 'Architecture', categories: 'Incontournables' }
    const place = normalizeFirebasePlace(raw, 'es', 'barcelona')
    expect(place?.name).toBe('Nom français')
    expect(place?.collections).toEqual(['Incontournables'])
  })

  it('accepts only expected image hosts and safe http links', () => {
    expect(safeHttpUrl('example.com')).toBe('https://example.com/')
    expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined()
    expect(safeImageUrl('https://storage.googleapis.com/lr-histoire-388a2.firebasestorage.app/image.jpg')).toContain('storage.googleapis.com')
    expect(safeImageUrl('https://example.com/image.jpg')).toBeUndefined()
  })
})

describe('PlaceSummary', () => {
  it('keeps list fields and drops full-detail content and secondary images', () => {
    const summary = toPlaceSummary(completePlace)
    expect(summary.images).toEqual([completePlace.images[0]])
    expect(summary).not.toHaveProperty('description')
    expect(summary).not.toHaveProperty('about')
    expect(summary).not.toHaveProperty('hours')
    expect(summary).not.toHaveProperty('bookingOffers')
  })
})

describe('site URL and Firestore retry', () => {
  it('uses explicit URL, then Vercel, and rejects an unconfigured production build', () => {
    expect(siteUrlFromEnvironment({ NODE_ENV: 'test', NEXT_PUBLIC_SITE_URL: 'https://stage.example/path' } as NodeJS.ProcessEnv)).toBe('https://stage.example')
    expect(siteUrlFromEnvironment({ NODE_ENV: 'test', VERCEL_PROJECT_PRODUCTION_URL: 'app.vercel.app' } as NodeJS.ProcessEnv)).toBe('https://app.vercel.app')
    expect(() => siteUrlFromEnvironment({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toThrow(/required/)
  })

  it('retries transient failures at most three times and never retries permission errors', async () => {
    const sleep = vi.fn(async () => undefined)
    const transient = Object.assign(new Error('temporary'), { code: 'unavailable' })
    const task = vi.fn().mockRejectedValueOnce(transient).mockRejectedValueOnce(transient).mockResolvedValue('ok')
    await expect(withFirestoreRetry('test', task, { sleep, random: () => 0 })).resolves.toBe('ok')
    expect(task).toHaveBeenCalledTimes(3)
    expect(sleep).toHaveBeenNthCalledWith(1, 250)
    expect(sleep).toHaveBeenNthCalledWith(2, 500)

    const denied = Object.assign(new Error('denied'), { code: 'permission-denied' })
    const deniedTask = vi.fn().mockRejectedValue(denied)
    await expect(withFirestoreRetry('test', deniedTask, { sleep })).rejects.toThrow('after 1 attempt')
    expect(deniedTask).toHaveBeenCalledOnce()
  })
})
