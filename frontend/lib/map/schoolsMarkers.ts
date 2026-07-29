import type { School } from '@/lib/api/schools'
import L from 'leaflet'
import { createHoverLabelController } from './hover-label'
import type { HoverLabelController } from './hover-label'
import { bindHoverResets } from './layers'

const SCHOOLS_PANE = 'schools'
// Above overlayPane (400), where the barrio polygons live. Barrio hover calls
// bringToFront(), which would otherwise put a polygon on top of the markers.
const SCHOOLS_PANE_Z_INDEX = 450

const SCHOOL_MARKER_STYLE: L.CircleMarkerOptions = {
  radius: 6,
  color: '#ffffff',
  weight: 2,
  fillColor: '#1a2744',
  fillOpacity: 0.95,
}

const SCHOOL_MARKER_IDLE_STYLE: L.CircleMarkerOptions = {
  radius: 6,
  weight: 2,
  color: '#ffffff',
  fillColor: '#1a2744',
  opacity: 1,
  fillOpacity: 0.95,
}

const SCHOOL_MARKER_HOVER_STYLE: L.CircleMarkerOptions = {
  radius: 8,
  weight: 2,
  color: '#ffffff',
  fillColor: '#3B82F6',
  opacity: 1,
  fillOpacity: 0.95,
}

const SCHOOL_MARKER_HIDDEN_STYLE: L.CircleMarkerOptions = {
  radius: 6,
  opacity: 0,
  fillOpacity: 0,
}

const SELECTION_PIN_ICON_SIZE: L.PointTuple = [32, 42]
// Anchor at the tip so the point sits exactly on the coordinate.
const SELECTION_PIN_ICON_ANCHOR: L.PointTuple = [16, 41]
// Lift the label clear of the pin head (the pin rises ~42px from its tip).
const SELECTION_LABEL_OFFSET: L.PointTuple = [0, -48]

function createSelectionPinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'school-pin',
    iconSize: SELECTION_PIN_ICON_SIZE,
    iconAnchor: SELECTION_PIN_ICON_ANCHOR,
    html: `
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1C8.3 1 2 7.3 2 15c0 9.4 14 26 14 26s14-16.6 14-26C30 7.3 23.7 1 16 1z"
              fill="#3B82F6" stroke="#ffffff" stroke-width="2" />
        <circle cx="16" cy="15" r="5" fill="#ffffff" />
      </svg>
    `,
  })
}

type SelectionController = {
  select(school: School, marker: L.CircleMarker): void
  clear(): void
}

function createSelectionController(
  map: L.Map,
  hover: HoverLabelController,
): SelectionController {
  const pin = L.marker([0, 0], {
    icon: createSelectionPinIcon(),
    // Interactive so its icon absorbs pointer events over the hidden circle
    // underneath — otherwise hovering the selected spot re-fires hover on a
    // dot we've deliberately hidden.
    interactive: true,
    keyboard: false,
  })

  // Standalone, not bound to the pin: full control over position and content,
  // and immune to the deferred-open behaviour we hit with bound tooltips.
  const label = L.tooltip({
    direction: 'top',
    offset: SELECTION_LABEL_OFFSET,
    className: 'school-label school-label--selected',
  })

  let selectedMarker: L.CircleMarker | null = null

  function clear(): void {
    if (!selectedMarker) return

    // Put the dot back where the pin was.
    selectedMarker.addTo(map)
    selectedMarker = null
    pin.remove()
    label.remove()
  }

  function select(school: School, marker: L.CircleMarker): void {
    hover.clear()

    // Restore the previously selected dot before hiding the new one.
    if (selectedMarker && selectedMarker !== marker) {
      selectedMarker.addTo(map)
    }

    selectedMarker = marker
    marker.remove()   // erase the dot; the pin stands in for it

    const latlng = marker.getLatLng()

    pin.setLatLng(latlng)
    pin.addTo(map)

    label.setContent(school.nombre_institucion)
    label.setLatLng(latlng)
    label.addTo(map)
  }

  function reassertLabel(): void {
    if (!selectedMarker) return
    if (map.hasLayer(label)) return
    label.addTo(map)
  }

  map.on('click', reassertLabel)
  
  return { select, clear}
}

export function createSchoolsPane(map: L.Map): void {
  const pane = map.createPane(SCHOOLS_PANE)
  pane.style.zIndex = String(SCHOOLS_PANE_Z_INDEX)
}

// The API returns [latitude, longitude], which is what Leaflet wants. If every
// marker lands in the ocean instead of Medellín, swap these two lines — that
// means the API uses GeoJSON's [longitude, latitude] convention.
function resolveSchoolLatLng(school: School): L.LatLngTuple {
  const [latitude, longitude] = school.coordinates
  return [latitude, longitude]
}

export type SchoolsLayerHandle = {
  layer: L.LayerGroup
  selectSchool(school: School): void
  clearSelection(): void
}

type SchoolSelectHandler = (school: School) => void

function bindSchoolInteraction(
  school: School,
  marker: L.CircleMarker,
  hover: HoverLabelController,
  onSelect: SchoolSelectHandler,
): void {
  const latlng = marker.getLatLng()

  marker.on('mouseover', () => {
    hover.activate(marker, school.nombre_institucion, latlng)
  })

  marker.on('mouseout', () => {
    hover.deactivate(marker)
  })

  // Clicking a marker selects it, same path as clicking a search result.
  marker.on('click', () => {
    onSelect(school)
  })
}

function createSchoolMarker(
  school: School,
  renderer: L.Renderer,
  hover: HoverLabelController,
  onSelect: SchoolSelectHandler,
): L.CircleMarker {
  const latlng = resolveSchoolLatLng(school)

  const marker = L.circleMarker(latlng, {
    ...SCHOOL_MARKER_STYLE,
    renderer,
    pane: SCHOOLS_PANE,
  })

  bindSchoolInteraction(school, marker, hover, onSelect)

  return marker
}

export function createSchoolsLayer(
  map: L.Map,
  schools: School[],
  onSelect: SchoolSelectHandler,
): SchoolsLayerHandle {
  const hover = createHoverLabelController(map, {
    idleStyle: SCHOOL_MARKER_IDLE_STYLE,
    hoverStyle: SCHOOL_MARKER_HOVER_STYLE,
    tooltipClassName: 'school-label',
  })

  bindHoverResets(map, hover)

  const selection = createSelectionController(map, hover)

  const renderer = L.svg({ pane: SCHOOLS_PANE })
  const markersBySchool = new Map<School, L.CircleMarker>()

  const markers = schools.map(school => {
    const marker = createSchoolMarker(school, renderer, hover, onSelect)
    markersBySchool.set(school, marker)
    return marker
  })

  function selectSchool(school: School): void {
    const marker = markersBySchool.get(school)
    if (!marker) return
    selection.select(school, marker)
  }

  function clearSelection(): void {
    selection.clear()
  }

  return {
    layer: L.layerGroup(markers),
    selectSchool,
    clearSelection,
  }
}