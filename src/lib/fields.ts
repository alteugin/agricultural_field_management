import { area } from '@turf/area'
import type { Polygon, Position } from 'geojson'
import type { Field } from '../types/field'
import { isFiniteNumber, isNonEmptyString, isRecord } from './guards'

const SQ_METERS_PER_HECTARE = 10_000

export interface ParseFieldsResult {
  fields: Field[]
  /** Human-readable reasons for every skipped feature. */
  errors: string[]
}

function isPosition(value: unknown): value is Position {
  if (!Array.isArray(value) || value.length < 2) return false
  const [lng, lat] = value
  return (
    isFiniteNumber(lng) &&
    isFiniteNumber(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  )
}

// A GeoJSON linear ring: at least 4 positions, first and last are the same.
function isLinearRing(value: unknown): value is Position[] {
  if (!Array.isArray(value) || value.length < 4 || !value.every(isPosition)) return false
  const first = value[0]
  const last = value[value.length - 1]
  return first?.[0] === last?.[0] && first?.[1] === last?.[1]
}

function isPolygon(value: unknown): value is Polygon {
  return (
    isRecord(value) &&
    value.type === 'Polygon' &&
    Array.isArray(value.coordinates) &&
    value.coordinates.length > 0 &&
    value.coordinates.every(isLinearRing)
  )
}

/**
 * Validates a GeoJSON FeatureCollection of fields and normalizes it.
 * Invalid features are skipped rather than failing the whole collection.
 */
export function parseFields(input: unknown): ParseFieldsResult {
  if (!isRecord(input) || input.type !== 'FeatureCollection' || !Array.isArray(input.features)) {
    return { fields: [], errors: ['Дані полів не є GeoJSON FeatureCollection'] }
  }

  const fields: Field[] = []
  const errors: string[] = []
  const seenIds = new Set<string>()

  input.features.forEach((feature: unknown, index) => {
    const label = `Об'єкт #${index + 1}`

    if (!isRecord(feature) || feature.type !== 'Feature') {
      errors.push(`${label}: не є GeoJSON Feature`)
      return
    }

    const { properties, geometry } = feature
    if (
      !isRecord(properties) ||
      !isNonEmptyString(properties.id) ||
      !isNonEmptyString(properties.name) ||
      !isNonEmptyString(properties.crop)
    ) {
      errors.push(`${label}: відсутні або некоректні id / name / crop`)
      return
    }

    if (!isPolygon(geometry)) {
      errors.push(`${label} (${properties.id}): некоректна геометрія Polygon`)
      return
    }

    if (seenIds.has(properties.id)) {
      errors.push(`${label}: дубльований id "${properties.id}"`)
      return
    }
    seenIds.add(properties.id)

    fields.push({
      id: properties.id,
      name: properties.name,
      crop: properties.crop,
      areaHa: area(geometry) / SQ_METERS_PER_HECTARE,
      geometry,
    })
  })

  return { fields, errors }
}
