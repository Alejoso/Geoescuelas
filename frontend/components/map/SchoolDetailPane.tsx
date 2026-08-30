'use client'

import { useEffect, useState } from 'react'
import type { School } from '@/lib/api/schools'
import { buildIndicatorViews, SCORE_MAX_LABEL } from '@/lib/schools/indicators'
import { buildInfoGroups } from '@/lib/schools/info'

import IndicatorCard from './IndicatorCard'
import SurveyModal from './SurveyModal'
import {SURVEYS_BY_INDICATOR } from '@/lib/surveys/definitions'
import type { SurveyDefinition } from '@/lib/surveys/types'
import { prefetchSurveys } from '@/lib/surveys/cache'

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
  // Cleared when the school changes so a modal never outlives the school it
  // was opened from.
  const [activeSurvey, setActiveSurvey] = useState<SurveyDefinition | null>(null)

  useEffect(() => {
    if (school) {
      // Opening, or switching to another school: show it, cancel any close.
      setRenderedSchool(school)
      setIsClosing(false)
      setActiveSurvey(null)
    } else {
      // Closing: keep current content mounted and play the exit animation.
      setIsClosing(true)
      setActiveSurvey(null)
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
    <>
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
            <IndicatorsPanel school={renderedSchool} onOpenSurvey={setActiveSurvey} />
          ) : (
            <InfoPanel school={renderedSchool} />
          )}
        </div>
      </aside>

      {activeSurvey && (
        <SurveyModal
          codDane={renderedSchool.cod_dane}
          survey={activeSurvey}
          onClose={() => setActiveSurvey(null)}
        />
      )}
    </>
  )
}

type IndicatorsPanelProps = {
  school: School
  onOpenSurvey: (survey: SurveyDefinition) => void
}

function IndicatorsPanel({ school, onOpenSurvey }: IndicatorsPanelProps) {
  const indicators = buildIndicatorViews(school)

  // Paired up once so the survey lookup is not repeated between the prefetch
  // list and the render below.
  const cards = indicators.map(indicator => {
    const survey = SURVEYS_BY_INDICATOR[indicator.id]
    const isOpenable = indicator.isMeasured && survey !== undefined

    return { indicator, survey: isOpenable ? survey : null }
  })

  const openableSurveys: SurveyDefinition[] = []

  for (const card of cards) {
    if (card.survey !== null) {
      openableSurveys.push(card.survey)
    }
  }

  function handleOpenSurvey(survey: SurveyDefinition) {
    // The user has shown intent on this school, so warm the rest while they
    // read the first one.
    prefetchSurveys(openableSurveys, school.cod_dane)
    onOpenSurvey(survey)
  }

  return (
    <div className="indicator-list">
      {cards.map(({ indicator, survey }) => (
        <IndicatorCard
          key={indicator.id}
          {...indicator}
          onOpenSurvey={survey ? () => handleOpenSurvey(survey) : undefined}
        />
      ))}
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