import { useMemo, useRef, useState } from 'react'
import { CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import { DomEvent, type Popup as LeafletPopup } from 'leaflet'
import { isPointInPolygon, roundCoordinate, type LatLng, type LatLngTuple } from '../../lib/geo'
import { useActiveField, useFieldsStore } from '../../store/useFieldsStore'
import { usePointsStore } from '../../store/usePointsStore'
import { notify } from '../../store/useToastStore'
import { PointForm, type PointFormValues } from '../points/PointForm'

interface DraftPoint extends LatLng {
  fieldId: string
}

const DRAFT_MARKER_STYLE = { color: '#ffffff', weight: 2, fillColor: '#0f172a', fillOpacity: 1 }

/**
 * Single entry point for map clicks. Field polygons let clicks bubble up,
 * and the hit field is resolved here geometrically:
 * - inside the active field -> start a new point there
 * - inside another field -> make it active
 * - outside every field -> explain why nothing happened
 */
export function MapClickHandler() {
  const fields = useFieldsStore((state) => state.fields)
  const setActiveField = useFieldsStore((state) => state.setActiveField)
  const activeField = useActiveField()
  const addPoint = usePointsStore((state) => state.addPoint)
  const [draft, setDraft] = useState<DraftPoint | null>(null)
  const draftPopupRef = useRef<LeafletPopup>(null)

  // react-leaflet re-opens a Popup whenever `position` changes by reference
  const draftPosition = useMemo<LatLngTuple | null>(() => (draft ? [draft.lat, draft.lng] : null), [draft])

  const map = useMapEvents({
    click: ({ latlng }) => {
      if (activeField && isPointInPolygon(latlng, activeField.geometry)) {
        setDraft({ lat: roundCoordinate(latlng.lat), lng: roundCoordinate(latlng.lng), fieldId: activeField.id })
        return
      }

      // closePopupOnClick is off on the map (see MapView), so close point popups here
      map.closePopup()
      setDraft(null)
      const hitField = fields.find((field) => isPointInPolygon(latlng, field.geometry))
      if (hitField) {
        setActiveField(hitField.id)
      } else {
        notify('Точку можна додати лише в межах активного поля')
      }
    },
    popupopen: ({ popup }) => {
      // Leaflet ignores clicks inside popups by walking up from event.target to the popup
      // container. React handles popup content (a portal) below the map container, so a
      // button that removes itself (Cancel, Delete) is already detached when Leaflet looks,
      // and the click lands on the map. Stopping it natively at the popup works regardless,
      // because the propagation path is fixed when the event is dispatched.
      const element = popup.getElement()
      if (element) DomEvent.on(element, 'click', DomEvent.stopPropagation)

      // The draft popup doesn't auto-close (see below), so drop the draft by hand
      // when the user opens a point's details instead
      if (popup !== draftPopupRef.current) setDraft(null)
    },
  })

  // A draft belongs to the field it was started in; switching fields drops it
  if (!draft || !draftPosition || !activeField || draft.fieldId !== activeField.id) return null

  const handleSubmit = ({ type, description }: PointFormValues) => {
    addPoint({ fieldId: draft.fieldId, lat: draft.lat, lng: draft.lng, type, description })
    setDraft(null)
    notify('Точку додано')
  }

  return (
    <>
      <CircleMarker center={draftPosition} radius={7} interactive={false} pathOptions={DRAFT_MARKER_STYLE} />
      {/*
        React state is the only source of truth for the draft: Leaflet is not allowed to close
        this popup on its own (no close button, Esc, auto-close or map click), it disappears only
        when the component unmounts. Esc and Cancel are handled inside the form.
      */}
      <Popup
        ref={draftPopupRef}
        position={draftPosition}
        offset={[0, -6]}
        closeButton={false}
        closeOnEscapeKey={false}
        autoClose={false}
        closeOnClick={false}
      >
        <PointForm
          // Re-mount the form when the draft moves, so it doesn't keep the old point's input
          key={`${draft.lat},${draft.lng}`}
          lat={draft.lat}
          lng={draft.lng}
          fieldName={activeField.name}
          onSubmit={handleSubmit}
          onCancel={() => setDraft(null)}
        />
      </Popup>
    </>
  )
}
