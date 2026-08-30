import type { Indicator } from '@/lib/schools/indicators'

export type RespondentNoun = {
  singular: string
  plural: string
}

export type SurveyResult = {
  respondentCount: number
  indicators: Indicator[]
}

export type SurveyDefinition = {
  slug: string
  title: string
  respondentNoun: RespondentNoun
  load: (codDane: string) => Promise<SurveyResult>
}

export type SurveyIndicator = {
  key: string
  label: string
  value: number | null
}