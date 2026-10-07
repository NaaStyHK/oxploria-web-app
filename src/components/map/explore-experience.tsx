'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Layers3, List, LocateFixed, LoaderCircle, Map as MapIcon, MapPin, Search, X } from 'lucide-react'
import type { City, Coordinates, Place } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { distanceInKm, formatDistance, hasCoordinates } from '@/lib/geo'
import { matchesPlace } from '@/lib/search'
import { route } from '@/lib/routes'
import { EmptyState } from '@/components/empty-state'
import { PlaceCard } from '@/components/place-card'
import { track } from '@/lib/analytics'
import { SafeImage } from '@/components/safe-image'
import { DraggableSheet } from '@/components/map/draggable-sheet'
import { requestCurrentPosition, type GeolocationFailure } from '@/lib/browser-geolocation'
import { readPendingLocation } from '@/lib/browser-storage'
import { markerIconPath, markerTypeForCategoryId } from '@/lib/place-taxonomy'

const MapCanvas = dynamic(() => import('@/components/map/map-canvas'), { ssr: false, loading: () => <div className="map-canvas skeleton" aria-hidden="true" /> })

type LocationState = 'idle' | 'loading' | 'granted' | GeolocationFailure

export function ExploreExperience({ locale, city, places, initialPosition, initialPlaceId, collectionLabel, requestLocationOnMount = false }: { locale: Locale; city: City; places: Place[]; initialPosition?: Coordinates | null; initialPlaceId?: string; collectionLabel?: string; requestLocationOnMount?: boolean }) {
  const t = getDictionary(locale)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | undefined>(initialPlaceId)
  const [userPosition, setUserPosition] = useState<Coordinates | null>(initialPosition ?? null)
  const [locationState, setLocationState] = useState<LocationState>(initialPosition ? 'granted' : 'idle')
  const [mapError, setMapError] = useState(false)
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')
  const [recenterRequest, setRecenterRequest] = useState(0)
  const categories = useMemo(() => [...new Map(places.map((place) => [place.category.id, { id: place.category.id, name: place.categoryName }])).values()], [places])
  const filtered = useMemo(() => places
    .filter((place) => category === 'all' || place.category.id === category)
    .filter((place) => matchesPlace(place, query))
    .sort((a, b) => userPosition ? (a.coordinates ? distanceInKm(userPosition, a.coordinates) : Number.POSITIVE_INFINITY) - (b.coordinates ? distanceInKm(userPosition, b.coordinates) : Number.POSITIVE_INFINITY) : Number(b.featured) - Number(a.featured)), [places, category, query, userPosition])
  const mappablePlaces = useMemo(() => filtered.filter(hasCoordinates), [filtered])
  const validSelectedId = selectedId && filtered.some((place) => place.id === selectedId) ? selectedId : undefined
  const selected = places.find((place) => place.id === validSelectedId)
  const locationActive = locationState === 'granted' && userPosition !== null
  const resultCountLabel = `${filtered.length} ${filtered.length === 1 ? t.common.result : t.common.results}`
  const nearbyCountLabel = locationActive && filtered.length > 0
    ? t.map.nearbyResults.replace('{count}', String(filtered.length))
    : resultCountLabel

  const requestLocation = useCallback(async () => {
    track('location_requested'); setLocationState('loading')
    const result = await requestCurrentPosition()
    if (result.ok) {
      setUserPosition(result.coordinates)
      setLocationState('granted')
      setSelectedId(undefined)
      setMobileView('map')
      setRecenterRequest((value) => value + 1)
      track('location_granted')
      return
    }
    setLocationState(result.reason)
    track('location_denied', { reason: result.reason })
  }, [setLocationState, setSelectedId, setUserPosition, setMobileView, setRecenterRequest])

  useEffect(() => {
    track('map_opened', { city: city.id })
    const pending = readPendingLocation()
    if (pending) queueMicrotask(() => { setUserPosition(pending); setLocationState('granted'); setMobileView('map'); setRecenterRequest((value) => value + 1) })
    else if (requestLocationOnMount) queueMicrotask(() => { void requestLocation() })
  }, [city.id, requestLocation, requestLocationOnMount])

  const handleNearMe = () => {
    if (locationActive) {
      setSelectedId(undefined)
      setMobileView('map')
      setRecenterRequest((value) => value + 1)
      return
    }
    void requestLocation()
  }

  const selectPlace = useCallback((id: string) => { setSelectedId(id); setMobileView('map'); track('place_marker_clicked', { placeId: id }) }, [setSelectedId, setMobileView])
  const locationMessage = locationState === 'insecure' ? t.map.locationInsecure : locationState === 'denied' ? t.map.locationDenied : locationState === 'unavailable' ? t.map.locationUnavailable : locationState === 'timeout' ? t.map.locationTimeout : locationState === 'unsupported' ? t.map.locationUnsupported : locationState === 'error' ? t.map.locationError : null
  const reset = () => { setQuery(''); setCategory('all'); setSelectedId(undefined) }

  return <div className={`explore-shell mobile-view-${mobileView}`}><div className="explore-grid">
    <aside className="explore-sidebar" aria-label={t.map.resultsNear}>
      <div className="explore-toolbar"><label className="map-search"><span className="sr-only">{t.map.search}</span><input value={query} onChange={(event) => { setQuery(event.target.value); track('search_performed', { queryLength: event.target.value.length }) }} placeholder={t.map.search}/><Search size={18} aria-hidden="true" /></label>
        <div className="map-controls-row"><button type="button" className="chip proximity-chip" aria-pressed={locationActive} onClick={handleNearMe} disabled={locationState === 'loading'}>{locationState === 'loading' ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : <LocateFixed size={17} aria-hidden="true" />}{locationState === 'loading' ? t.map.locating : t.map.nearMe}</button><button className="chip" type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{t.map.all}</button>{categories.map((item) => { const icon = markerIconPath(markerTypeForCategoryId(item.id)); return <button key={item.id} type="button" className="chip category-filter-chip" aria-pressed={category === item.id} onClick={() => { setCategory(item.id); track('filter_applied', { category: item.id }) }}><span className="marker-type-icon" style={{ '--marker-icon': `url(${icon})` } as CSSProperties} aria-hidden="true" />{item.name}</button> })}</div>
        {locationMessage && <div className="notice" role="status">{locationMessage}</div>}
        {locationActive && <span className="sr-only" role="status">{t.map.locationActive}</span>}
      </div>
      <div className="results-count"><span className="mono">{filtered.length}</span> {filtered.length === 1 ? t.common.result : t.common.results}{(query || category !== 'all') && <button type="button" className="button button-light button-small" style={{ marginLeft: '.75rem', minHeight: 36 }} onClick={reset}>{t.map.reset}</button>}</div>
      <div className="explore-list">{filtered.length ? filtered.map((place, index) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} imagePreload={index === 0} distance={userPosition && place.coordinates ? formatDistance(distanceInKm(userPosition, place.coordinates), locale) : undefined} />) : <EmptyState title={t.map.noPlaces} body={t.map.noPlacesHelp} action={<button type="button" className="button button-dark" onClick={reset}>{t.common.reset}</button>} />}</div>
    </aside>
    <section className="map-panel" aria-label={t.map.title}>
      {mapError ? <div className="map-canvas"><div className="map-state"><Layers3 size={30} /><h3>{t.map.mapUnavailable}</h3><p>{t.map.mapUnavailableHelp}</p></div></div> : <MapCanvas locale={locale} places={mappablePlaces} center={city.coordinates} zoom={city.zoom} selectedId={validSelectedId} userPosition={userPosition} recenterRequest={recenterRequest} label={`${t.map.title}: ${city.name}`} onSelect={selectPlace} onError={() => setMapError(true)} />}
      {collectionLabel && <div className="map-context-label"><span>{t.guides.mapCollection}</span><strong>{collectionLabel}</strong></div>}
      {!selected && <div className="map-bottom-actions"><button type="button" className="button button-dark" onClick={() => setMobileView('list')}><List size={18} aria-hidden="true" /> {`${t.map.list} · ${filtered.length}`}</button></div>}
      {selected && <DraggableSheet className="place-preview" dismissLabel={t.map.closePreview} onDismiss={() => setSelectedId(undefined)}><div className="place-preview-image"><SafeImage src={selected.images[0] || ''} alt="" fill preload sizes="112px" fallbackLabel={t.places.photoUnavailable} /></div><div className="place-preview-copy"><span className="place-tag">{selected.categoryName}</span><h3>{selected.name}</h3><div className="muted">{userPosition && selected.coordinates ? `${formatDistance(distanceInKm(userPosition, selected.coordinates), locale)} · ` : ''}{selected.style}</div>{selected.address && <div className="place-preview-address"><MapPin size={15} aria-hidden="true"/><span>{selected.address}</span></div>}<Link className="button button-primary button-small" href={route.place(locale, city.slug, selected.slug)}>{t.map.discover}</Link></div><button type="button" className="icon-button preview-close" aria-label={t.map.closePreview} onClick={() => setSelectedId(undefined)}><X size={18}/></button></DraggableSheet>}
    </section>
    <section className="mobile-list-view" aria-label={t.map.resultsNear} aria-hidden={mobileView === 'map'}>
      <div className="mobile-list-heading"><span role={locationActive ? 'status' : undefined}>{nearbyCountLabel}</span><button type="button" className="button button-light button-small" onClick={() => setMobileView('map')}><MapIcon size={18} aria-hidden="true" /> {t.map.map}</button></div>
      <div className="explore-list mobile-list-scroll" tabIndex={mobileView === 'list' ? 0 : -1} aria-label={nearbyCountLabel}>{mobileView === 'list' && (filtered.length ? filtered.map((place, index) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} imagePreload={index === 0} distance={userPosition && place.coordinates ? formatDistance(distanceInKm(userPosition, place.coordinates), locale) : undefined} />) : <EmptyState title={t.map.noPlaces} body={t.map.noPlacesHelp} action={<button type="button" className="button button-dark" onClick={reset}>{t.common.reset}</button>} />)}</div>
    </section>
  </div></div>
}
