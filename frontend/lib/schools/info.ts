import type { School } from '@/lib/api/schools'

const EMPTY_VALUE = '—'

export type InfoField = {
  label: string
  value: string
  // Values that must keep their original casing (emails, URLs). Everything
  // else gets title-cased by CSS.
  preserveCase?: boolean
}

export type InfoGroup = {
  title: string
  fields: InfoField[]
}

// Nulls and blank strings both mean "no data" here, so they collapse to the
// same placeholder rather than rendering an empty row.
function formatText(value: string | null): string {
  if (value === null) return EMPTY_VALUE

  const trimmed = value.trim()
  if (trimmed.length === 0) return EMPTY_VALUE

  return trimmed
}

function format_sede_principal(value: string | null) : string | null {
    if (typeof value !== "string" || value === "") return null;
    
    if (value === "s") return "si";
    if (value === "n") return "no";

    return null
}

function hasAnyValue(group: InfoGroup): boolean {
  return group.fields.some(field => field.value !== EMPTY_VALUE)
}

function listGroups(school: School): InfoGroup[] {
  return [
    {
      title: 'Institución',
      fields: [
        { label: '¿Es una sede principal?', value: formatText(format_sede_principal(school.sede_principal))},
        { label: 'Niveles', value: formatText(school.nivel) },
      ],
    },
    {
      title: 'Contacto',
      fields: [
        { label: 'Dirección', value: formatText(school.direccion)},
        { label: 'Teléfono', value: formatText(school.telefono) },
        { label: 'Correo', value: formatText(school.correo_institucional) , preserveCase: true },
      ],
    },
    {
      title: 'Clasificación',
      fields: [
        { label: 'Sector', value: formatText(school.sector) },
        { label: 'Naturaleza', value: formatText(school.naturaleza) },
        { label: 'Calendario', value: formatText(school.calendario) },
        { label: 'Zona', value: formatText(school.zona) },
        { label: 'Jornada', value: formatText(school.jornada) },
      ],
    },
  ]
}

export function buildInfoGroups(school: School): InfoGroup[] {
  const groups = listGroups(school)
  return groups.filter(hasAnyValue)
}