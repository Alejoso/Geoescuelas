const SCHOOLS_PATH = '/api/school'

export type School = {
  cod_dane: string
  nombre_institucion: string
  sede_principal: string | null
  coordinates: [number, number]

  correo_institucional: string | null
  telefono: string | null
  direccion: string | null

  calendario: string | null
  naturaleza: string | null
  sector: string | null
  zona: string | null
  jornada: string | null
  nivel: string | null

  indice_global_stem: number | null
  docentes_encuestados_stem: number | null

  indice_global_docentes: number | null
  docentes_encuestados_cd: number | null

  indice_global_icfes: number | null
  encuestados_icfes: number | null

  indice_global_estudiantes: number | null
  encuestados_estudiantes: number | null

  indice_global_ciberseguridad: number | null
  encuestados_ciberseguridad: number | null
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