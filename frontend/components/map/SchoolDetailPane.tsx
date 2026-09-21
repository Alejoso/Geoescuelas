'use client'

import { useEffect, useState } from 'react'
import type { School } from '@/lib/api/schools'
import { buildIndicatorViews, type DisplayMode } from '@/lib/schools/indicators'
import { buildInfoGroups } from '@/lib/schools/info'

import IndicatorCard from './IndicatorCard'
import SurveyModal from './SurveyModal'
import CiberseguridadModal from './CiberseguridadModal'
import { SURVEYS_BY_INDICATOR } from '@/lib/surveys/definitions'
import type { SurveyDefinition } from '@/lib/surveys/types'
import { prefetchSurveys } from '@/lib/surveys/cache'
import { loadCiberseguridad } from '@/lib/schools/ciberseguridadCache'

import Saber11Modal from './Saber11Modal'
import { loadSaber11 } from '@/lib/schools/saber11Cache'

type TabId = 'indicators' | 'info'

const TABS: { id: TabId; label: string }[] = [
  { id: 'indicators', label: 'Indicadores' },
  { id: 'info', label: 'Información IE' },
]

// Indicators whose detail view isn't a numeric-survey breakdown get their own
// entry here instead of SURVEYS_BY_INDICATOR.
const CIBERSEGURIDAD_INDICATOR_ID = 'ciberseguridad'
const SABER_11_INDICATOR_ID = 'saber_11'

type SchoolDetailPaneProps = {
  school: School | null
  onClose: () => void
}

export default function SchoolDetailPane({ school, onClose }: SchoolDetailPaneProps) {
  const [renderedSchool, setRenderedSchool] = useState<School | null>(school)
  const [isClosing, setIsClosing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('indicators')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('percentage')
  const [activeSurvey, setActiveSurvey] = useState<SurveyDefinition | null>(null)
  // Separate from activeSurvey since it opens a different modal shape
  // (histogram + counts, not a numeric-indicator list).
  const [isCiberseguridadOpen, setIsCiberseguridadOpen] = useState(false)
  const [isSaber11Open, setIsSaber11Open] = useState(false)

  useEffect(() => {
    if (school) {
      setRenderedSchool(school)
      setIsClosing(false)
      setActiveSurvey(null)
      setIsCiberseguridadOpen(false)
      setIsSaber11Open(false)
    } else {
      setIsClosing(true)
      setActiveSurvey(null)
      setIsCiberseguridadOpen(false)
      setIsSaber11Open(false)
    }
  }, [school])

  if (!renderedSchool) return null

  function handleAnimationEnd(event: React.AnimationEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return
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
            <IndicatorsPanel
              school={renderedSchool}
              onOpenSurvey={setActiveSurvey}
              onOpenCiberseguridad={() => setIsCiberseguridadOpen(true)}
              onOpenSaber11={() => setIsSaber11Open(true)}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
            />
          ) : (
            <InfoPanel school={renderedSchool} />
          )}
        </div>
      </aside>

      {activeSurvey && (
        <SurveyModal
          codDane={renderedSchool.cod_dane}
          survey={activeSurvey}
          displayMode={displayMode}
          onClose={() => setActiveSurvey(null)}
        />
      )}

      {isCiberseguridadOpen && (
        <CiberseguridadModal
          codDane={renderedSchool.cod_dane}
          onClose={() => setIsCiberseguridadOpen(false)}
        />
      )}

      {isSaber11Open && (
        <Saber11Modal
          codDane={renderedSchool.cod_dane}
          onClose={() => setIsSaber11Open(false)}
        />
      )}
    </>
  )
}

type IndicatorsPanelProps = {
  school: School
  onOpenSurvey: (survey: SurveyDefinition) => void
  onOpenCiberseguridad: () => void
  onOpenSaber11: () => void
  displayMode: DisplayMode
  onDisplayModeChange: (mode: DisplayMode) => void
}

type CardDetail =
  | { kind: 'survey'; survey: SurveyDefinition }
  | { kind: 'ciberseguridad' }
  | { kind: 'saber11' }
  | null

function IndicatorsPanel({
  school,
  onOpenSurvey,
  onOpenCiberseguridad,
  onOpenSaber11,
  displayMode,
  onDisplayModeChange,
}: IndicatorsPanelProps) {
  const indicators = buildIndicatorViews(school)

  function detailFor(indicator: ReturnType<typeof buildIndicatorViews>[number]): CardDetail {
    if (!indicator.isMeasured) return null

    if (indicator.id === CIBERSEGURIDAD_INDICATOR_ID) {
      return { kind: 'ciberseguridad' }
    }

    if (indicator.id === SABER_11_INDICATOR_ID) {
      return { kind: 'saber11' }
    }

    const survey = SURVEYS_BY_INDICATOR[indicator.id]
    return survey ? { kind: 'survey', survey } : null
  }

  const cards = indicators.map(indicator => ({
    indicator,
    detail: detailFor(indicator),
  }))

  const openableSurveys: SurveyDefinition[] = []
  let isCiberseguridadOpenable = false
  let isSaber11Openable = false

  for (const card of cards) {
    if (card.detail?.kind === 'survey') {
      openableSurveys.push(card.detail.survey)
    } else if (card.detail?.kind === 'ciberseguridad') {
      isCiberseguridadOpenable = true
    } else if (card.detail?.kind === 'saber11') {
      isSaber11Openable = true
    }
  }

  function warmDetailCache() {
    prefetchSurveys(openableSurveys, school.cod_dane)

    if (isCiberseguridadOpenable) {
      loadCiberseguridad(school.cod_dane).catch(() => {})
    }

    if (isSaber11Openable) {
      loadSaber11(school.cod_dane).catch(() => {})
    }
  }

  function handleOpenDetail(detail: CardDetail) {
    if (detail === null) return

    warmDetailCache()

    if (detail.kind === 'survey') {
      onOpenSurvey(detail.survey)
    } else if (detail.kind === 'ciberseguridad') {
      onOpenCiberseguridad()
    } else {
      onOpenSaber11()
    }
  }

  return (
    <div className="indicator-list">
      <div className="indicator-list__mode-toggle" role="group" aria-label="Formato de puntaje">
        <button
          type="button"
          className={`indicator-list__mode-button ${
            displayMode === 'percentage' ? 'indicator-list__mode-button--active' : ''
          }`}
          aria-pressed={displayMode === 'percentage'}
          onClick={() => onDisplayModeChange('percentage')}
        >
          %
        </button>
        <button
          type="button"
          className={`indicator-list__mode-button ${
            displayMode === 'raw' ? 'indicator-list__mode-button--active' : ''
          }`}
          aria-pressed={displayMode === 'raw'}
          onClick={() => onDisplayModeChange('raw')}
        >
          Valor
        </button>
      </div>

      {cards.map(({ indicator, detail }) => (
        <IndicatorCard
          key={indicator.id}
          {...indicator}
          onOpenSurvey={detail ? () => handleOpenDetail(detail) : undefined}
          displayMode={displayMode}
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