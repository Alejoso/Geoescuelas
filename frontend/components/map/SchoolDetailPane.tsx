'use client'

import { useEffect, useState } from 'react'
import type { School } from '@/lib/api/schools'
import { buildIndicatorViews, SCORE_MAX_LABEL } from '@/lib/schools/indicators'

type SchoolDetailPaneProps = {
  school: School | null
  onClose: () => void
}

export default function SchoolDetailPane({ school, onClose }: SchoolDetailPaneProps) {
  // The school kept on screen. Outlives `school` going null so the pane can
  // finish sliding out before it unmounts.
  const [renderedSchool, setRenderedSchool] = useState<School | null>(school)
  // True while the exit animation is playing. Selects the closing keyframes.
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (school) {
      // Opening, or switching to another school: show it, cancel any close.
      setRenderedSchool(school)
      setIsClosing(false)
    } else {
      // Closing: keep current content mounted and play the exit animation.
      setIsClosing(true)
    }
  }, [school])

  if (!renderedSchool) return null

  function handleAnimationEnd(event: React.AnimationEvent<HTMLElement>) {
    // Ignore animations bubbling up from children.
    if (event.target !== event.currentTarget) return
    // Unmount only after the closing animation, never the opening one.
    if (isClosing) {
      setRenderedSchool(null)
      setIsClosing(false)
    }
  }

  const stateClass = isClosing ? 'school-pane--closing' : 'school-pane--open'

  const indicators = buildIndicatorViews(renderedSchool)

  return (
    <aside
      className={`school-pane ${stateClass}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <button
        type="button"
        className="school-pane__close"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ✕
      </button>

      <div className="school-pane__header">
        <p className="school-pane__dane">DANE · {renderedSchool.dane}</p>
        <h2 className="school-pane__name">{renderedSchool.nombre}</h2>
      </div>

      <div className="school-pane__body">
        <p className="school-pane__section-title">Indicadores</p>

        <div className="indicator-list">
          {indicators.map(indicator => {
            const accentColor = indicator.color ?? 'rgba(255, 255, 255, 0.15)'

            return (
              <div
                key={indicator.label}
                className="indicator-card"
                style={{ borderLeftColor: accentColor }}
              >
                <div className="indicator-card__top">
                  <span className="indicator-card__label">{indicator.label}</span>
                  {indicator.tierLabel && (
                    <span
                      className="indicator-card__tier"
                      style={{ color: indicator.color ?? undefined }}
                    >
                      {indicator.tierLabel}
                    </span>
                  )}
                </div>

                <div className="indicator-card__score">
                  <span
                    className="indicator-card__value"
                    style={{ color: indicator.color ?? undefined }}
                  >
                    {indicator.scoreText}
                  </span>
                  <span className="indicator-card__max">/ {SCORE_MAX_LABEL}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="school-pane__footer">
          <span className="school-pane__footer-label">Docentes encuestados</span>
          <span className="school-pane__footer-value">
            {renderedSchool.numero_docentes_encuestados}
          </span>
        </div>
      </div>
    </aside>
  )
}