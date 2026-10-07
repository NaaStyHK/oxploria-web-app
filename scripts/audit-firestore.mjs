import nextEnv from '@next/env'
import { initializeApp, deleteApp } from 'firebase/app'
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const keys = ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'STORAGE_BUCKET', 'MESSAGING_SENDER_ID', 'APP_ID']
const config = Object.fromEntries(keys.map((key) => {
  const value = process.env[`NEXT_PUBLIC_FIREBASE_${key}`]
  if (!value) throw new Error(`Missing NEXT_PUBLIC_FIREBASE_${key}`)
  const camel = key.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  return [camel, value]
}))
const validPair = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
const coordinate = (value) => {
  if (typeof value === 'string') {
    const [lat, lng, ...rest] = value.split(',').map((part) => Number.parseFloat(part.trim()))
    return rest.length === 0 && validPair(lat, lng)
  }
  return Boolean(value && typeof value === 'object' && validPair(Number(value.latitude ?? value._lat), Number(value.longitude ?? value._long)))
}
const text = (value) => typeof value === 'string' && value.trim().length > 0
const validUrl = (value) => { try { return text(value) && ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } }

const app = initializeApp(config, 'read-only-audit')
const db = getFirestore(app)
const result = { projectId: config.projectId, collections: {} }

try {
  for (const collectionName of ['Barcelona', 'La-Rochelle']) {
    const snapshot = await getDocs(collection(db, collectionName))
    const stats = {
      count: snapshot.size,
      directDocumentRead: false,
      coordinates: { location: 0, distance: 0, latLng: 0, invalid: 0 },
      names: { fr: 0, es: 0, en: 0, legacyOnly: 0, missing: 0 },
      images: { withAtLeastOne: 0, missing: 0, invalidUrls: 0 },
      categories: {},
      collections: {},
      imageHosts: {},
      translatedFields: Object.fromEntries(['style', 'description', 'about', 'hours', 'price', 'address', 'credit'].map((field) => [field, { fr: 0, es: 0, en: 0 }])),
      samples: [],
    }
    for (const item of snapshot.docs) {
      const data = item.data()
      if (coordinate(data.location)) stats.coordinates.location++
      else if (coordinate(data.distance)) stats.coordinates.distance++
      else if (validPair(Number(data.lat), Number(data.lng))) stats.coordinates.latLng++
      else stats.coordinates.invalid++

      let translatedName = false
      for (const locale of ['fr', 'es', 'en']) {
        if (text(data.translations?.[locale]?.name)) { stats.names[locale]++; translatedName = true }
        for (const field of Object.keys(stats.translatedFields)) {
          if (text(data.translations?.[locale]?.[field])) stats.translatedFields[field][locale]++
        }
      }
      if (!translatedName && text(data.nom)) stats.names.legacyOnly++
      if (!translatedName && !text(data.nom)) stats.names.missing++

      const images = [data.imageactivite, data.imageactivite1, data.imageactivite2].filter(text)
      if (images.length) stats.images.withAtLeastOne++
      else stats.images.missing++
      stats.images.invalidUrls += images.filter((url) => !validUrl(url)).length
      for (const url of images.filter(validUrl)) {
        const host = new URL(url).hostname
        stats.imageHosts[host] = (stats.imageHosts[host] ?? 0) + 1
      }

      const category = Array.isArray(data.trie) ? String(data.trie[0] ?? '').trim() : String(data.trie ?? '').trim()
      stats.categories[category || '(missing)'] = (stats.categories[category || '(missing)'] ?? 0) + 1
      const editorialCollections = Array.isArray(data.categories) ? data.categories : text(data.categories) ? [data.categories] : []
      for (const entry of editorialCollections) stats.collections[entry] = (stats.collections[entry] ?? 0) + 1
      if (stats.samples.length < 2) stats.samples.push({ id: item.id, names: Object.fromEntries(['fr', 'es', 'en'].map((locale) => [locale, data.translations?.[locale]?.name])) })
    }
    if (snapshot.docs[0]) stats.directDocumentRead = (await getDoc(doc(db, collectionName, snapshot.docs[0].id))).exists()
    result.collections[collectionName] = stats
  }
  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  console.error(JSON.stringify({ name: error?.name, code: error?.code, message: error?.message }, null, 2))
  process.exitCode = 1
} finally {
  await deleteApp(app)
}
