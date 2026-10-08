import type { Feature, Polygon } from 'geojson'

/** Properties of a field as they come in the source GeoJSON. */
export interface FieldProperties {
  id: string
  name: string
  crop: string
}

export type FieldFeature = Feature<Polygon, FieldProperties>

/** Normalized field the app works with. */
export interface Field {
  id: string
  name: string
  crop: string
  /** Computed from geometry, hectares. */
  areaHa: number
  geometry: Polygon
}
