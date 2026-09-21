'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useFocusTrap } from '@/lib/ui/useFocusTrap'
import type { Saber11Detail } from '@/lib/api/saber11'
import { loadSaber11, readCachedSaber11 } from '@/lib/schools/saber11Cache'

type Saber11ModalProps = {
  codDane: string
  onClose: () => void
}

function formatPublicados(count: number): string {
  const noun = count === 1 ? 'estudiante publicado' : 'estudiantes publicados'
  return `${count} ${noun}`
}

type Saber11ModalBodyProps = {
  isLoading: boolean
  error: string | null
  detail: Saber11Detail | null
}

function Saber11ModalBody({ isLoading, error, detail }: Saber11ModalBodyProps) {
  if (isLoading) return <p className="survey-modal__status">Cargando…</p>
  if (error !== null) return <p className="survey-modal__status">{error}</p>
  if (detail === null) return null

  if (detail.publicados === null || detail.publicados === 0) {
    return (
      <p className="survey-modal__status">
        Esta institución no participó en esta encuesta
      </p>
    )
  }

  return (
    <>
      <p className="survey-modal__respondents">
        Basado en {formatPublicados(detail.publicados)}
      </p>

      <div className="saber11-stats">
        <div className="saber11-stat">
          <span className="saber11-stat__label">Institución</span>
          <span className="saber11-stat__value">
            {detail.promedio !== null ? detail.promedio.toFixed(0) : '—'}
          </span>
        </div>
        <div className="saber11-stat">
          <span className="saber11-stat__label">Colombia</span>
          <span className="saber11-stat__value">
            {detail.promedio_nacional !== null ? detail.promedio_nacional.toFixed(0) : '—'}
          </span>
        </div>
      </div>

      {detail.clasificacion !== null && (
        <>
          <p className="saber11-section-title">Clasificación</p>
          <p className="saber11-clasificacion">{detail.clasificacion}</p>
        </>
      )}
    </>
  )
}

export default function Saber11Modal({ codDane, onClose }: Saber11ModalProps) {
  const cachedDetail = readCachedSaber11(codDane)

  const [detail, setDetail] = useState<Saber11Detail | null>(cachedDetail)
  const [isLoading, setIsLoading] = useState(cachedDetail === null)
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    if (readCachedSaber11(codDane) !== null) return

    let isActive = true

    setIsLoading(true)
    setError(null)

    loadSaber11(codDane)
      .then(loaded => {
        if (!isActive) return

        setDetail(loaded)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isActive) return

        setError('No se pudo cargar el detalle de Saber 11')
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
        aria-label="Saber 11"
        className="survey-modal"
        onClick={event => event.stopPropagation()}
      >
        <header className="survey-modal__header">
          <h2 className="survey-modal__title">Saber 11</h2>
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
          <Saber11ModalBody isLoading={isLoading} error={error} detail={detail} />
        </div>
      </div>
    </div>
  )
}