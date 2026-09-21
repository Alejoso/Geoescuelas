const SCHOOLS_PATH = '/api/school'

export type Saber11Detail = {
  cod_dane: string
  promedio: number | null
  publicados: number | null
  promedio_nacional: number | null
  publicados_nacional: number | null
  clasificacion: string | null
}

export async function fetchSaber11Detail(codDane: string): Promise<Saber11Detail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined')
  }

  const response = await fetch(`${baseUrl}${SCHOOLS_PATH}/${codDane}/saber11`)

  if (!response.ok) {
    throw new Error(`Failed to fetch saber 11 detail: ${response.status}`)
  }

  return response.json()
}