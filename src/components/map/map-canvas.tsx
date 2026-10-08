'use client'

import { useEffect, useRef } from 'react'
import { AttributionControl, GeoJSONSource, Map as MapLibreMap, NavigationControl, setWorkerUrl, type MapLayerMouseEvent } from 'maplibre-gl'
import type { FeatureCollection, Point } from 'geojson'
import type { Coordinates, Place } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'
import { markerIconPath, markerTypes, resolvePlaceMarkerType, type PlaceMarkerType } from '@/lib/place-taxonomy'

const controlLabels: Record<Locale, Record<string, string>> = {
  fr: { 'AttributionControl.ToggleAttribution': 'Afficher ou masquer les attributions', 'NavigationControl.ZoomIn': 'Zoomer', 'NavigationControl.ZoomOut': 'Dézoomer', 'Map.Title': 'Carte' },
  es: { 'AttributionControl.ToggleAttribution': 'Mostrar u ocultar atribuciones', 'NavigationControl.ZoomIn': 'Acercar', 'NavigationControl.ZoomOut': 'Alejar', 'Map.Title': 'Mapa' },
  en: { 'AttributionControl.ToggleAttribution': 'Toggle attribution', 'NavigationControl.ZoomIn': 'Zoom in', 'NavigationControl.ZoomOut': 'Zoom out', 'Map.Title': 'Map' },
}

const mapStyleUrl = '/map/oxploria-light.json'
const localizedBasemapLayers = [
  'waterway_line_label',
  'water_name_point_label',
  'water_name_line_label',
  'highway-name-minor',
  'highway-name-major',
  'label_other',
  'label_village',
  'label_town',
  'label_state',
  'label_city',
  'label_city_capital',
  'label_country_3',
  'label_country_2',
  'label_country_1',
]

function localizeBasemapLabels(map: MapLibreMap, locale: Locale) {
  const localizedName = `name_${locale}`
  for (const layerId of localizedBasemapLayers) {
    if (!map.getLayer(layerId)) continue
    map.setLayoutProperty(layerId, 'text-field', ['coalesce', ['get', localizedName], ['get', 'name:latin'], ['get', 'name']])
  }
}

type MappablePlace = Place & { coordinates: Coordinates }

function collection(places: MappablePlace[]): FeatureCollection<Point, { id: string; name: string; markerType: PlaceMarkerType }> {
  return { type: 'FeatureCollection', features: places.map((place) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [place.coordinates.longitude, place.coordinates.latitude] }, properties: { id: place.id, name: place.name, markerType: resolvePlaceMarkerType(place) } })) }
}

function userPositionData(position: Coordinates): FeatureCollection<Point> {
  return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [position.longitude, position.latitude] }, properties: {} }] }
}

function showUserPosition(map: MapLibreMap, position: Coordinates) {
  const data = userPositionData(position)
  const source = map.getSource('user-position') as GeoJSONSource | undefined
  if (source) source.setData(data)
  else {
    map.addSource('user-position', { type: 'geojson', data })
    map.addLayer({ id: 'user-position-halo', type: 'circle', source: 'user-position', paint: { 'circle-radius': 17, 'circle-color': 'rgba(23,107,222,.18)' } })
    map.addLayer({ id: 'user-position-ring', type: 'circle', source: 'user-position', paint: { 'circle-radius': 10, 'circle-color': '#FFFFFF', 'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(21,21,21,.28)' } })
    map.addLayer({ id: 'user-position-dot', type: 'circle', source: 'user-position', paint: { 'circle-radius': 6, 'circle-color': '#176BDE', 'circle-stroke-width': 1.5, 'circle-stroke-color': '#FFFFFF' } })
  }
}

function focusUserPosition(map: MapLibreMap, position: Coordinates) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  map.stop()
  map.easeTo({
    center: [position.longitude, position.latitude],
    zoom: 14.25,
    duration: reducedMotion ? 0 : 360,
    essential: false,
  })
}

export default function MapCanvas({ locale, places, center, zoom, selectedId, userPosition, recenterRequest, label, onSelect, onError }: { locale: Locale; places: MappablePlace[]; center: Coordinates; zoom: number; selectedId?: string; userPosition?: Coordinates | null; recenterRequest: number; label: string; onSelect: (id: string) => void; onError: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const mapReadyRef = useRef(false)
  const onSelectRef = useRef(onSelect)
  const onErrorRef = useRef(onError)
  const placesRef = useRef(places)
  const selectedIdRef = useRef(selectedId)
  const userPositionRef = useRef(userPosition)
  const recenterRequestRef = useRef(recenterRequest)
  const appliedRecenterRef = useRef(0)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { onErrorRef.current = onError }, [onError])
  useEffect(() => { placesRef.current = places }, [places])
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { userPositionRef.current = userPosition }, [userPosition])
  useEffect(() => { recenterRequestRef.current = recenterRequest }, [recenterRequest])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    try {
      setWorkerUrl('/maplibre-gl-worker.mjs')
      const map = new MapLibreMap({ container: containerRef.current, style: mapStyleUrl, center: [center.longitude, center.latitude], zoom, minZoom: 2, maxZoom: 19, attributionControl: false, locale: controlLabels[locale] })
      mapRef.current = map
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
      const attributionControl = new AttributionControl({ compact: true })
      map.addControl(attributionControl, 'bottom-right')
      map.on('load', () => {
        void (async () => {
          const attributionContainer = containerRef.current?.querySelector<HTMLDetailsElement>('.maplibregl-ctrl-attrib')
          if (attributionContainer) attributionContainer.open = false
          localizeBasemapLabels(map, locale)
          await Promise.all(markerTypes.map(async (type) => {
            const image = await map.loadImage(markerIconPath(type))
            if (!map.hasImage(`marker-${type}`)) map.addImage(`marker-${type}`, image.data, { pixelRatio: 3 })
          }))
          if (mapRef.current !== map) return
          map.addSource('places', { type: 'geojson', data: collection(placesRef.current), cluster: true, clusterMaxZoom: 14, clusterRadius: 52 })
          map.addLayer({ id: 'clusters', type: 'circle', source: 'places', filter: ['has', 'point_count'], paint: { 'circle-color': '#151515', 'circle-radius': ['step', ['get', 'point_count'], 18, 50, 22, 150, 27], 'circle-stroke-width': 3, 'circle-stroke-color': '#FFD400' } })
          map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'places', filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 12 }, paint: { 'text-color': '#FFFFFF' } })
          map.addLayer({ id: 'place-markers', type: 'symbol', source: 'places', filter: ['!', ['has', 'point_count']], layout: { 'icon-image': ['concat', 'marker-', ['get', 'markerType']], 'icon-size': ['case', ['==', ['get', 'id'], selectedIdRef.current ?? ''], 1.28, 1], 'icon-anchor': 'bottom', 'icon-allow-overlap': true, 'icon-ignore-placement': true } })
          // A separate 48 px hit area keeps the visual pin compact and reliably
          // tappable without changing the source category icon.
          map.addLayer({ id: 'place-hit-areas', type: 'circle', source: 'places', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#151515', 'circle-radius': 24, 'circle-opacity': 0.01 } })
          map.on('click', async (event: MapLayerMouseEvent) => {
            const { x, y } = event.point
            const nearbyPlaces = map.queryRenderedFeatures([[x - 24, y - 36], [x + 24, y + 24]], { layers: ['place-markers'] })
            const id = nearbyPlaces[0]?.properties?.id
            if (typeof id === 'string') { onSelectRef.current(id); return }

            const features = map.queryRenderedFeatures(event.point, { layers: ['clusters'] })
            const clusterId = features[0]?.properties?.cluster_id
            const source = map.getSource('places') as GeoJSONSource
            if (typeof clusterId === 'number') { const clusterZoom = await source.getClusterExpansionZoom(clusterId); const coordinates = (features[0].geometry as Point).coordinates; map.easeTo({ center: [coordinates[0], coordinates[1]], zoom: clusterZoom, duration: 320 }) }
          })
          for (const layer of ['place-hit-areas', 'clusters']) {
            map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
            map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
          }
          mapReadyRef.current = true
          const initialPlace = placesRef.current.find((place) => place.id === selectedIdRef.current)
          if (initialPlace) map.jumpTo({ center: [initialPlace.coordinates.longitude, initialPlace.coordinates.latitude], zoom: Math.max(zoom, 14) })
          const initialUserPosition = userPositionRef.current
          if (initialUserPosition) {
            showUserPosition(map, initialUserPosition)
            if (recenterRequestRef.current > 0 || !initialPlace) {
              focusUserPosition(map, initialUserPosition)
              appliedRecenterRef.current = recenterRequestRef.current
            }
          }
        })().catch(() => onErrorRef.current())
      })
      map.on('error', (event) => { if (!event.error?.message?.includes('tile')) onErrorRef.current() })
      return () => { mapReadyRef.current = false; map.remove(); mapRef.current = null }
    } catch { onErrorRef.current() }
  }, [center.latitude, center.longitude, locale, zoom])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current) return
    const source = map.getSource('places') as GeoJSONSource | undefined
    source?.setData(collection(places))
  }, [places])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current) return
    if (map.getLayer('place-markers')) map.setLayoutProperty('place-markers', 'icon-size', ['case', ['==', ['get', 'id'], selectedId ?? ''], 1.28, 1])
    if (selectedId) {
      const place = placesRef.current.find((item) => item.id === selectedId)
      if (place) map.easeTo({ center: [place.coordinates.longitude, place.coordinates.latitude], zoom: Math.max(map.getZoom(), 14), duration: 300, offset: [0, -80] })
    }
  }, [selectedId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReadyRef.current || !userPosition) return
    showUserPosition(map, userPosition)
    if (recenterRequest > appliedRecenterRef.current) {
      focusUserPosition(map, userPosition)
      appliedRecenterRef.current = recenterRequest
    }
  }, [recenterRequest, userPosition])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => mapRef.current?.resize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return <div ref={containerRef} className="map-canvas" role="region" aria-label={label} />
}
