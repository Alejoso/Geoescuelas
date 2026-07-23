import L from 'leaflet'
import type { BarriosCollection, BarrioProperties } from '@/lib/api/barrios'
import { buildMaskRings } from './mask'

const MASK_PANE = 'barrios-mask'
// Between Leaflet's tilePane (200) and overlayPane (400): the mask covers the
// tiles but stays under the barrio outlines and any future markers.
const MASK_PANE_Z_INDEX = 200

const MASK_FILL_COLOR = '#F9F5EC'
const BARRIOS_LINE_COLOR = '#c2a818'
const BARRIOS_LINE_WEIGHT = 1.5
const BARRIOS_HOVER_LINE_WEIGHT = 3
const BARRIOS_HOVER_FILL_OPACITY = 0.25

// A transparent fill still receives pointer events, while `fill: false` does
// not. This is what makes the whole polygon hoverable instead of just the
// 1.5px outline.
const BARRIOS_IDLE_STYLE: L.PathOptions = {
  color: BARRIOS_LINE_COLOR,
  weight: BARRIOS_LINE_WEIGHT,
  fillColor: BARRIOS_LINE_COLOR,
  fillOpacity: 0,
}

const BARRIOS_HOVER_STYLE: L.PathOptions = {
  color: BARRIOS_LINE_COLOR,
  weight: BARRIOS_HOVER_LINE_WEIGHT,
  fillColor: BARRIOS_LINE_COLOR,
  fillOpacity: BARRIOS_HOVER_FILL_OPACITY,
}

// Leaflet paints vector layers over the viewport plus this fraction on each
// side, and only repaints at zoomend/moveend. The default 0.1 is not enough:
// zooming out one level halves the painted area and briefly exposes the tiles
// underneath. 2 paints five viewports wide, which survives a two-level
// zoom-out and a fast drag.
const MASK_RENDERER_PADDING = 2

export function createMaskPane(map: L.Map): void {
  const pane = map.createPane(MASK_PANE)
  pane.style.zIndex = String(MASK_PANE_Z_INDEX)
  pane.style.pointerEvents = 'none'
}

export function createMaskLayer(barrios: BarriosCollection): L.Polygon {
  const rings = buildMaskRings(barrios)

  const renderer = L.svg({
    pane: MASK_PANE,
    padding: MASK_RENDERER_PADDING,
  })

  return L.polygon(rings, {
    renderer,
    pane: MASK_PANE,
    stroke: false,
    fillColor: MASK_FILL_COLOR,
    fillOpacity: 1,
    fillRule: 'evenodd',
    interactive: false,
  })
}

const TOOLTIP_OFFSET: L.PointTuple = [0, -8]

type BarrioHoverController = {
  activate(layer: L.Path, name: string, latlng: L.LatLng): void
  refresh(latlng: L.LatLng): void
  deactivate(layer: L.Path): void
  clear(): void
}

function createBarrioHoverController(map: L.Map): BarrioHoverController {
  const tooltip = L.tooltip({
    direction: 'top',
    offset: TOOLTIP_OFFSET,
    className: 'barrio-tooltip',
  })

  let activeLayer: L.Path | null = null
  let activeName = ''

  // Single place that puts the tooltip on screen. Re-adds it when something
  // outside the controller removed it, which a click does.
  function showTooltip(latlng: L.LatLng): void {
    if (!activeName) return

    tooltip.setContent(activeName)
    tooltip.setLatLng(latlng)

    if (!map.hasLayer(tooltip)) {
      tooltip.addTo(map)
    }
  }

  function clear(): void {
    if (!activeLayer) return

    activeLayer.setStyle(BARRIOS_IDLE_STYLE)
    activeLayer = null
    activeName = ''
    tooltip.remove()
  }

  function activate(layer: L.Path, name: string, latlng: L.LatLng): void {
    if (layer === activeLayer) return

    clear()

    layer.setStyle(BARRIOS_HOVER_STYLE)
    layer.bringToFront()
    activeLayer = layer
    activeName = name

    showTooltip(latlng)
  }

  // Repositions the tooltip, and restores it if it went missing.
  function refresh(latlng: L.LatLng): void {
    if (!activeLayer) return
    showTooltip(latlng)
  }

  function deactivate(layer: L.Path): void {
    if (layer !== activeLayer) return
    clear()
  }

  return { activate, refresh, deactivate, clear }
}

function bindHoverResets(map: L.Map, hover: BarrioHoverController): void {
  // Panning slides polygons under a stationary cursor, which is where the
  // browser's own mouseout is least reliable. Covers zoom too.
  map.on('dragstart', hover.clear)
  // The cursor can leave the map without ever crossing a polygon edge.
  map.on('mouseout', hover.clear)
}

function bindBarrioInteraction(
  properties: BarrioProperties | null,
  layer: L.Path,
  hover: BarrioHoverController,
): void {
  const name = properties?.nombre ?? ''

  layer.on('mouseover', (event: L.LeafletMouseEvent) => {
    hover.activate(layer, name, event.latlng)
  })

  layer.on('mousemove', (event: L.LeafletMouseEvent) => {
    hover.activate(layer, name, event.latlng)
    hover.refresh(event.latlng)
  })

  layer.on('mouseout', () => {
    hover.deactivate(layer)
  })

  // Puts the tooltip straight back after the click removed it, instead of
  // waiting for the next cursor movement to heal it.
  layer.on('click', (event: L.LeafletMouseEvent) => {
    hover.refresh(event.latlng)
  })
}

export function createBarriosOutlineLayer(
  map: L.Map,
  barrios: BarriosCollection,
): L.GeoJSON {
  const hover = createBarrioHoverController(map)

  bindHoverResets(map, hover)

  return L.geoJSON<BarrioProperties>(barrios, {
    style: BARRIOS_IDLE_STYLE,
    onEachFeature: (feature, layer) => {
      bindBarrioInteraction(feature.properties, layer as L.Path, hover)
    },
  })
}

