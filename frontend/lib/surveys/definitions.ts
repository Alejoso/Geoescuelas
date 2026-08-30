import {
  SURVEY_SLUGS,
  fetchSurveyIndicator,
  type StudentsSurveyWire,
  type TeachersDigitalSurveyWire,
  type TeachersStemSurveyWire,
} from '@/lib/api/surveys'
import type { Indicator } from '@/lib/schools/indicators'
import type { SurveyDefinition, SurveyResult } from './types'

const STUDENTS_NOUN = { singular: 'estudiante', plural: 'estudiantes' }
const TEACHERS_NOUN = { singular: 'profesor', plural: 'profesores' }

async function loadStudentsSurvey(
  codDane: string,
  signal?: AbortSignal,
): Promise<SurveyResult> {
  const wire = await fetchSurveyIndicator<StudentsSurveyWire>(
    SURVEY_SLUGS.students,
    codDane,
    signal,
  )

  // The respondent count covers the whole survey, so it is reported once by the
  // modal rather than repeated on every card.
  const indicators: Indicator[] = [
    {
      id: 'indicador_habilidades_digitales',
      label: 'Habilidades digitales',
      value: wire.indicador_habilidades_digitales,
      respondents: null,
    },
    {
      id: 'indicador_inteligencia_artificial',
      label: 'Inteligencia artificial',
      value: wire.indicador_inteligencia_artificial,
      respondents: null,
    },
    {
      id: 'indicador_pensamiento_computacional',
      label: 'Pensamiento computacional',
      value: wire.indicador_pensamiento_computacional,
      respondents: null,
    },
  ]

  return {
    respondentCount: wire.numero_estudiantes_encuestados,
    indicators,
  }
}

async function loadTeachersDigitalSurvey(
  codDane: string,
  signal?: AbortSignal,
): Promise<SurveyResult> {
  const wire = await fetchSurveyIndicator<TeachersDigitalSurveyWire>(
    SURVEY_SLUGS.teachersDigital,
    codDane,
    signal,
  )

  const indicators: Indicator[] = [
    {
      id: 'acceso_uso_indicador',
      label: 'Acceso y uso',
      value: wire.acceso_uso_indicador,
      respondents: null,
    },
    {
      id: 'usos_tecnologias_indicador',
      label: 'Usos de las tecnologías',
      value: wire.usos_tecnologias_indicador,
      respondents: null,
    },
    {
      id: 'potencialidades_indicador',
      label: 'Potencialidades',
      value: wire.potencialidades_indicador,
      respondents: null,
    },
    {
      // The column is pre-inverted: a higher score means fewer difficulties, so
      // the shared tier colours read correctly without special casing.
      id: 'dificultades_indicador',
      label: 'Dificultades',
      value: wire.dificultades_indicador,
      respondents: null,
    },
  ]

  return {
    respondentCount: wire.numero_docentes_encuestados,
    indicators,
  }
}

async function loadTeachersStemSurvey(
  codDane: string,
  signal?: AbortSignal,
): Promise<SurveyResult> {
  const wire = await fetchSurveyIndicator<TeachersStemSurveyWire>(
    SURVEY_SLUGS.teachersStem,
    codDane,
    signal,
  )

  const indicators: Indicator[] = [
    {
      id: 'modelos_inmersion',
      label: 'Modelos de inmersión',
      value: wire.modelos_inmersion,
      respondents: null,
    },
    {
      id: 'competencias_siglo_xxi',
      label: 'Competencias del siglo XXI',
      value: wire.competencias_siglo_xxi,
      respondents: null,
    },
    {
      id: 'recursos_stem',
      label: 'Recursos STEM',
      value: wire.recursos_stem,
      respondents: null,
    },
    {
      id: 'competencias_digitales_docentes',
      label: 'Competencias digitales docentes',
      value: wire.competencias_digitales_docentes,
      respondents: null,
    },
    {
      id: 'alfabetizacion_ia',
      label: 'Alfabetización en IA',
      value: wire.alfabetizacion_ia,
      respondents: null,
    },
  ]

  return {
    respondentCount: wire.numero_docentes_encuestados,
    indicators,
  }
}

// Exported as module-level constants on purpose: SurveyModal keeps `survey` in
// an effect dependency array, so a definition built inline in JSX would refetch
// on every render.
export const STUDENTS_SURVEY: SurveyDefinition = {
  slug: SURVEY_SLUGS.students,
  title: 'Encuesta de estudiantes',
  respondentNoun: STUDENTS_NOUN,
  load: loadStudentsSurvey,
}

export const TEACHERS_DIGITAL_SURVEY: SurveyDefinition = {
  slug: SURVEY_SLUGS.teachersDigital,
  title: 'Competencias digitales docentes',
  respondentNoun: TEACHERS_NOUN,
  load: loadTeachersDigitalSurvey,
}

export const TEACHERS_STEM_SURVEY: SurveyDefinition = {
  slug: SURVEY_SLUGS.teachersStem,
  title: 'Evaluación STEM docentes',
  respondentNoun: TEACHERS_NOUN,
  load: loadTeachersStemSurvey,
}

// Keyed by the indicator ids from lib/schools/indicators.ts. Indicators with no
// entry render without a detail button, which is how Ciberseguridad and ICFES
// stay inert until their endpoints exist.
export const SURVEYS_BY_INDICATOR: Record<string, SurveyDefinition> = {
  estudiantes: STUDENTS_SURVEY,
  docentes: TEACHERS_DIGITAL_SURVEY,
  stem: TEACHERS_STEM_SURVEY,
}