import type { School } from '@/lib/api/schools'

const SCORE_MIN = 1
const SCORE_MAX = 5
const SCORE_DECIMALS = 2

// Thirds of the 1–5 range the index is scored on.
const SCORE_HIGH_THRESHOLD = 3.66
const SCORE_MEDIUM_THRESHOLD = 2.33

const SCORE_HIGH_COLOR = '#1D9E75'
const SCORE_MEDIUM_COLOR = '#EF9F27'
const SCORE_LOW_COLOR = '#E24B4A'

export const SCORE_MAX_LABEL = String(SCORE_MAX)

export type Indicator = {
  id: string
  label: string
  value: number | null
  respondents: number | null
}

export type IndicatorView = {
  id: string
  label: string
  scoreText: string
  respondentsText: string | null
  tierLabel: string | null
  color: string | null
  isMeasured: boolean
}

type Tier = {
  label: string
  color: string
}

export function isValidScore(value: number | null): value is number {
  if (typeof value !== 'number') return false
  if (!Number.isFinite(value)) return false

  return value >= SCORE_MIN && value <= SCORE_MAX
}

// Label and color come from the same threshold, so they're resolved together
// rather than in two separate checks that could drift apart.
export function getTier(value: number): Tier {
  if (value >= SCORE_HIGH_THRESHOLD) return { label: 'Alto', color: SCORE_HIGH_COLOR }
  if (value >= SCORE_MEDIUM_THRESHOLD) return { label: 'Medio', color: SCORE_MEDIUM_COLOR }
  return { label: 'Bajo', color: SCORE_LOW_COLOR }
}

// Returns null when the count is missing, so the caption can be omitted
// entirely instead of rendering a placeholder.
function formatRespondents(respondents: number | null): string | null {
  if (respondents === null) return null

  const noun = respondents === 1 ? 'encuestado' : 'encuestados'
  return `${respondents} ${noun}`
}

function listIndicators(school: School): Indicator[] {
  return [
    {
      id: 'estudiantes',
      label: 'Estudiantes',
      value: school.indice_global_estudiantes,
      respondents: school.encuestados_estudiantes,
    },
    {
      id: 'stem',
      label: 'STEM',
      value: school.indice_global_stem,
      respondents: school.docentes_encuestados_stem,
    },
    {
      id: 'docentes',
      label: 'Docentes',
      value: school.indice_global_docentes,
      respondents: school.docentes_encuestados_cd,
    },
    {
      id: 'ciberseguridad',
      label: 'Ciberseguridad',
      value: school.indice_global_ciberseguridad,
      respondents: school.encuestados_ciberseguridad,
    },
    {
      id: 'icfes',
      label: 'ICFES',
      value: school.indice_global_icfes,
      respondents: school.encuestados_icfes,
    },
  ]
}

export function toIndicatorView({ id, label, value, respondents }: Indicator): IndicatorView {
  const respondentsText = formatRespondents(respondents)

  if (!isValidScore(value)) {
    return {
      id,
      label,
      scoreText: '—',
      respondentsText,
      tierLabel: null,
      color: null,
      isMeasured: false,
    }
  }

  const tier = getTier(value)
  const scoreText = value.toFixed(SCORE_DECIMALS)
  // A score with no respondents behind it has nothing to break down, so the
  // detail button is withheld. A null count means "unknown", not "none".
  const isMeasured = respondents !== 0

  return {
    id,
    label,
    scoreText,
    respondentsText,
    tierLabel: tier.label,
    color: tier.color,
    isMeasured,
  }
}

export function buildIndicatorViews(school: School): IndicatorView[] {
  const indicators = listIndicators(school)
  return indicators.map(toIndicatorView)
}