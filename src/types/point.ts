export const POINT_TYPES = ['soil_sample', 'pests', 'disease', 'other'] as const

export type PointType = (typeof POINT_TYPES)[number]

export const POINT_TYPE_LABELS: Record<PointType, string> = {
  soil_sample: 'Проба ґрунту',
  pests: 'Шкідники',
  disease: 'Хвороби рослин',
  other: 'Інше',
}

export interface MonitoringPoint {
  id: string
  fieldId: string
  /** WGS 84, degrees. MGRS is derived on render, not stored. */
  lat: number
  lng: number
  type: PointType
  description: string
  /** ISO 8601 string, so it survives JSON serialization in localStorage. */
  createdAt: string
}
