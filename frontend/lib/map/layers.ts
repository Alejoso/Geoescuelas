import L from 'leaflet'
import type { BarriosCollection, BarrioProperties } from '@/lib/api/barrios'
import { buildMaskRings } from './mask'
import { createHoverLabelController } from './hover-label'
import type { HoverLabelController } from './hover-label'

const MASK_PANE = 'barrios-mask'
// Between Leaflet's tilePane (200) and overlayPane (400): the mask covers the
// tiles but stays under the barrio outlines and any future markers.
const MASK_PANE_Z_INDEX = 350

const MASK_FILL_COLOR = '#0b1220'
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

export function bindHoverResets(map: L.Map, hover: HoverLabelController): void {
  // Dragging only, not zooming. A pan slides a different shape under a
  // stationary cursor, so the highlight must go. Wheel and double-click zoom
  // anchor on the pointer, so the same shape stays underneath.
  map.on('dragstart', hover.clear)
  map.on('mouseout', hover.clear)
}

function bindBarrioInteraction(
  properties: BarrioProperties | null,
  layer: L.Path,
  hover: HoverLabelController,
): void {
  const name = properties?.nombre ?? ''

  layer.on('mouseover', (event: L.LeafletMouseEvent) => {
    hover.activate(layer, name, event.latlng)
  })

  layer.on('mousemove', (event: L.LeafletMouseEvent) => {
    hover.activate(layer, name, event.latlng)
    hover.refresh(event.latlng)
  })

  layer.on('click', (event: L.LeafletMouseEvent) => {
    hover.refresh(event.latlng)
  })

  layer.on('mouseout', () => {
    hover.deactivate(layer)
  })
}

export function createBarriosOutlineLayer(
  map: L.Map,
  barrios: BarriosCollection,
): L.GeoJSON {
  const hover = createHoverLabelController(map, {
    idleStyle: BARRIOS_IDLE_STYLE,
    hoverStyle: BARRIOS_HOVER_STYLE,
    tooltipClassName: 'barrio-tooltip',
  })

  bindHoverResets(map, hover)

  return L.geoJSON<BarrioProperties>(barrios, {
    style: BARRIOS_IDLE_STYLE,
    onEachFeature: (feature, layer) => {
      bindBarrioInteraction(feature.properties, layer as L.Path, hover)
    },
  })
}

