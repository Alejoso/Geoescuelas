// Fixed severity ranking for ciberseguridad incident categories, 1 (most
// dangerous) to 11 (least). This ordering comes from the domain team, not
// from the data, so it's a lookup table rather than anything derived.
const CATEGORY_RANK: Record<string, number> = {
  'riesgo sexual digital': 1,
  'acoso, hostigamiento o agresión interpersonal': 2,
  'contacto con desconocidos o interacción de riesgo': 3,
  'riesgo técnico, privacidad, fraude o seguridad digital': 4,
  'acceso a contenido inapropiado o perturbador': 5,
  'riesgo emocional o malestar subjetivo': 6,
  'uso problemático o dependencia': 7,
  'experiencia extraña o curiosa sin riesgo claro': 8,
  'experiencia mixta o ambigua': 9,
  'experiencia positiva, divertida o sorprendente': 10,
  'sin experiencia relevante': 11,
}

export type RiskBand = {
  label: string
  color: string
}

// Same hex values as the score-tier colors elsewhere in the app, so a risk
// chip reads consistently with the Alto/Medio/Bajo indicator tiers.
const RISK_HIGH: RiskBand = { label: 'Alto riesgo', color: '#E24B4A' }
const RISK_MEDIUM: RiskBand = { label: 'Riesgo medio', color: '#EF9F27' }
const RISK_LOW: RiskBand = { label: 'Bajo riesgo', color: '#1D9E75' }

// Matched case-insensitively: display casing is normalized separately
// (see toSentenceCase in CiberseguridadModal) and shouldn't affect this.
export function rankForCategory(categoria: string): number | null {
  return CATEGORY_RANK[categoria.trim().toLowerCase()] ?? null
}

export function riskBandForCategory(categoria: string): RiskBand | null {
  const rank = rankForCategory(categoria)
  if (rank === null) return null

  if (rank <= 4) return RISK_HIGH
  if (rank <= 8) return RISK_MEDIUM
  return RISK_LOW
}