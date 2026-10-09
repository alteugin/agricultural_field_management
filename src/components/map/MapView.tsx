import { useMemo } from 'react'
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import { latLngBounds, svg } from 'leaflet'
import { polygonToLatLngs } from '../../lib/geo'
import { useFieldsStore } from '../../store/useFieldsStore'
import { notify } from '../../store/useToastStore'
import { ActiveFieldCard } from './ActiveFieldCard'
import { FieldsLayer } from './FieldsLayer'
import { FlyToActiveField } from './FlyToActiveField'
import { MapClickHandler } from './MapClickHandler'
import { PointsLayer } from './PointsLayer'

// Fallback view when there are no valid fields to frame
const DEFAULT_CENTER: [number, number] = [49.625, 30.273]
const DEFAULT_ZOOM = 13

// Offline or blocked tile server: fields and points still work, but say why the map is blank.
// notify() drops identical messages that are already on screen, so a burst of failed tiles shows one toast.
const TILE_EVENTS = {
  tileerror: () => notify('Не вдалося завантажити підкладку карти. Перевірте з’єднання з інтернетом.', 'error'),
}

export function MapView() {
  const fields = useFieldsStore((state) => state.fields)

  // Only used for the initial view; MapContainer props are immutable after mount
  const initialBounds = useMemo(
    () => (fields.length > 0 ? latLngBounds(fields.flatMap((f) => polygonToLatLngs(f.geometry).flat())) : undefined),
    [fields],
  )

  // The SVG renderer clips paths to the viewport + padding and only redraws on moveend.
  // With the default 0.1, large fields show cut-off edges while dragging at high zoom.
  const renderer = useMemo(() => svg({ padding: 1 }), [])

  return (
    <div className="relative h-full w-full">
      <MapContainer
        className="h-full w-full"
        bounds={initialBounds}
        center={initialBounds ? undefined : DEFAULT_CENTER}
        zoom={initialBounds ? undefined : DEFAULT_ZOOM}
        zoomControl={false}
        renderer={renderer}
        // Leaflet would close the draft popup on preclick, before our click handler runs,
        // leaving React state and the map out of sync. MapClickHandler closes popups itself.
        closePopupOnClick={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          eventHandlers={TILE_EVENTS}
        />
        <ZoomControl position="topright" />
        <FieldsLayer />
        <PointsLayer />
        <FlyToActiveField />
        <MapClickHandler />
      </MapContainer>
      <ActiveFieldCard />
    </div>
  )
}
