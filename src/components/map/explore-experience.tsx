'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode, type WheelEvent } from 'react'
import { ChevronLeft, ChevronRight, Layers3, List, LocateFixed, LoaderCircle, Map as MapIcon, MapPin, Search, Star, UsersRound, X } from 'lucide-react'
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
import { hasEditorialCollection, markerIconPath, markerTypeForCategoryId, type PlaceMarkerType } from '@/lib/place-taxonomy'

const MapCanvas = dynamic(() => import('@/components/map/map-canvas'), { ssr: false, loading: () => <div className="map-canvas skeleton" aria-hidden="true" /> })

type LocationState = 'idle' | 'loading' | 'granted' | GeolocationFailure
type EditorialSelection = 'Incontournables' | 'En famille'

const categoryOrder: PlaceMarkerType[] = ['culture', 'nature', 'activity', 'local', 'bar', 'restaurant', 'nightlife', 'generic']

function FilterRail({ label, previousLabel, nextLabel, children }: { label: string; previousLabel: string; nextLabel: string; children: ReactNode }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  const updateEdges = useCallback(() => {
    const row = rowRef.current
    if (!row) return
    const maxScroll = row.scrollWidth - row.clientWidth
    setEdges({ left: row.scrollLeft > 2, right: row.scrollLeft < maxScroll - 2 })
  }, [])

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    updateEdges()
    const observer = new ResizeObserver(updateEdges)
    observer.observe(row)
    for (const child of row.children) observer.observe(child)
    row.addEventListener('scroll', updateEdges, { passive: true })
    return () => { observer.disconnect(); row.removeEventListener('scroll', updateEdges) }
  }, [updateEdges])

  const move = (direction: -1 | 1) => {
    const row = rowRef.current
    if (!row) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    row.scrollBy({ left: direction * Math.max(180, row.clientWidth * .72), behavior: reducedMotion ? 'auto' : 'smooth' })
  }
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const row = event.currentTarget
    const maxScroll = row.scrollWidth - row.clientWidth
    if (maxScroll <= 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
    const nextScroll = Math.max(0, Math.min(maxScroll, row.scrollLeft + event.deltaY))
    if (nextScroll === row.scrollLeft) return
    event.preventDefault()
    row.scrollLeft = nextScroll
  }
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    move(event.key === 'ArrowLeft' ? -1 : 1)
  }
  const revealActiveChip = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[aria-pressed]') : null
    if (!target) return
    requestAnimationFrame(() => {
      if (target.getAttribute('aria-pressed') !== 'true') return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const reveal = () => {
        if (target.getAttribute('aria-pressed') === 'true') target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'nearest', block: 'nearest' })
      }
      reveal()
      window.setTimeout(reveal, reducedMotion ? 0 : 260)
    })
  }

  return <div className="filter-rail">
    {edges.left && <button type="button" className="filter-scroll-button filter-scroll-previous" aria-label={previousLabel} onClick={() => move(-1)}><ChevronLeft size={17} aria-hidden="true" /></button>}
    <div className="filter-scroll-viewport" data-scroll-left={edges.left} data-scroll-right={edges.right}>
      <div ref={rowRef} className="map-controls-row" role="group" aria-label={label} tabIndex={0} onClick={revealActiveChip} onWheel={handleWheel} onKeyDown={handleKeyDown}>{children}</div>
    </div>
    {edges.right && <button type="button" className="filter-scroll-button filter-scroll-next" aria-label={nextLabel} onClick={() => move(1)}><ChevronRight size={17} aria-hidden="true" /></button>}
  </div>
}

export function ExploreExperience({ locale, city, places, initialPosition, initialPlaceId, collectionLabel, requestLocationOnMount = false }: { locale: Locale; city: City; places: Place[]; initialPosition?: Coordinates | null; initialPlaceId?: string; collectionLabel?: string; requestLocationOnMount?: boolean }) {
  const t = getDictionary(locale)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string | undefined>(initialPlaceId)
  const [userPosition, setUserPosition] = useState<Coordinates | null>(initialPosition ?? null)
  const [locationState, setLocationState] = useState<LocationState>(initialPosition ? 'granted' : 'idle')
  const [proximityActive, setProximityActive] = useState(Boolean(initialPosition))
  const [editorialSelection, setEditorialSelection] = useState<EditorialSelection | null>(null)
  const [mapError, setMapError] = useState(false)
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')
  const [recenterRequest, setRecenterRequest] = useState(0)
  const categories = useMemo(() => [...new Map(places.map((place) => [place.category.id, { id: place.category.id, name: place.categoryName }])).values()]
    .sort((a, b) => {
      const typeDifference = categoryOrder.indexOf(markerTypeForCategoryId(a.id)) - categoryOrder.indexOf(markerTypeForCategoryId(b.id))
      return typeDifference || a.name.localeCompare(b.name, locale)
    }), [places, locale])
  const locationActive = proximityActive && locationState === 'granted' && userPosition !== null
  const filtered = useMemo(() => places
    .filter((place) => category === 'all' || place.category.id === category)
    .filter((place) => !editorialSelection || hasEditorialCollection(place, editorialSelection))
    .filter((place) => matchesPlace(place, query))
    .sort((a, b) => locationActive && userPosition ? (a.coordinates ? distanceInKm(userPosition, a.coordinates) : Number.POSITIVE_INFINITY) - (b.coordinates ? distanceInKm(userPosition, b.coordinates) : Number.POSITIVE_INFINITY) : Number(b.featured) - Number(a.featured)), [places, category, editorialSelection, query, locationActive, userPosition])
  const mappablePlaces = useMemo(() => filtered.filter(hasCoordinates), [filtered])
  const validSelectedId = selectedId && filtered.some((place) => place.id === selectedId) ? selectedId : undefined
  const selected = places.find((place) => place.id === validSelectedId)
  const filtersActive = locationActive || editorialSelection !== null || category !== 'all' || Boolean(query)
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
      setProximityActive(true)
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
    if (pending) queueMicrotask(() => { setUserPosition(pending); setLocationState('granted'); setProximityActive(true); setMobileView('map'); setRecenterRequest((value) => value + 1) })
    else if (requestLocationOnMount) queueMicrotask(() => { void requestLocation() })
  }, [city.id, requestLocation, requestLocationOnMount])

  const handleNearMe = () => {
    if (userPosition && locationState === 'granted') {
      setProximityActive(true)
      setSelectedId(undefined)
      setMobileView('map')
      setRecenterRequest((value) => value + 1)
      return
    }
    void requestLocation()
  }

  const selectPlace = useCallback((id: string) => { setSelectedId(id); setMobileView('map'); track('place_marker_clicked', { placeId: id }) }, [setSelectedId, setMobileView])
  const locationMessage = locationState === 'insecure' ? t.map.locationInsecure : locationState === 'denied' ? t.map.locationDenied : locationState === 'unavailable' ? t.map.locationUnavailable : locationState === 'timeout' ? t.map.locationTimeout : locationState === 'unsupported' ? t.map.locationUnsupported : locationState === 'error' ? t.map.locationError : null
  const reset = () => { setQuery(''); setCategory('all'); setEditorialSelection(null); setProximityActive(false); setSelectedId(undefined) }
  const toggleEditorial = (selection: EditorialSelection) => setEditorialSelection((current) => current === selection ? null : selection)

  return <div className={`explore-shell mobile-view-${mobileView}`}><div className="explore-grid">
    <aside className="explore-sidebar" aria-label={t.map.resultsNear}>
      <div className="explore-toolbar"><label className="map-search"><span className="sr-only">{t.map.search}</span><input value={query} onChange={(event) => { setQuery(event.target.value); track('search_performed', { queryLength: event.target.value.length }) }} placeholder={t.map.search}/><Search size={18} aria-hidden="true" /></label>
        <div className="map-filter-section"><span className="filter-group-label">{t.map.discoverFilters}</span><FilterRail label={t.map.discoverFilters} previousLabel={t.map.previousFilters} nextLabel={t.map.nextFilters}><button type="button" className="chip proximity-chip" aria-pressed={locationActive} onClick={handleNearMe} disabled={locationState === 'loading'}>{locationState === 'loading' ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : <LocateFixed size={17} aria-hidden="true" />}{locationState === 'loading' ? t.map.locating : t.map.nearMe}</button><button type="button" className="chip editorial-filter-chip" aria-pressed={editorialSelection === 'Incontournables'} onClick={() => toggleEditorial('Incontournables')}><Star size={17} aria-hidden="true" />{t.map.mustSee}</button><button type="button" className="chip editorial-filter-chip" aria-pressed={editorialSelection === 'En famille'} onClick={() => toggleEditorial('En famille')}><UsersRound size={18} aria-hidden="true" />{t.map.family}</button></FilterRail></div>
        <div className="map-filter-section"><span className="filter-group-label">{t.map.categories}</span><FilterRail label={t.map.categories} previousLabel={t.map.previousFilters} nextLabel={t.map.nextFilters}><button className="chip" type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{t.map.all}</button>{categories.map((item) => { const icon = markerIconPath(markerTypeForCategoryId(item.id)); return <button key={item.id} type="button" className="chip category-filter-chip" aria-pressed={category === item.id} onClick={() => { setCategory(item.id); track('filter_applied', { category: item.id }) }}><span className="marker-type-icon" style={{ '--marker-icon': `url(${icon})` } as CSSProperties} aria-hidden="true" />{item.name}</button> })}</FilterRail></div>
        {locationMessage && <div className="notice" role="status">{locationMessage}</div>}
        {locationActive && <span className="sr-only" role="status">{t.map.locationActive}</span>}
        <div className="results-count"><span><span className="mono">{filtered.length}</span> {filtered.length === 1 ? t.common.result : t.common.results}</span>{filtersActive && <button type="button" className="results-reset" onClick={reset}>{t.map.reset}</button>}</div>
      </div>
      <div className="explore-list">{filtered.length ? filtered.map((place, index) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} imagePreload={index === 0} distance={locationActive && userPosition && place.coordinates ? formatDistance(distanceInKm(userPosition, place.coordinates), locale) : undefined} />) : <EmptyState title={t.map.noPlaces} body={t.map.noPlacesHelp} action={<button type="button" className="button button-dark" onClick={reset}>{t.map.reset}</button>} />}</div>
    </aside>
    <section className="map-panel" aria-label={t.map.title}>
      {mapError ? <div className="map-canvas"><div className="map-state"><Layers3 size={30} /><h3>{t.map.mapUnavailable}</h3><p>{t.map.mapUnavailableHelp}</p></div></div> : <MapCanvas locale={locale} places={mappablePlaces} center={city.coordinates} zoom={city.zoom} selectedId={validSelectedId} userPosition={userPosition} recenterRequest={recenterRequest} label={`${t.map.title}: ${city.name}`} onSelect={selectPlace} onError={() => setMapError(true)} />}
      {collectionLabel && <div className="map-context-label"><span>{t.guides.mapCollection}</span><strong>{collectionLabel}</strong></div>}
      {!selected && <div className="map-bottom-actions"><button type="button" className="button button-dark" onClick={() => setMobileView('list')}><List size={18} aria-hidden="true" /> {`${t.map.list} · ${filtered.length}`}</button></div>}
      {selected && <DraggableSheet className="place-preview" dismissLabel={t.map.closePreview} onDismiss={() => setSelectedId(undefined)}><div className="place-preview-image"><SafeImage src={selected.images[0] || ''} alt="" fill preload sizes="112px" fallbackLabel={t.places.photoUnavailable} /></div><div className="place-preview-copy"><span className="place-tag">{selected.categoryName}</span><h3>{selected.name}</h3><div className="muted">{locationActive && userPosition && selected.coordinates ? `${formatDistance(distanceInKm(userPosition, selected.coordinates), locale)} · ` : ''}{selected.style}</div>{selected.address && <div className="place-preview-address"><MapPin size={15} aria-hidden="true"/><span>{selected.address}</span></div>}<Link className="button button-primary button-small" href={route.place(locale, city.slug, selected.slug)}>{t.map.discover}</Link></div><button type="button" className="icon-button preview-close" aria-label={t.map.closePreview} onClick={() => setSelectedId(undefined)}><X size={18}/></button></DraggableSheet>}
    </section>
    <section className="mobile-list-view" aria-label={t.map.resultsNear} aria-hidden={mobileView === 'map'}>
      <div className="mobile-list-heading"><span role={locationActive ? 'status' : undefined}>{nearbyCountLabel}</span><button type="button" className="button button-light button-small" onClick={() => setMobileView('map')}><MapIcon size={18} aria-hidden="true" /> {t.map.map}</button></div>
      <div className="explore-list mobile-list-scroll" tabIndex={mobileView === 'list' ? 0 : -1} aria-label={nearbyCountLabel}>{mobileView === 'list' && (filtered.length ? filtered.map((place, index) => <PlaceCard key={place.id} place={place} locale={locale} showCity={false} imagePreload={index === 0} distance={locationActive && userPosition && place.coordinates ? formatDistance(distanceInKm(userPosition, place.coordinates), locale) : undefined} />) : <EmptyState title={t.map.noPlaces} body={t.map.noPlacesHelp} action={<button type="button" className="button button-dark" onClick={reset}>{t.map.reset}</button>} />)}</div>
    </section>
  </div></div>
}
