'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

import { fetchBarrios } from '@/lib/api/barrios'
import {
  createBarriosOutlineLayer,
  createMaskLayer,
  createMaskPane,
} from '@/lib/map/layers'

import { fetchSchools } from '@/lib/api/schools'
import { createSchoolsLayer, createSchoolsPane } from '@/lib/map/schoolsMarkers'

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

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const map = L.map(container , {maxBoundsViscosity: MAX_BOUNDS_VISCOSITY}).setView(MEDELLIN_CENTER, INITIAL_ZOOM)
    mapRef.current = map

    createMaskPane(map)
    createSchoolsPane(map)

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
        
        // Takes barriosBounds. In this way it does not request any tiles outside
        const tileLayer = L.tileLayer(TILE_URL, {
          attribution: TILE_ATTRIBUTION,
          bounds: barriosBounds,
        })
        tileLayer.addTo(map)

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

        const schoolsLayer = createSchoolsLayer(schools)
        schoolsLayer.addTo(map)
      } catch (error) {
        if (cancelled) return
        console.error('Error loading schools:', error)
      }
    }

    loadBarrios()
    loadSchools()
    
    return () => {
      cancelled = true
      abortController.abort()
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}