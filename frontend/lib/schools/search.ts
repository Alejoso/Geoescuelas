import type { School } from '@/lib/api/schools'

const MAX_RESULTS = 5

// Strip accents and lowercase so "María" matches "maria". NFD splits an
// accented char into base + combining mark; the range removes the marks.
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

type RankedSchool = {
  school: School
  startsWithQuery: boolean
}

function tokenize(text: string): string[] {
  const normalized = normalize(text)
  if (!normalized) return []
  return normalized.split(/\s+/)
}

// Every query token must appear somewhere in the name — not necessarily
// contiguously. "educativa marymount" matches "Institución Educativa Colegio
// Marymount" even with "Colegio" sitting between the two words.
function matchesAllTokens(name: string, tokens: string[]): boolean {
  return tokens.every(token => name.includes(token))
}

export function searchSchools(schools: School[], rawQuery: string): School[] {
  const tokens = tokenize(rawQuery)
  if (tokens.length === 0) return []

  // The whole query as one string, used only for prefix ranking below.
  const contiguousQuery = tokens.join(' ')

  const matches: RankedSchool[] = []

  for (const school of schools) {
    const name = normalize(school.nombre)

    if (!matchesAllTokens(name, tokens)) continue

    const startsWithQuery = name.startsWith(contiguousQuery)
    matches.push({ school, startsWithQuery })
  }

  // Names that begin with the typed query rank first, then alphabetical.
  matches.sort((a, b) => {
    if (a.startsWithQuery !== b.startsWithQuery) {
      return a.startsWithQuery ? -1 : 1
    }
    return a.school.nombre.localeCompare(b.school.nombre)
  })

  return matches.slice(0, MAX_RESULTS).map(ranked => ranked.school)
}