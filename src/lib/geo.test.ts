import { describe, expect, it } from 'vitest'
import type { Polygon } from 'geojson'
import { isPointInPolygon, polygonToLatLngs, roundCoordinate, toMGRS } from './geo'

describe('roundCoordinate', () => {
  it('keeps 6 decimal places', () => {
    expect(roundCoordinate(49.61234567)).toBe(49.612346)
    expect(roundCoordinate(-30.0000004)).toBe(-30)
  })
})

// L-shaped (concave) polygon, so a bounding-box check would give wrong answers
const lShape: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [30.0, 50.0],
      [30.2, 50.0],
      [30.2, 50.1],
      [30.1, 50.1],
      [30.1, 50.2],
      [30.0, 50.2],
      [30.0, 50.0],
    ],
  ],
}

describe('polygonToLatLngs', () => {
  it('swaps GeoJSON [lng, lat] into Leaflet [lat, lng]', () => {
    expect(polygonToLatLngs(lShape)[0]?.[1]).toEqual([50.0, 30.2])
  })
})

describe('isPointInPolygon', () => {
  it('detects points inside', () => {
    expect(isPointInPolygon({ lat: 50.05, lng: 30.05 }, lShape)).toBe(true)
  })

  it('detects points outside, including the concave notch', () => {
    expect(isPointInPolygon({ lat: 50.15, lng: 30.15 }, lShape)).toBe(false)
    expect(isPointInPolygon({ lat: 49.9, lng: 30.05 }, lShape)).toBe(false)
  })
})

describe('toMGRS', () => {
  it('converts a point near Bila Tserkva', () => {
    expect(toMGRS({ lat: 49.77, lng: 30.05 })).toBe('36U TA 87590 17235')
  })

  it('handles the southern and western hemispheres', () => {
    // Sydney Opera House
    expect(toMGRS({ lat: -33.8568, lng: 151.2153 })).toMatch(/^56H LH \d{5} \d{5}$/)
  })

  it('returns null where MGRS is undefined', () => {
    expect(toMGRS({ lat: 85, lng: 0 })).toBeNull()
    expect(toMGRS({ lat: Number.NaN, lng: 30 })).toBeNull()
    expect(toMGRS({ lat: 50, lng: 200 })).toBeNull()
  })
})
