import { fetchSaber11Detail, type Saber11Detail } from '@/lib/api/saber11'

// Module-level on purpose: these outlive every modal mount, which is the point.
const results = new Map<string, Saber11Detail>()
const inFlight = new Map<string, Promise<Saber11Detail>>()

export function readCachedSaber11(codDane: string): Saber11Detail | null {
  return results.get(codDane) ?? null
}

export function loadSaber11(codDane: string): Promise<Saber11Detail> {
  const cached = results.get(codDane)
  if (cached !== undefined) {
    return Promise.resolve(cached)
  }

  const pending = inFlight.get(codDane)
  if (pending !== undefined) {
    return pending
  }

  const request = fetchSaber11Detail(codDane).then(result => {
    results.set(codDane, result)
    return result
  })

  request.finally(() => inFlight.delete(codDane))

  inFlight.set(codDane, request)
  return request
}