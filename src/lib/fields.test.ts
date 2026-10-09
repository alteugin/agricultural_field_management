import { describe, expect, it } from 'vitest'
import { parseFields } from './fields'
import fieldsData from '../data/fields.json'

const square = {
  type: 'Polygon',
  coordinates: [
    [
      [30.5234, 50.4501],
      [30.5334, 50.4501],
      [30.5334, 50.4601],
      [30.5234, 50.4601],
      [30.5234, 50.4501],
    ],
  ],
}

function feature(properties: Record<string, unknown>, geometry: unknown = square) {
  return { type: 'Feature', properties, geometry }
}

function collection(...features: unknown[]) {
  return { type: 'FeatureCollection', features }
}

const validProps = { id: 'field-1', name: 'Поле №1', crop: 'Пшениця' }

describe('parseFields', () => {
  it('parses the bundled mock data without errors', () => {
    const { fields, errors } = parseFields(fieldsData)
    expect(errors).toEqual([])
    expect(fields).toHaveLength(5)
  })

  it('computes area from geometry instead of trusting properties', () => {
    // The sample from the assignment declares 45.2 ha, but the polygon is ~78.7 ha
    const { fields } = parseFields(collection(feature({ ...validProps, area: 45.2 })))
    expect(fields[0]?.areaHa).toBeCloseTo(78.7, 1)
  })

  it('rejects input that is not a FeatureCollection', () => {
    expect(parseFields(null).fields).toEqual([])
    expect(parseFields({ type: 'Feature' }).errors).toHaveLength(1)
  })

  it('skips invalid features but keeps valid ones', () => {
    const openRing = {
      type: 'Polygon',
      coordinates: [
        [
          [30, 50],
          [31, 50],
          [31, 51],
          [30, 51],
        ],
      ],
    }
    const { fields, errors } = parseFields(
      collection(
        feature(validProps),
        feature({ id: 'field-2', name: '', crop: 'Ріпак' }),
        feature({ id: 'field-3', name: 'Поле №3', crop: 'Ріпак' }, openRing),
        feature({ id: 'field-4', name: 'Поле №4', crop: 'Ріпак' }, { type: 'Point', coordinates: [30, 50] }),
        'not a feature',
      ),
    )
    expect(fields.map((f) => f.id)).toEqual(['field-1'])
    expect(errors).toHaveLength(4)
  })

  it('rejects out-of-range coordinates', () => {
    const swapped = {
      type: 'Polygon',
      coordinates: [
        [
          [50, 200],
          [51, 200],
          [51, 201],
          [50, 200],
        ],
      ],
    }
    expect(parseFields(collection(feature(validProps, swapped))).fields).toEqual([])
  })

  it('rejects duplicate ids', () => {
    const { fields, errors } = parseFields(collection(feature(validProps), feature(validProps)))
    expect(fields).toHaveLength(1)
    expect(errors[0]).toMatch(/дубльований/)
  })
})
