import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import { forward as toMgrsRaw } from 'mgrs'
import type { Polygon } from 'geojson'

export interface LatLng {
  lat: number
  lng: number
}

/** Leaflet's [lat, lng] tuple, as opposed to GeoJSON's [lng, lat]. */
export type LatLngTuple = [number, number]

/**
 * GeoJSON stores coordinates as [lng, lat], Leaflet expects [lat, lng].
 * This is the only place in the app where the order is swapped.
 */
export function polygonToLatLngs(polygon: Polygon): LatLngTuple[][] {
  return polygon.coordinates.map((ring) => ring.map(([lng = 0, lat = 0]) => [lat, lng]))
}

/** 6 decimal places is ~10 cm, well beyond what a click on the map can target. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1e6) / 1e6
}

export function isPointInPolygon({ lat, lng }: LatLng, polygon: Polygon): boolean {
  return booleanPointInPolygon([lng, lat], polygon)
}

/**
 * Converts WGS 84 coordinates to a 1 m precision MGRS reference,
 * grouped for readability: "36U TA 87590 17235".
 * Returns null when MGRS is undefined for the point (polar regions, bad input).
 */
export function toMGRS({ lat, lng }: LatLng): string | null {
  // mgrs silently returns garbage for NaN, so validate up front
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lng) > 180) return null

  try {
    const raw = toMgrsRaw([lng, lat], 5)
    const match = /^(\d{1,2}[C-X])([A-Z]{2})(\d{5})(\d{5})$/.exec(raw)
    return match ? match.slice(1).join(' ') : raw
  } catch {
    // Thrown for latitudes outside 80°S..84°N, where MGRS uses UPS instead of UTM
    return null
  }
}
