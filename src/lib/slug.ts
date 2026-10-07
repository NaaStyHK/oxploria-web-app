export function slugify(value: string): string {
  const slug = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || 'place'
}

export function placeSlug(name: string, documentId: string): string {
  return `${slugify(name)}--${documentId}`
}

export function documentIdFromPlaceSlug(slug: string): string | null {
  const separator = slug.indexOf('--')
  if (separator < 1 || separator === slug.length - 2) return null
  try {
    const id = decodeURIComponent(slug.slice(separator + 2))
    if (!id || id.includes('/') || id.includes('\0') || new TextEncoder().encode(id).length > 1500) return null
    return id
  } catch {
    return null
  }
}
