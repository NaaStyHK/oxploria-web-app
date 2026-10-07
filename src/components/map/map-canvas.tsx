'use client'

import { useEffect, useRef } from 'react'
import { AttributionControl, GeoJSONSource, Map as MapLibreMap, NavigationControl, setWorkerUrl, type MapLayerMouseEvent, type StyleSpecification } from 'maplibre-gl'
import type { FeatureCollection, Point } from 'geojson'
import type { Coordinates, Place } from '@/lib/types'
import type { Locale } from '@/lib/i18n/config'

const controlLabels: Record<Locale, Record<string, string>> = {
  fr: { 'AttributionControl.ToggleAttribution': 'Afficher ou masquer les attributions', 'NavigationControl.ZoomIn': 'Zoomer', 'NavigationControl.ZoomOut': 'Dézoomer', 'Map.Title': 'Carte' },
  es: { 'AttributionControl.ToggleAttribution': 'Mostrar u ocultar atribuciones', 'NavigationControl.ZoomIn': 'Acercar', 'NavigationControl.ZoomOut': 'Alejar', 'Map.Title': 'Mapa' },
  en: { 'AttributionControl.ToggleAttribution': 'Toggle attribution', 'NavigationControl.ZoomIn': 'Zoom in', 'NavigationControl.ZoomOut': 'Zoom out', 'Map.Title': 'Map' },
}

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.45, 'raster-contrast': 0.08, 'raster-brightness-max': 0.94 } }],
}

type MappablePlace = Place & { coordinates: Coordinates }

function collection(places: MappablePlace[]): FeatureCollection<Point, { id: string; name: string }> {
  return { type: 'FeatureCollection', features: places.map((place) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [place.coordinates.longitude, place.coordinates.latitude] }, properties: { id: place.id, name: place.name } })) }
}

export default function MapCanvas({ locale, places, center, zoom, selectedId, userPosition, label, onSelect, onError }: { locale: Locale; places: MappablePlace[]; center: Coordinates; zoom: number; selectedId?: string; userPosition?: Coordinates | null; label: string; onSelect: (id: string) => void; onError: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const onSelectRef = useRef(onSelect)
  const onErrorRef = useRef(onError)
  const placesRef = useRef(places)
  const selectedIdRef = useRef(selectedId)
  const userPositionRef = useRef(userPosition)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { onErrorRef.current = onError }, [onError])
  useEffect(() => { placesRef.current = places }, [places])
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { userPositionRef.current = userPosition }, [userPosition])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    try {
      setWorkerUrl('/maplibre-gl-worker.mjs')
      const map = new MapLibreMap({ container: containerRef.current, style: mapStyle, center: [center.longitude, center.latitude], zoom, minZoom: 2, maxZoom: 19, attributionControl: false, locale: controlLabels[locale] })
      mapRef.current = map
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
      map.addControl(new AttributionControl({ compact: true }), 'bottom-right')
      map.on('load', () => {
        map.addSource('places', { type: 'geojson', data: collection(placesRef.current), cluster: true, clusterMaxZoom: 14, clusterRadius: 52 })
        map.addLayer({ id: 'clusters', type: 'circle', source: 'places', filter: ['has', 'point_count'], paint: { 'circle-color': '#151515', 'circle-radius': ['step', ['get', 'point_count'], 20, 50, 25, 150, 31], 'circle-stroke-width': 3, 'circle-stroke-color': '#FFD400' } })
        map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'places', filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Open Sans Semibold'], 'text-size': 12 }, paint: { 'text-color': '#FFFFFF' } })
        map.addLayer({ id: 'place-markers', type: 'circle', source: 'places', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#FFD400', 'circle-radius': ['case', ['==', ['get', 'id'], selectedIdRef.current ?? ''], 12, 8], 'circle-stroke-width': ['case', ['==', ['get', 'id'], selectedIdRef.current ?? ''], 4, 3], 'circle-stroke-color': '#151515' } })
        map.addLayer({ id: 'place-centres', type: 'circle', source: 'places', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#FFFFFF', 'circle-radius': 2.2 } })
        // A separate 48 px hit area keeps the visual marker compact while making
        // the whole pin reliably clickable, including its white centre on touch.
        map.addLayer({ id: 'place-hit-areas', type: 'circle', source: 'places', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': '#151515', 'circle-radius': 24, 'circle-opacity': 0.01 } })
        map.on('click', async (event: MapLayerMouseEvent) => {
          const { x, y } = event.point
          const nearbyPlaces = map.queryRenderedFeatures([[x - 24, y - 24], [x + 24, y + 24]], { layers: ['place-markers'] })
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
        const initialPlace = placesRef.current.find((place) => place.id === selectedIdRef.current)
        if (initialPlace) map.jumpTo({ center: [initialPlace.coordinates.longitude, initialPlace.coordinates.latitude], zoom: Math.max(zoom, 14) })
        const initialUserPosition = userPositionRef.current
        if (initialUserPosition) {
          const data: FeatureCollection<Point> = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [initialUserPosition.longitude, initialUserPosition.latitude] }, properties: {} }] }
          map.addSource('user-position', { type: 'geojson', data })
          map.addLayer({ id: 'user-position-ring', type: 'circle', source: 'user-position', paint: { 'circle-radius': 13, 'circle-color': 'rgba(255,212,0,.25)', 'circle-stroke-width': 1, 'circle-stroke-color': '#151515' } })
          map.addLayer({ id: 'user-position-dot', type: 'circle', source: 'user-position', paint: { 'circle-radius': 6, 'circle-color': '#151515', 'circle-stroke-width': 2, 'circle-stroke-color': '#FFFFFF' } })
          if (!initialPlace) map.jumpTo({ center: [initialUserPosition.longitude, initialUserPosition.latitude], zoom: Math.max(zoom, 14.5) })
        }
      })
      map.on('error', (event) => { if (!event.error?.message?.includes('tile')) onErrorRef.current() })
      return () => { map.remove(); mapRef.current = null }
    } catch { onErrorRef.current() }
  }, [center.latitude, center.longitude, locale, zoom])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    const source = map.getSource('places') as GeoJSONSource | undefined
    source?.setData(collection(places))
  }, [places])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return
    for (const layer of ['place-markers']) {
      if (map.getLayer(layer)) {
        map.setPaintProperty(layer, 'circle-radius', ['case', ['==', ['get', 'id'], selectedId ?? ''], 12, 8])
        map.setPaintProperty(layer, 'circle-stroke-width', ['case', ['==', ['get', 'id'], selectedId ?? ''], 4, 3])
      }
    }
    if (selectedId) {
      const place = places.find((item) => item.id === selectedId)
      if (place) map.easeTo({ center: [place.coordinates.longitude, place.coordinates.latitude], zoom: Math.max(map.getZoom(), 14), duration: 300, offset: [0, -80] })
    }
  }, [places, selectedId])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded() || !userPosition) return
    const data: FeatureCollection<Point> = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [userPosition.longitude, userPosition.latitude] }, properties: {} }] }
    if (map.getSource('user-position')) (map.getSource('user-position') as GeoJSONSource).setData(data)
    else {
      map.addSource('user-position', { type: 'geojson', data })
      map.addLayer({ id: 'user-position-ring', type: 'circle', source: 'user-position', paint: { 'circle-radius': 13, 'circle-color': 'rgba(255,212,0,.25)', 'circle-stroke-width': 1, 'circle-stroke-color': '#151515' } })
      map.addLayer({ id: 'user-position-dot', type: 'circle', source: 'user-position', paint: { 'circle-radius': 6, 'circle-color': '#151515', 'circle-stroke-width': 2, 'circle-stroke-color': '#FFFFFF' } })
    }
    map.easeTo({ center: [userPosition.longitude, userPosition.latitude], zoom: 14.5, duration: 320 })
  }, [userPosition])

  return <div ref={containerRef} className="map-canvas" role="region" aria-label={label} />
}
