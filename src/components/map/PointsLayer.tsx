import { Marker, Popup } from 'react-leaflet'
import { formatDateTime } from '../../lib/format'
import { deletePointWithUndo } from '../../store/pointActions'
import { usePointsStore } from '../../store/usePointsStore'
import { POINT_TYPE_LABELS } from '../../types/point'
import { Coordinates } from '../points/Coordinates'
import { PointTypeIcon } from '../points/PointTypeIcon'
import { getPointIcon } from './pointIcon'

export function PointsLayer() {
  const points = usePointsStore((state) => state.points)

  return points.map((point) => (
    <Marker
      key={point.id}
      position={[point.lat, point.lng]}
      icon={getPointIcon(point.type)}
      title={POINT_TYPE_LABELS[point.type]}
    >
      <Popup>
        <div className="w-60 space-y-2">
          <div className="flex items-center gap-2">
            <PointTypeIcon type={point.type} size={22} />
            <p className="text-sm font-semibold text-slate-900">{POINT_TYPE_LABELS[point.type]}</p>
          </div>
          {point.description && <p className="text-sm whitespace-pre-wrap text-slate-700">{point.description}</p>}
          <Coordinates lat={point.lat} lng={point.lng} />
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-xs text-slate-500">Створено {formatDateTime(point.createdAt)}</p>
            <button
              type="button"
              onClick={() => deletePointWithUndo(point.id)}
              className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Видалити
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  ))
}
