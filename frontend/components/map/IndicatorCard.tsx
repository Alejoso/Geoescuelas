import type { DisplayMode, IndicatorView } from '@/lib/schools/indicators'

const DETAIL_TOOLTIP_LABEL = 'Ver subindicadores'
const NO_DATA_ACCENT_COLOR = 'rgba(255, 255, 255, 0.15)'

type IndicatorCardProps = IndicatorView & {
  // Omitted when the indicator has no survey behind it, and by the modal's own
  // cards so they cannot reopen the modal they live in.
  onOpenSurvey?: () => void
  displayMode: DisplayMode
}

function EyeIcon() {
  return (
    <svg
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export default function IndicatorCard({
  label,
  scoreText,
  percentageText,
  respondentsText,
  tierLabel,
  color,
  maxLabel,
  displayMode,
  onOpenSurvey,
}: IndicatorCardProps) {
  const accentColor = color ?? NO_DATA_ACCENT_COLOR

  // Saber 11 (and any unmeasured indicator) has no percentage form, so it
  // always shows its raw score regardless of the panel's chosen mode.
  const showsPercentage = displayMode === 'percentage' && percentageText !== null
  const primaryText = showsPercentage ? percentageText : scoreText

  return (
    <div className="indicator-card" style={{ borderLeftColor: accentColor }}>
      <div className="indicator-card__top">
        <span className="indicator-card__label">{label}</span>
        {tierLabel && (
          <span className="indicator-card__tier" style={{ color: color ?? undefined }}>
            {tierLabel}
          </span>
        )}
      </div>

      <div className="indicator-card__score">
        <span className="indicator-card__value" style={{ color: color ?? undefined }}>
          {primaryText}
        </span>
        {!showsPercentage && <span className="indicator-card__max">/ {maxLabel}</span>}

        {onOpenSurvey && (
          <button
            type="button"
            className="indicator-card__detail"
            onClick={onOpenSurvey}
            aria-label={`${DETAIL_TOOLTIP_LABEL} de ${label}`}
            data-tooltip={DETAIL_TOOLTIP_LABEL}
          >
            <EyeIcon />
          </button>
        )}
      </div>

      {respondentsText && (
        <p className="indicator-card__respondents">{respondentsText}</p>
      )}
    </div>
  )
}