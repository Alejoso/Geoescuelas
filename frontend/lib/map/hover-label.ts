import L from 'leaflet'

const TOOLTIP_OFFSET: L.PointTuple = [0, -8]

export type HoverLabelController = {
  activate(layer: L.Path, label: string, latlng: L.LatLng): void
  refresh(latlng: L.LatLng): void
  deactivate(layer: L.Path): void
  clear(): void
}

type HoverLabelOptions = {
  idleStyle: L.PathOptions
  hoverStyle: L.PathOptions
  tooltipClassName: string
}

export function createHoverLabelController(
  map: L.Map,
  options: HoverLabelOptions,
): HoverLabelController {
  // Deliberately NOT layer.bindTooltip. Leaflet defers a bound tooltip's open
  // until moveend while the map is dragging, so a shape crossed mid-pan opens
  // its tooltip after the cursor has left and nothing closes it.
  const tooltip = L.tooltip({
    direction: 'top',
    offset: TOOLTIP_OFFSET,
    className: options.tooltipClassName,
  })

  let activeLayer: L.Path | null = null
  let activeLabel = ''

  // Single place that puts the tooltip on screen. Re-adds it when something
  // outside the controller removed it, which a click does.
  function showTooltip(latlng: L.LatLng): void {
    if (!activeLabel) return

    tooltip.setContent(activeLabel)
    tooltip.setLatLng(latlng)

    if (!map.hasLayer(tooltip)) {
      tooltip.addTo(map)
    }
  }

  function clear(): void {
    if (!activeLayer) return

    activeLayer.setStyle(options.idleStyle)
    activeLayer = null
    activeLabel = ''
    tooltip.remove()
  }

  function activate(layer: L.Path, label: string, latlng: L.LatLng): void {
    if (layer === activeLayer) return

    clear()

    layer.setStyle(options.hoverStyle)
    layer.bringToFront()
    activeLayer = layer
    activeLabel = label

    showTooltip(latlng)
  }

  function refresh(latlng: L.LatLng): void {
    if (!activeLayer) return
    showTooltip(latlng)
  }

  function deactivate(layer: L.Path): void {
    if (layer !== activeLayer) return
    clear()
  }

  return { activate, refresh, deactivate, clear }
}