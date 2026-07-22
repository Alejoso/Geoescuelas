import type { School } from '@/lib/api/schools'
import L from 'leaflet'

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

function createSchoolMarker(school: School, renderer: L.Renderer): L.CircleMarker {
  const latlng = resolveSchoolLatLng(school)

  return L.circleMarker(latlng, {
    ...SCHOOL_MARKER_STYLE,
    renderer,
    pane: SCHOOLS_PANE,
  })
}

export function createSchoolsLayer(schools: School[]): L.LayerGroup {
  const renderer = L.svg({ pane: SCHOOLS_PANE })
  const markers = schools.map(school => createSchoolMarker(school, renderer))

  return L.layerGroup(markers)
}