'use client'

import { useEffect, useRef, useState} from 'react'
import L from 'leaflet'

import { fetchBarrios } from '@/lib/api/barrios'
import {
  createBarriosOutlineLayer,
  createMaskLayer,
  createMaskPane,
} from '@/lib/map/layers'

import { fetchSchools } from '@/lib/api/schools'
import { createSchoolsLayer, createSchoolsPane, SchoolsLayerHandle } from '@/lib/map/schoolsMarkers'

import SearchBar from './SearchBar'
import type { School } from '@/lib/api/schools'
import SchoolDetailPane from './SchoolDetailPane'
import { flyToSchool } from '@/lib/map/fly'


const MEDELLIN_CENTER: L.LatLngTuple = [6.2442, -75.5812]
const INITIAL_ZOOM = 12

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION = '© OpenStreetMap contributors'

// 1 makes maxBounds a hard wall. The default 0 lets the user drag well past
// the edge and bounce back, which drags unmasked area into view.
const MAX_BOUNDS_VISCOSITY = 1

// Fraction of the barrios bounds allowed as slack around the edges.
const MAX_BOUNDS_PADDING = 0.05

export default function Map() {

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const schoolsHandleRef = useRef<SchoolsLayerHandle | null>(null)

  const [isMapReady, setIsMapReady] = useState(false)

  function handleSelectSchool(school: School) {
    setSelectedSchool(school)

    const map = mapRef.current
    const handle = schoolsHandleRef.current
    if (!map || !handle) return

    flyToSchool(map, school.coordinates)
    handle.selectSchool(school)
  }

  const selectHandlerRef = useRef(handleSelectSchool)
  selectHandlerRef.current = handleSelectSchool

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const map = L.map(container , {maxBoundsViscosity: MAX_BOUNDS_VISCOSITY}).setView(MEDELLIN_CENTER, INITIAL_ZOOM)
    mapRef.current = map
    map.zoomControl.setPosition('topright')

    console.log('AT CREATE:', container.clientWidth, container.clientHeight)

    const resizeObserver = new ResizeObserver(() => {
      console.log('OBSERVER FIRED:', container.clientWidth, container.clientHeight)
      map.invalidateSize()
    })
    resizeObserver.observe(container)

    createMaskPane(map)
    createSchoolsPane(map)

    const tileLayer = L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION })

    // Workaround for a Turbopack dev-mode bug: stylesheet rules resetting
    // Tailwind preflight's `img { max-width: 100% }` are present in the CSSOM
    // but not applied on fresh loads, which collapses every 256px tile to
    // width 0. Inline styles bypass stylesheet delivery entirely.
    tileLayer.on('tileloadstart', (event: L.TileEvent) => {
      event.tile.style.maxWidth = 'none'
    })

    tileLayer.addTo(map)

    // Fallback: reveal even if a tile stalls, or if every tile is cached and
    // 'load' fired before this handler attached.
    const readyTimeout = window.setTimeout(() => setIsMapReady(true), 1200)

    const abortController = new AbortController()
    let cancelled = false

    async function loadBarrios() {
      try {
        const barrios = await fetchBarrios(abortController.signal)
        if (cancelled) return
        
        const maskLayer = createMaskLayer(barrios)
        maskLayer.addTo(map)

        const outlineLayer = createBarriosOutlineLayer(map, barrios)
        outlineLayer.addTo(map)

        const barriosBounds = outlineLayer.getBounds()

        map.fitBounds(barriosBounds, { animate: false })
        map.setMinZoom(map.getZoom())
        map.setMaxBounds(barriosBounds.pad(MAX_BOUNDS_PADDING))
      } catch (error) {
        if (cancelled) return
        console.error('Error loading barrios:', error)
      }
    }

    async function loadSchools() {
      try {
        const schools = await fetchSchools(abortController.signal)
        if (cancelled) return

        setSchools(schools)

        const handle = createSchoolsLayer(map, schools, school =>
          selectHandlerRef.current(school),
        )
        handle.layer.addTo(map)
        schoolsHandleRef.current = handle
        
      } catch (error) {
        if (cancelled) return
        console.error('Error loading schools:', error)
      }
    }

    loadBarrios()
    loadSchools()
    
    return () => {
      cancelled = true
      resizeObserver.disconnect()
      window.clearTimeout(readyTimeout)
      abortController.abort()
      map.remove()
      mapRef.current = null
    }

  }, [])

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div
        ref={containerRef}
        className={isMapReady ? 'map-canvas map-canvas--ready' : 'map-canvas'}
        style={{ height: '100%', width: '100%' }}
      />
      <div className={isMapReady ? 'map-loader map-loader--hidden' : 'map-loader'}>
        <div className="map-loader__spinner" aria-label="Cargando mapa" />
      </div>
      <SearchBar schools={schools} onSelect={handleSelectSchool} />
      <SchoolDetailPane
        school={selectedSchool}
        onClose={() => {
          setSelectedSchool(null)
          schoolsHandleRef.current?.clearSelection()
        }}
      />
    </div>
  )
}