'use client'

import { useMemo, useState } from 'react'
import type { School } from '@/lib/api/schools'
import { searchSchools } from '@/lib/schools/search'

function SearchIcon() {
  return (
    <svg
      className="map-search__icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

type SearchBarProps = {
  schools: School[]
  onSelect: (school: School) => void
}

export default function SearchBar({ schools, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(
    () => searchSchools(schools, query),
    [schools, query],
  )

  const hasResults = results.length > 0

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  function handleSelect(school: School) {
    onSelect(school)
    // Google clears the box and closes the list once you've picked one.
    setQuery('')
  }

  return (
    <div className="map-search">
      <div className="map-search__field">
        <SearchIcon />
        <input
          className="map-search__input"
          type="text"
          placeholder="Buscar institución…"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Buscar institución"
        />
      </div>

      {hasResults && (
        <ul className="map-search__results">
            {results.map(school => (
                <li key={school.cod_dane} className="map-search__result">
                <button
                    type="button"
                    className="map-search__result-button"
                    onClick={() => handleSelect(school)}
                >
                    <span className="map-search__result-name">{school.nombre_institucion}</span>
                    <span className="map-search__result-dane">DANE · {school.cod_dane}</span>
                </button>
                </li>
            ))}
        </ul>
      )}
    </div>
  )
}