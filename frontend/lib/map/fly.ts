import L from 'leaflet'

const FOCUS_ZOOM = 17
const FLY_DURATION_SECONDS = 0.8

export function flyToSchool(map: L.Map, latlng: L.LatLngExpression): void {
  const targetZoom = Math.max(map.getZoom(), FOCUS_ZOOM)
  map.flyTo(latlng, targetZoom, { duration: FLY_DURATION_SECONDS })
}