import type { Feature, Polygon } from 'geojson'

export interface FieldProperties {
  id: string
  name: string
  crop: string
}

export type FieldFeature = Feature<Polygon, FieldProperties>

export interface Field {
  id: string
  name: string
  crop: string
  /** Computed from geometry, hectares. */
  areaHa: number
  geometry: Polygon
}
