'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useFocusTrap } from '@/lib/ui/useFocusTrap'
import type { CiberseguridadDetail } from '@/lib/api/ciberseguridad'
import { loadCiberseguridad, readCachedCiberseguridad } from '@/lib/schools/ciberseguridadCache'
import { rankForCategory, riskBandForCategory } from '@/lib/schools/ciberseguridadRisk'

type CiberseguridadModalProps = {
  codDane: string
  onClose: () => void
}

function formatEncuestados(count: number): string {
  const noun = count === 1 ? 'encuestado' : 'encuestados'
  return `${count} ${noun}`
}

// The DB casing isn't guaranteed consistent, so this is normalized rather
// than trusted as-is.
function toSentenceCase(text: string): string {
  const lower = text.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function percentOf(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100)
}

type CiberseguridadBarProps = {
  label: string
  count: number
  total: number
  risk: ReturnType<typeof riskBandForCategory>
}

function CiberseguridadBar({ label, count, total, risk }: CiberseguridadBarProps) {
  const widthPercent = total === 0 ? 0 : (count / total) * 100
  const percentOfTotal = percentOf(count, total)

  return (
    <div className="ciberseguridad-bar">
      <div className="ciberseguridad-bar__top">
        <span className="ciberseguridad-bar__label">{label}</span>
        {risk && (
          <span className="ciberseguridad-bar__risk" style={{ color: risk.color }}>
            {risk.label}
          </span>
        )}
      </div>
      <div className="ciberseguridad-bar__row">
        <div className="ciberseguridad-bar__track">
          <div className="ciberseguridad-bar__fill" style={{ width: `${widthPercent}%` }} />
        </div>
        <span className="ciberseguridad-bar__count">
          {count} <span className="ciberseguridad-bar__percent">({percentOfTotal}%)</span>
        </span>
      </div>
    </div>
  )
}

type CiberseguridadModalBodyProps = {
  isLoading: boolean
  error: string | null
  detail: CiberseguridadDetail | null
}

function CiberseguridadModalBody({ isLoading, error, detail }: CiberseguridadModalBodyProps) {
  if (isLoading) return <p className="survey-modal__status">Cargando…</p>
  if (error !== null) return <p className="survey-modal__status">{error}</p>
  if (detail === null) return null

  if (detail.total_encuestados === 0) {
    return (
      <p className="survey-modal__status">
        Esta institución no participó en esta encuesta
      </p>
    )
  }

  // Sorted by danger rank (most to least), not by response count, so the
  // risk chips read as a visual progression top-to-bottom. Categories with no
  // rank entry (shouldn't happen, but the lookup is a fixed table) sort last.
  const sortedSucesos = [...detail.histograma_sucesos].sort((a, b) => {
    const rankA = rankForCategory(a.categoria) ?? Number.POSITIVE_INFINITY
    const rankB = rankForCategory(b.categoria) ?? Number.POSITIVE_INFINITY
    return rankA - rankB
  })

  return (
    <>
      <p className="survey-modal__respondents">
        Basado en {formatEncuestados(detail.total_encuestados)}
      </p>

      <div className="ciberseguridad-fuentes">
        <div className="ciberseguridad-fuente">
          <span className="ciberseguridad-fuente__label">Primaria</span>
          <span className="ciberseguridad-fuente__value">
            {detail.encuestados_primaria}{' '}
            <span className="ciberseguridad-fuente__percent">
              ({percentOf(detail.encuestados_primaria, detail.total_encuestados)}%)
            </span>
          </span>
        </div>
        <div className="ciberseguridad-fuente">
          <span className="ciberseguridad-fuente__label">Bachillerato</span>
          <span className="ciberseguridad-fuente__value">
            {detail.encuestados_bachillerato}{' '}
            <span className="ciberseguridad-fuente__percent">
              ({percentOf(detail.encuestados_bachillerato, detail.total_encuestados)}%)
            </span>
          </span>
        </div>
      </div>

      <p className="ciberseguridad-section-title">Sucesos reportados</p>

      {sortedSucesos.length === 0 ? (
        <p className="survey-modal__status">No se registraron sucesos categorizados</p>
      ) : (
        <div className="ciberseguridad-histogram">
          {sortedSucesos.map(item => (
            <CiberseguridadBar
              key={item.categoria}
              label={toSentenceCase(item.categoria)}
              count={item.cantidad}
              total={detail.total_encuestados}
              risk={riskBandForCategory(item.categoria)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default function CiberseguridadModal({ codDane, onClose }: CiberseguridadModalProps) {
  // Read synchronously so a cached result renders on the first frame instead
  // of flashing a loading state, matching SurveyModal's own pattern.
  const cachedDetail = readCachedCiberseguridad(codDane)

  const [detail, setDetail] = useState<CiberseguridadDetail | null>(cachedDetail)
  const [isLoading, setIsLoading] = useState(cachedDetail === null)
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    if (readCachedCiberseguridad(codDane) !== null) return

    let isActive = true

    setIsLoading(true)
    setError(null)

    loadCiberseguridad(codDane)
      .then(loaded => {
        if (!isActive) return

        setDetail(loaded)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isActive) return

        setError('No se pudo cargar el detalle de ciberseguridad')
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [codDane])

  const startClose = useCallback(() => setIsClosing(true), [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') startClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [startClose])

  function handleAnimationEnd(event: React.AnimationEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return
    if (isClosing) onClose()
  }

  const stateClass = isClosing ? 'survey-modal--closing' : 'survey-modal--open'

  return (
    <div
      className={`survey-modal__backdrop ${stateClass}`}
      onClick={startClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Ciberseguridad"
        className="survey-modal"
        onClick={event => event.stopPropagation()}
      >
        <header className="survey-modal__header">
          <h2 className="survey-modal__title">Ciberseguridad</h2>
          <button
            type="button"
            className="survey-modal__close"
            onClick={startClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className="survey-modal__body">
          <CiberseguridadModalBody isLoading={isLoading} error={error} detail={detail} />
        </div>
      </div>
    </div>
  )
}