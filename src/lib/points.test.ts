import { describe, expect, it } from 'vitest'
import type { MonitoringPoint } from '../types/point'
import { DEFAULT_POINTS_QUERY, queryPoints } from './points'

function point(overrides: Partial<MonitoringPoint>): MonitoringPoint {
  return {
    id: 'p',
    fieldId: 'field-1',
    lat: 49.77,
    lng: 30.05,
    type: 'other',
    description: '',
    createdAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  }
}

const points: MonitoringPoint[] = [
  point({ id: 'a', type: 'pests', description: 'Попелиця на краю', createdAt: '2026-10-02T09:00:00.000Z' }),
  point({ id: 'b', type: 'soil_sample', description: 'Глибина 30 см', createdAt: '2026-10-01T09:00:00.000Z' }),
  point({ id: 'c', fieldId: 'field-2', type: 'pests', description: 'ПОПЕЛИЦЯ', createdAt: '2026-10-03T09:00:00.000Z' }),
]

const ids = (list: MonitoringPoint[]) => list.map((p) => p.id)

describe('queryPoints', () => {
  it('returns everything newest first by default', () => {
    expect(ids(queryPoints(points, DEFAULT_POINTS_QUERY))).toEqual(['c', 'a', 'b'])
  })

  it('sorts oldest first', () => {
    expect(ids(queryPoints(points, { ...DEFAULT_POINTS_QUERY, sort: 'oldest' }))).toEqual(['b', 'a', 'c'])
  })

  it('filters by field', () => {
    expect(ids(queryPoints(points, { ...DEFAULT_POINTS_QUERY, fieldId: 'field-1' }))).toEqual(['a', 'b'])
  })

  it('filters by type', () => {
    expect(ids(queryPoints(points, { ...DEFAULT_POINTS_QUERY, type: 'soil_sample' }))).toEqual(['b'])
  })

  it('searches description case-insensitively, ignoring surrounding spaces', () => {
    expect(ids(queryPoints(points, { ...DEFAULT_POINTS_QUERY, search: '  попелиця ' }))).toEqual(['c', 'a'])
  })

  it('combines all criteria', () => {
    const query = { fieldId: 'field-1', type: 'pests', search: 'попел', sort: 'newest' } as const
    expect(ids(queryPoints(points, query))).toEqual(['a'])
  })

  it('does not mutate the input array', () => {
    const copy = [...points]
    queryPoints(points, { ...DEFAULT_POINTS_QUERY, sort: 'oldest' })
    expect(points).toEqual(copy)
  })
})
