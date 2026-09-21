const SCHOOLS_PATH = '/api/school'

export type CiberseguridadCategoryCount = {
  categoria: string
  cantidad: number
}

export type CiberseguridadDetail = {
  cod_dane: string
  total_encuestados: number
  encuestados_primaria: number
  encuestados_bachillerato: number
  histograma_sucesos: CiberseguridadCategoryCount[]
}

export async function fetchCiberseguridadDetail(
  codDane: string,
): Promise<CiberseguridadDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined')
  }

  const response = await fetch(`${baseUrl}${SCHOOLS_PATH}/${codDane}/ciberseguridad`)

  if (!response.ok) {
    throw new Error(`Failed to fetch ciberseguridad detail: ${response.status}`)
  }

  return response.json()
}