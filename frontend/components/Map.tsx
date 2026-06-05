'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function getBarColor(value: number): string {
  if (value >= 3.66) return '#1D9E75'
  else if (value >= 2.33)   return '#EF9F27'
  return '#E24B4A'
}

function buildPopup(school: any): string {
  const indicadores = [
    { label: 'Estudiantes',    value: school.indice_global_estudiantes },
    { label: 'STEM',           value: school.indice_global_stem },
    { label: 'Docentes',       value: school.indice_global_docentes },
    { label: 'Ciberseguridad', value: school.indice_global_ciberseguridad },
    { label: 'ICFES',          value: school.indice_global_icfes },
  ]

  const barras = indicadores.map(({ label, value }) => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:12px;color:#888;">${label}</span>
        <span style="font-size:12px;font-weight:500;color:#e8f0fe;">${value.toFixed(2)} / 5</span>
      </div>
      <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;">
        <div style="height:100%;width:${(value / 5) * 100}%;background:${getBarColor(value)};border-radius:2px;"></div>
      </div>
    </div>
  `).join('')

  return `
    <div style="font-family:sans-serif;width:280px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
      <div style="background:#1a2744;padding:12px 14px;">
        <p style="font-size:11px;color:#7b9cc4;margin:0 0 4px;letter-spacing:0.08em;">DANE · ${school.dane}</p>
        <p style="font-size:14px;font-weight:500;color:#e8f0fe;margin:0;line-height:1.4;">${school.nombre}</p>
      </div>
      <div style="background:#111827;padding:12px 14px;">
        <p style="font-size:11px;color:#6b7280;margin:0 0 10px;letter-spacing:0.06em;text-transform:uppercase;">Indicadores</p>
        ${barras}
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;">
          <span style="font-size:11px;color:#6b7280;">Docentes encuestados</span>
          <span style="font-size:13px;font-weight:500;color:#e8f0fe;">${school.numero_docentes_encuestados}</span>
        </div>
      </div>
    </div>
  `
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([6.2442, -75.5812], 12)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    let cancelled = false

    // Escuelas e instituciones
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/school`)
      .then(res => res.json())
      .then(schools => {
        console.log('Total escuelas:', schools.length)
        console.log('Primera escuela:', schools[0])
        console.log('Coordinates:', schools[0].coordinates)

        if (cancelled || !mapInstanceRef.current) return
        
        schools.forEach( (school : any) => {
          L.circleMarker(school.coordinates, {
            color: '#f63b3b',
            radius: 6,
            fillOpacity: 0.8,
            weight: 20
          })
          .addTo(map)
          .bindPopup(buildPopup(school), {
            maxWidth: 300,
            className: 'school-popup'  // para quitar el padding default de Leaflet
          })
          .bindTooltip(school.nombre, {
            permanent: true,
            direction: 'top',
            offset: [0, -8],
            className: 'school-label'
          })
          })

      })
      .catch(err => console.error('Error escuelas:', err))

    // Barrios
    fetch('/barrios_wgs84.geojson')
      .then(res => res.json())
      .then(data => {
        if (cancelled || !mapInstanceRef.current) return
        L.geoJSON(data, {
          style: {
            color: '#3B82F6',
            weight: 1.5,
            fillOpacity: 0.08,
            fillColor: '#3B82F6'
          }
        }).addTo(map)
      })
      .catch(err => console.error('Error barrios:', err))

    return () => {
      cancelled = true
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />
}