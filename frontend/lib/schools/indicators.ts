import type { School } from '@/lib/api/schools'

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
  label: string
  value: number | null
}

export type IndicatorView = {
  label: string
  scoreText: string
  tierLabel: string | null
  color: string | null
}

type Tier = {
  label: string
  color: string
}

function isValidScore(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

// Label and color come from the same threshold, so they're resolved together
// rather than in two separate checks that could drift apart.
function getTier(value: number): Tier {
  if (value >= SCORE_HIGH_THRESHOLD) return { label: 'Alto', color: SCORE_HIGH_COLOR }
  if (value >= SCORE_MEDIUM_THRESHOLD) return { label: 'Medio', color: SCORE_MEDIUM_COLOR }
  return { label: 'Bajo', color: SCORE_LOW_COLOR }
}

function listIndicators(school: School): Indicator[] {
  return [
    { label: 'Estudiantes', value: school.indice_global_estudiantes },
    { label: 'STEM', value: school.indice_global_stem },
    { label: 'Docentes', value: school.indice_global_docentes },
    { label: 'Ciberseguridad', value: school.indice_global_ciberseguridad },
    { label: 'ICFES', value: school.indice_global_icfes },
  ]
}

function toIndicatorView({ label, value }: Indicator): IndicatorView {
  if (!isValidScore(value)) {
    return { label, scoreText: '—', tierLabel: null, color: null }
  }

  const tier = getTier(value)
  const scoreText = value.toFixed(SCORE_DECIMALS)

  return { label, scoreText, tierLabel: tier.label, color: tier.color }
}

export function buildIndicatorViews(school: School): IndicatorView[] {
  const indicators = listIndicators(school)
  return indicators.map(toIndicatorView)
}