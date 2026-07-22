import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'

const BARRIOS_URL = '/barrios_wgs84.geojson'


export type BarrioProperties = {
  nombre?: string,
  limitecomunacorregimientoid?: string,
}

export type BarriosCollection = FeatureCollection<Polygon | MultiPolygon , BarrioProperties>

export async function fetchBarrios(signal?: AbortSignal): Promise<BarriosCollection> {
  const response = await fetch(BARRIOS_URL, { signal })

  if (!response.ok) {
    throw new Error(`Failed to fetch barrios: ${response.status}`)
  }

  return response.json()
}