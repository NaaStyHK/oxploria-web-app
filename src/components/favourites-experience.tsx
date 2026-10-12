'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { PlaceSummary } from '@/lib/types'
import { FAVOURITES_CHANGED_EVENT, readFavouriteIds, writeFavouriteIds } from '@/lib/browser-storage'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getCityById } from '@/lib/data/mock-repository'
import { route } from '@/lib/routes'
import { PlaceCard } from '@/components/place-card'
import { EmptyState } from '@/components/empty-state'

export function FavouritesExperience({ locale, places }: { locale: Locale; places: PlaceSummary[] }) {
  const t = getDictionary(locale)
  const [ids, setIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const validIds = useMemo(() => new Set(places.map((place) => place.id)), [places])
  const sync = useCallback(() => {
    const stored = readFavouriteIds()
    const valid = stored.filter((id) => validIds.has(id))
    setIds(valid)
    setReady(true)
    if (valid.length !== stored.length) writeFavouriteIds(valid)
  }, [validIds])

  useEffect(() => {
    queueMicrotask(sync)
    window.addEventListener(FAVOURITES_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(FAVOURITES_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [sync])

  const placeById = useMemo(() => new Map(places.map((place) => [place.id, place])), [places])
  const favourites = ids.map((id) => placeById.get(id)).filter((place): place is PlaceSummary => Boolean(place))
  const barcelona = getCityById('barcelona', locale)
  const laRochelle = getCityById('la-rochelle', locale)

  if (!ready) return <p className="favourites-status" role="status">{t.favourites.loading}</p>
  if (!favourites.length) return <div className="favourites-empty"><EmptyState title={t.favourites.empty} body={t.favourites.emptyHelp} action={<div className="hero-actions favourites-empty-actions">
    {barcelona && <Link className="button button-light" href={route.city(locale, barcelona.slug)}>{t.favourites.exploreBarcelona}</Link>}
    {laRochelle && <Link className="button button-light" href={route.city(locale, laRochelle.slug)}>{t.favourites.exploreLaRochelle}</Link>}
    {barcelona && <Link className="button button-primary" href={route.map(locale, barcelona.slug)}><MapPin size={18} aria-hidden="true" />{t.favourites.viewMap}</Link>}
  </div>} /></div>

  return <>
    <p className="favourites-count mono" aria-live="polite"><Heart size={16} fill="currentColor" aria-hidden="true" />{favourites.length} {favourites.length === 1 ? t.common.result : t.common.results}</p>
    <div className="place-grid favourites-grid">{favourites.map((place) => <PlaceCard key={place.id} place={place} locale={locale} showCity />)}</div>
  </>
}
