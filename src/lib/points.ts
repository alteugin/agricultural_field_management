import { POINT_TYPES, type MonitoringPoint, type PointType } from '../types/point'
import { isFiniteNumber, isNonEmptyString, isRecord } from './guards'

export function isPointType(value: unknown): value is PointType {
  return POINT_TYPES.some((type) => type === value)
}

export function isMonitoringPoint(value: unknown): value is MonitoringPoint {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.fieldId) &&
    isFiniteNumber(value.lat) &&
    isFiniteNumber(value.lng) &&
    isPointType(value.type) &&
    typeof value.description === 'string' &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt))
  )
}

/** Keeps only well-formed points from untrusted data (e.g. localStorage). */
export function sanitizePoints(value: unknown): { points: MonitoringPoint[]; dropped: number } {
  if (!Array.isArray(value)) return { points: [], dropped: 0 }
  const points = value.filter(isMonitoringPoint)
  return { points, dropped: value.length - points.length }
}

export type SortOrder = 'newest' | 'oldest'

export interface PointsQuery {
  /** null means points from every field. */
  fieldId: string | null
  type: PointType | 'all'
  search: string
  sort: SortOrder
}

export const DEFAULT_POINTS_QUERY: PointsQuery = {
  fieldId: null,
  type: 'all',
  search: '',
  sort: 'newest',
}

/** Applies field/type filters, description search and date sorting. Does not mutate input. */
export function queryPoints(points: readonly MonitoringPoint[], query: PointsQuery): MonitoringPoint[] {
  const needle = query.search.trim().toLocaleLowerCase('uk')
  const direction = query.sort === 'newest' ? -1 : 1

  return points
    .filter((point) => query.fieldId === null || point.fieldId === query.fieldId)
    .filter((point) => query.type === 'all' || point.type === query.type)
    .filter((point) => needle === '' || point.description.toLocaleLowerCase('uk').includes(needle))
    .sort((a, b) => direction * (Date.parse(a.createdAt) - Date.parse(b.createdAt)))
}
