const SURVEY_PATH_PREFIX = '/api/school'

export const SURVEY_SLUGS = {
  students: 'students',
  teachersDigital: 'teachers-digital',
  teachersStem: 'teachers-stem',
} as const

export type StudentsSurveyWire = {
  cod_dane: string
  numero_estudiantes_encuestados: number
  indicador_habilidades_digitales: number | null
  indicador_inteligencia_artificial: number | null
  indicador_pensamiento_computacional: number | null
}

export type TeachersDigitalSurveyWire = {
  cod_dane: string
  numero_docentes_encuestados: number
  acceso_uso_indicador: number | null
  usos_tecnologias_indicador: number | null
  potencialidades_indicador: number | null
  dificultades_indicador: number | null
}

export type TeachersStemSurveyWire = {
  cod_dane: string
  numero_docentes_encuestados: number
  modelos_inmersion: number | null
  competencias_siglo_xxi: number | null
  recursos_stem: number | null
  competencias_digitales_docentes: number | null
  alfabetizacion_ia: number | null
}

/**
 * All three instruments share one endpoint shape, so the caller names the wire
 * type it expects. The response is not validated at runtime.
 */
export async function fetchSurveyIndicator<Wire>(
  surveySlug: string,
  codDane: string,
  signal?: AbortSignal,
): Promise<Wire> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined')
  }

  const path = `${SURVEY_PATH_PREFIX}/${encodeURIComponent(codDane)}/surveys/${surveySlug}`
  const response = await fetch(`${baseUrl}${path}`, { signal })

  if (!response.ok) {
    throw new Error(`Failed to fetch survey ${surveySlug}: ${response.status}`)
  }

  return response.json()
}