import { useMemo } from 'react'
import { Polygon, Tooltip } from 'react-leaflet'
import type { PathOptions } from 'leaflet'
import { formatArea } from '../../lib/format'
import { polygonToLatLngs } from '../../lib/geo'
import { useFieldsStore } from '../../store/useFieldsStore'

const FIELD_STYLE: PathOptions = {
  color: '#059669',
  weight: 2,
  fillColor: '#10b981',
  fillOpacity: 0.15,
}

const ACTIVE_FIELD_STYLE: PathOptions = {
  color: '#d97706',
  weight: 3,
  fillColor: '#f59e0b',
  fillOpacity: 0.25,
}

export function FieldsLayer() {
  const fields = useFieldsStore((state) => state.fields)
  const activeFieldId = useFieldsStore((state) => state.activeFieldId)

  // react-leaflet compares positions by reference, so build them once
  const positionsById = useMemo(
    () => new Map(fields.map((field) => [field.id, polygonToLatLngs(field.geometry)])),
    [fields],
  )

  return fields.map((field) => {
    const isActive = field.id === activeFieldId
    return (
      <Polygon
        key={field.id}
        positions={positionsById.get(field.id) ?? []}
        pathOptions={isActive ? ACTIVE_FIELD_STYLE : FIELD_STYLE}
      >
        {/* The active field is described by ActiveFieldCard; a tooltip would cover the point form */}
        {!isActive && (
          <Tooltip sticky>
            {field.name} · {formatArea(field.areaHa)}
          </Tooltip>
        )}
      </Polygon>
    )
  })
}
