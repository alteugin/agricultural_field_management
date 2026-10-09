import type { PointType } from '../../types/point'

interface PointTypeStyle {
  color: string
  /** Inner SVG markup for a 24x24 stroke icon. */
  icon: string
}

export const POINT_TYPE_STYLES: Record<PointType, PointTypeStyle> = {
  soil_sample: {
    color: '#92400e',
    // conical flask
    icon: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.5 15h9"/>',
  },
  pests: {
    color: '#dc2626',
    // bug
    icon: '<ellipse cx="12" cy="13" rx="4" ry="6"/><path d="M12 7V5M8 9 5 7M16 9l3-2M8 13H4M16 13h4M8 17l-3 2M16 17l3 2"/>',
  },
  disease: {
    color: '#7c3aed',
    // leaf
    icon: '<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14z"/><path d="M5 19 13 11"/>',
  },
  other: {
    color: '#475569',
    // info
    icon: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  },
}

export function pointTypeSvg(type: PointType, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${POINT_TYPE_STYLES[type].icon}</svg>`
}
