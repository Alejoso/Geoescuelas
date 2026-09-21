import { fetchCiberseguridadDetail, type CiberseguridadDetail } from '@/lib/api/ciberseguridad'

// Module-level on purpose: these outlive every modal mount, which is the point.
const results = new Map<string, CiberseguridadDetail>()
const inFlight = new Map<string, Promise<CiberseguridadDetail>>()

/**
 * Synchronous read, so a modal opening on cached data can render it on its
 * first frame instead of flashing a loading state.
 */
export function readCachedCiberseguridad(codDane: string): CiberseguridadDetail | null {
  return results.get(codDane) ?? null
}

/**
 * Loads ciberseguridad detail for one school, reusing a cached result or an
 * already-running request.
 */
export function loadCiberseguridad(codDane: string): Promise<CiberseguridadDetail> {
  const cached = results.get(codDane)
  if (cached !== undefined) {
    return Promise.resolve(cached)
  }

  const pending = inFlight.get(codDane)
  if (pending !== undefined) {
    return pending
  }

  const request = fetchCiberseguridadDetail(codDane).then(result => {
    results.set(codDane, result)
    return result
  })

  // Dropped either way, so a failed request can be retried the next time the
  // modal is opened.
  request.finally(() => inFlight.delete(codDane))

  inFlight.set(codDane, request)
  return request
}