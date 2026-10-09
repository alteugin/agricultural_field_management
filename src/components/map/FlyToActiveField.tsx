import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import { polygonToLatLngs } from '../../lib/geo'
import { useActiveField } from '../../store/useFieldsStore'

export function FlyToActiveField() {
  const map = useMap()
  const activeField = useActiveField()

  useEffect(() => {
    if (!activeField) return
    const bounds = latLngBounds(polygonToLatLngs(activeField.geometry).flat())
    map.flyToBounds(bounds, { padding: [48, 48], duration: 0.6 })
  }, [map, activeField])

  return null
}
