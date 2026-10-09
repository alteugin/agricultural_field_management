import type { PointType } from '../../types/point'
import { POINT_TYPE_STYLES, pointTypeSvg } from './pointTypeStyles'

interface PointTypeIconProps {
  type: PointType
  size?: number
}

/** Same badge as the map marker, for use in regular React UI. */
export function PointTypeIcon({ type, size = 24 }: PointTypeIconProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-white"
      style={{ width: size, height: size, backgroundColor: POINT_TYPE_STYLES[type].color }}
      // Static markup from our own constants, no user input involved
      dangerouslySetInnerHTML={{ __html: pointTypeSvg(type, Math.round(size * 0.6)) }}
    />
  )
}
