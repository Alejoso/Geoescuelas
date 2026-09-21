'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import IndicatorCard from './IndicatorCard'
import { toIndicatorView, type DisplayMode } from '@/lib/schools/indicators'
import { useFocusTrap } from '@/lib/ui/useFocusTrap'
import type { RespondentNoun, SurveyDefinition, SurveyResult } from '@/lib/surveys/types'
import { loadSurvey, readCachedSurvey } from '@/lib/surveys/cache'

type SurveyModalProps = {
  codDane: string
  survey: SurveyDefinition
  displayMode: DisplayMode
  onClose: () => void
}

function formatSurveyRespondents(count: number, noun: RespondentNoun): string {
  const word = count === 1 ? noun.singular : noun.plural
  return `${count} ${word}`
}

type SurveyModalBodyProps = {
  isLoading: boolean
  error: string | null
  result: SurveyResult | null
  respondentNoun: RespondentNoun
  displayMode: DisplayMode
}

function SurveyModalBody({ isLoading, error, result, respondentNoun, displayMode }: SurveyModalBodyProps) {
  if (isLoading) return <p className="survey-modal__status">Cargando…</p>
  if (error !== null) return <p className="survey-modal__status">{error}</p>
  if (result === null) return null

  if (result.respondentCount === 0) {
    return (
      <p className="survey-modal__status">
        Esta institución no participó en esta encuesta
      </p>
    )
  }

  const respondentsText = formatSurveyRespondents(result.respondentCount, respondentNoun)
  const indicatorViews = result.indicators.map(toIndicatorView)

  return (
    <>
      <p className="survey-modal__respondents">Basado en {respondentsText}</p>
      <div className="indicator-list">
        {indicatorViews.map(view => (
          <IndicatorCard key={view.label} {...view} displayMode={displayMode} />
        ))}
      </div>
    </>
  )
}

export default function SurveyModal({ codDane, survey, displayMode, onClose }: SurveyModalProps) {
  // Read synchronously so a prefetched survey renders on the first frame.
  const cachedResult = readCachedSurvey(survey, codDane)

  const [result, setResult] = useState<SurveyResult | null>(cachedResult)
  const [isLoading, setIsLoading] = useState(cachedResult === null)
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    if (readCachedSurvey(survey, codDane) !== null) return

    // Requests are shared through the cache, so an unmount marks this consumer
    // inactive rather than aborting a request someone else may be awaiting.
    let isActive = true

    setIsLoading(true)
    setError(null)

    loadSurvey(survey, codDane)
      .then(loaded => {
        if (!isActive) return

        setResult(loaded)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isActive) return

        setError('No se pudieron cargar los indicadores')
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [codDane, survey])

  const startClose = useCallback(() => setIsClosing(true), [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') startClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [startClose])

  function handleAnimationEnd(event: React.AnimationEvent<HTMLElement>) {
    // Ignore the dialog's own animation bubbling up from inside the backdrop.
    if (event.target !== event.currentTarget) return
    // Unmount only after the closing animation, never the opening one.
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
        aria-label={survey.title}
        className="survey-modal"
        onClick={event => event.stopPropagation()}
      >
        <header className="survey-modal__header">
          <h2 className="survey-modal__title">{survey.title}</h2>
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
          <SurveyModalBody
            isLoading={isLoading}
            error={error}
            result={result}
            respondentNoun={survey.respondentNoun}
            displayMode={displayMode}
          />
        </div>


      </div>
    </div>
  )
}