import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'
import type { LatLngTuple } from 'leaflet'
import type { BarriosCollection } from '@/lib/api/barrios'

// Web Mercator cannot project the poles, so we stop short of them.
const MAX_MERCATOR_LATITUDE = 85
// Wide enough to stay opaque when the user pans past the antimeridian.
const WORLD_LONGITUDE_SPAN = 720

const WORLD_RING: LatLngTuple[] = [
  [-MAX_MERCATOR_LATITUDE, -WORLD_LONGITUDE_SPAN],
  [-MAX_MERCATOR_LATITUDE, WORLD_LONGITUDE_SPAN],
  [MAX_MERCATOR_LATITUDE, WORLD_LONGITUDE_SPAN],
  [MAX_MERCATOR_LATITUDE, -WORLD_LONGITUDE_SPAN],
]

// GeoJSON stores [longitude, latitude]. Leaflet expects [latitude, longitude].
function positionToLatLng(position: Position): LatLngTuple {
  const [longitude, latitude] = position
  return [latitude, longitude]
}

function ringToLatLngs(ring: Position[]): LatLngTuple[] {
  return ring.map(positionToLatLng)
}

// In GeoJSON the first ring of a polygon is its outer boundary; the rest are
// its own holes, which we ignore here.
function outerRingsOf(feature: Feature<Polygon | MultiPolygon>): Position[][] {
  const geometry = feature.geometry

  if (geometry.type === 'Polygon') {
    const [outerRing] = geometry.coordinates
    return [outerRing]
  }

  return geometry.coordinates.map(polygonRings => polygonRings[0])
}

/**
 * Returns the rings of a single polygon: the whole world, with every barrio
 * punched out as a hole.
 */
export function buildMaskRings(barrios: BarriosCollection): LatLngTuple[][] {
  const holes: LatLngTuple[][] = []

  for (const feature of barrios.features) {
    if (!feature.geometry) continue

    const outerRings = outerRingsOf(feature)

    for (const ring of outerRings) {
      holes.push(ringToLatLngs(ring))
    }
  }

  return [WORLD_RING, ...holes]
}