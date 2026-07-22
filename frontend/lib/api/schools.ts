const SCHOOLS_PATH = '/api/school'

export type School = {
  dane: string
  nombre: string
  coordinates: [number, number]
  numero_docentes_encuestados: number
  indice_global_estudiantes: number | null
  indice_global_stem: number | null
  indice_global_docentes: number | null
  indice_global_ciberseguridad: number | null
  indice_global_icfes: number | null
}

export async function fetchSchools(signal?: AbortSignal): Promise<School[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined')
  }

  const response = await fetch(`${baseUrl}${SCHOOLS_PATH}`, { signal })

  if (!response.ok) {
    throw new Error(`Failed to fetch schools: ${response.status}`)
  }

  return response.json()
}