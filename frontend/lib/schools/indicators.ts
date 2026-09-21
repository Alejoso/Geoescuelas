import type { School } from '@/lib/api/schools'

const SCORE_DECIMALS = 2
const PERCENTAGE_DECIMALS = 1

const SCORE_HIGH_COLOR = '#1D9E75'
const SCORE_MEDIUM_COLOR = '#EF9F27'
const SCORE_LOW_COLOR = '#E24B4A'

export type DisplayMode = 'raw' | 'percentage'

export type ScoreRange = {
  min: number
  max: number
  decimals: number
  highThreshold: number
  mediumThreshold: number
  // Saber 11 stays on its official 100–500 scale and has no percentage form.
  showsPercentage: boolean
}

const DEFAULT_RANGE: ScoreRange = {
  min: 1,
  max: 5,
  decimals: SCORE_DECIMALS,
  highThreshold: 3.66,
  mediumThreshold: 2.33,
  showsPercentage: true,
}

const SABER_11_RANGE: ScoreRange = {
  min: 100,
  max: 500,
  decimals: 0,
  highThreshold: 321,
  mediumThreshold: 221,
  showsPercentage: false,
}

export type Indicator = {
  id: string
  label: string
  value: number | null
  respondents: number | null
  range?: ScoreRange
}

export type IndicatorView = {
  id: string
  label: string
  scoreText: string
  percentageText: string | null
  respondentsText: string | null
  tierLabel: string | null
  color: string | null
  isMeasured: boolean
  maxLabel: string
}

type Tier = {
  label: string
  color: string
}

export function isValidScore(value: number | null, range: ScoreRange): value is number {
  if (typeof value !== 'number') return false
  if (!Number.isFinite(value)) return false

  return value >= range.min && value <= range.max
}

export function getTier(value: number, range: ScoreRange): Tier {
  if (value >= range.highThreshold) return { label: 'Alto', color: SCORE_HIGH_COLOR }
  if (value >= range.mediumThreshold) return { label: 'Medio', color: SCORE_MEDIUM_COLOR }
  return { label: 'Bajo', color: SCORE_LOW_COLOR }
}

// Normalizes the indicator's own range to 0–100%: the floor reads as 0%,
// the ceiling as 100%. Returns null for ranges that don't support it (Saber 11).
function toPercentageText(value: number, range: ScoreRange): string | null {
  if (!range.showsPercentage) return null

  const span = range.max - range.min
  const percentage = ((value - range.min) / span) * 100

  return `${percentage.toFixed(PERCENTAGE_DECIMALS)}%`
}

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
      range: DEFAULT_RANGE,
    },
    {
      id: 'stem',
      label: 'STEM',
      value: school.indice_global_stem,
      respondents: school.docentes_encuestados_stem,
      range: DEFAULT_RANGE,
    },
    {
      id: 'docentes',
      label: 'Docentes',
      value: school.indice_global_docentes,
      respondents: school.docentes_encuestados_cd,
      range: DEFAULT_RANGE,
    },
    {
      id: 'ciberseguridad',
      label: 'Ciberseguridad',
      value: school.indice_global_ciberseguridad,
      respondents: school.encuestados_ciberseguridad,
      range: DEFAULT_RANGE,
    },
    {
      id: 'saber_11',
      label: 'Saber 11',
      value: school.indice_global_saber_11,
      respondents: school.encuestados_saber_11,
      range: SABER_11_RANGE,
    },
  ]
}

export function toIndicatorView({ id, label, value, respondents, range = DEFAULT_RANGE }: Indicator): IndicatorView {
  const respondentsText = formatRespondents(respondents)
  const maxLabel = String(range.max)

  if (!isValidScore(value, range)) {
    return {
      id,
      label,
      scoreText: '—',
      percentageText: null,
      respondentsText,
      tierLabel: null,
      color: null,
      isMeasured: false,
      maxLabel,
    }
  }

  const tier = getTier(value, range)
  const scoreText = value.toFixed(range.decimals)
  const percentageText = toPercentageText(value, range)
  // A score with no respondents behind it has nothing to break down, so the
  // detail button is withheld. A null count means "unknown", not "none".
  const isMeasured = respondents !== 0

  return {
    id,
    label,
    scoreText,
    percentageText,
    respondentsText,
    tierLabel: tier.label,
    color: tier.color,
    isMeasured,
    maxLabel,
  }
}

export function buildIndicatorViews(school: School): IndicatorView[] {
  const indicators = listIndicators(school)
  return indicators.map(toIndicatorView)
}