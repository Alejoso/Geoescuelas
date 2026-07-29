'use client'

import { useEffect, useState } from 'react'
import type { School } from '@/lib/api/schools'
import { buildIndicatorViews, SCORE_MAX_LABEL } from '@/lib/schools/indicators'
import { buildInfoGroups } from '@/lib/schools/info'

type TabId = 'indicators' | 'info'

const TABS: { id: TabId; label: string }[] = [
  { id: 'indicators', label: 'Indicadores' },
  { id: 'info', label: 'Información IE' },
]

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
  // Survives school changes on purpose: browsing the same tab across schools
  // is the common case.
  const [activeTab, setActiveTab] = useState<TabId>('indicators')

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
        <p className="school-pane__dane">DANE · {renderedSchool.cod_dane}</p>
        <h2 className="school-pane__name">{renderedSchool.nombre_institucion}</h2>
      </div>

      <div className="school-pane__tabs" role="tablist">
        {TABS.map(tab => {
          const isActive = tab.id === activeTab
          const activeClass = isActive ? 'school-pane__tab--active' : ''

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`school-pane__tab ${activeClass}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="school-pane__body">
        {activeTab === 'indicators' ? (
          <IndicatorsPanel school={renderedSchool} />
        ) : (
          <InfoPanel school={renderedSchool} />
        )}
      </div>
    </aside>
  )
}

function IndicatorsPanel({ school }: { school: School }) {
  const indicators = buildIndicatorViews(school)

  return (
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
            
            {indicator.respondentsText && (
              <p className="indicator-card__respondents">
                {indicator.respondentsText}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function InfoPanel({ school }: { school: School }) {
  const groups = buildInfoGroups(school)

  return (
    <div className="info-list">
      {groups.map(group => (
        <section key={group.title} className="info-group">
          <p className="info-group__title">{group.title}</p>

          {group.fields.map(field => {
            const caseClass = field.preserveCase ? 'info-row__value--raw' : ''

            return (
              <div key={field.label} className="info-row">
                <span className="info-row__label">{field.label}</span>
                <span className={`info-row__value ${caseClass}`}>{field.value}</span>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}