import { formatDateTime } from '../../lib/format'
import { deletePointWithUndo } from '../../store/pointActions'
import { POINT_TYPE_LABELS, type MonitoringPoint } from '../../types/point'
import { PointTypeIcon } from '../points/PointTypeIcon'

interface PointsListItemProps {
  point: MonitoringPoint
  /** Shown only when the list mixes points from several fields. */
  fieldName?: string
}

export function PointsListItem({ point, fieldName }: PointsListItemProps) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <PointTypeIcon type={point.type} size={24} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{POINT_TYPE_LABELS[point.type]}</p>
        {point.description ? (
          <p className="mt-0.5 line-clamp-2 text-sm break-words text-slate-600">{point.description}</p>
        ) : (
          <p className="mt-0.5 text-sm text-slate-400 italic">Без опису</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          {fieldName && <>{fieldName} · </>}
          <time dateTime={point.createdAt}>{formatDateTime(point.createdAt)}</time>
        </p>
      </div>
      <button
        type="button"
        onClick={() => deletePointWithUndo(point.id)}
        aria-label={`Видалити точку «${POINT_TYPE_LABELS[point.type]}»`}
        title="Видалити"
        className="-mr-1 shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </li>
  )
}
