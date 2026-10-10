'use client'

import { useState } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import type { PlaceSummary } from '@/lib/types'
import { PlaceCard } from '@/components/place-card'

const PAGE_SIZE = 36

export function PlacesDirectory({ locale, places }: { locale: Locale; places: PlaceSummary[] }) {
  const t = getDictionary(locale)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visiblePlaces = places.slice(0, visibleCount)
  const hasMore = visibleCount < places.length

  return <div>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{visiblePlaces.length} {t.common.results}</p>
    <div className="place-grid">{visiblePlaces.map((place) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} />)}</div>
    {hasMore && <div className="directory-more"><button type="button" className="button button-dark" onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, places.length))}>{t.common.showMore}</button></div>}
  </div>
}
