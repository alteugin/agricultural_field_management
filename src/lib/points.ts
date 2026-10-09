import type { MonitoringPoint, PointType } from '../types/point'

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
