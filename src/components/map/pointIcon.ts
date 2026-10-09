import { divIcon, type DivIcon } from 'leaflet'
import { POINT_TYPE_STYLES, pointTypeSvg } from '../points/pointTypeStyles'
import type { PointType } from '../../types/point'

const MARKER_SIZE = 28

const cache = new Map<PointType, DivIcon>()

/**
 * Icons are cached per type: react-leaflet calls setIcon whenever the icon
 * prop changes by reference, so a fresh object per render would cause DOM churn.
 */
export function getPointIcon(type: PointType): DivIcon {
  let icon = cache.get(type)
  if (!icon) {
    icon = divIcon({
      className: 'point-marker',
      html: `<span style="background-color:${POINT_TYPE_STYLES[type].color}">${pointTypeSvg(type, 16)}</span>`,
      iconSize: [MARKER_SIZE, MARKER_SIZE],
      iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
      popupAnchor: [0, -MARKER_SIZE / 2],
    })
    cache.set(type, icon)
  }
  return icon
}
