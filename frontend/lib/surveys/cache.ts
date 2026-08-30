import type { SurveyDefinition, SurveyResult } from './types'

// Module-level on purpose: these outlive every modal mount, which is the point.
const results = new Map<string, SurveyResult>()
const inFlight = new Map<string, Promise<SurveyResult>>()

function cacheKey(survey: SurveyDefinition, codDane: string): string {
  return `${survey.slug}:${codDane}`
}

/**
 * Synchronous read, so a modal opening on cached data can render it on its
 * first frame instead of flashing a loading state.
 */
export function readCachedSurvey(
  survey: SurveyDefinition,
  codDane: string,
): SurveyResult | null {
  return results.get(cacheKey(survey, codDane)) ?? null
}

/**
 * Loads a survey, reusing a cached result or an already-running request.
 */
export function loadSurvey(
  survey: SurveyDefinition,
  codDane: string,
): Promise<SurveyResult> {
  const key = cacheKey(survey, codDane)

  const cached = results.get(key)
  if (cached !== undefined) {
    return Promise.resolve(cached)
  }

  const pending = inFlight.get(key)
  if (pending !== undefined) {
    return pending
  }

  const request = survey.load(codDane).then(result => {
    results.set(key, result)
    return result
  })

  // Dropped either way, so a failed request can be retried when the user
  // actually opens that modal.
  request.finally(() => inFlight.delete(key))

  inFlight.set(key, request)
  return request
}

/**
 * Warms the cache for every survey the user could open on this school.
 * Idempotent, so calling it on each eye click is harmless.
 */
export function prefetchSurveys(surveys: SurveyDefinition[], codDane: string): void {
  for (const survey of surveys) {
    // Errors are swallowed here: nothing is on screen to show them on, and the
    // modal will re-request and surface the failure if it is ever opened.
    loadSurvey(survey, codDane).catch(() => {})
  }
}