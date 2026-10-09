import { useMemo, useState } from 'react'
import { queryPoints } from '../../lib/points'
import { useFieldsStore } from '../../store/useFieldsStore'
import { usePointsStore } from '../../store/usePointsStore'
import { PointsFilters, type PointsFiltersValue } from './PointsFilters'
import { PointsListItem } from './PointsListItem'

const DEFAULT_FILTERS: PointsFiltersValue = { scope: 'active', type: 'all', search: '', sort: 'newest' }

export function PointsPanel() {
  const points = usePointsStore((state) => state.points)
  const fields = useFieldsStore((state) => state.fields)
  const activeFieldId = useFieldsStore((state) => state.activeFieldId)
  // Filters are local UI state of this panel; nothing else in the app reads them
  const [filters, setFilters] = useState<PointsFiltersValue>(DEFAULT_FILTERS)

  const fieldNameById = useMemo(() => new Map(fields.map((field) => [field.id, field.name])), [fields])

  const scopedFieldId = filters.scope === 'active' ? activeFieldId : null
  const visiblePoints = useMemo(
    () => queryPoints(points, { fieldId: scopedFieldId, type: filters.type, search: filters.search, sort: filters.sort }),
    [points, scopedFieldId, filters.type, filters.search, filters.sort],
  )
  const scopeTotal = scopedFieldId === null ? points.length : points.filter((p) => p.fieldId === scopedFieldId).length
  const isFiltered = filters.type !== 'all' || filters.search.trim() !== ''

  return (
    <section aria-labelledby="points-heading" className="border-t border-slate-200 px-5 py-4">
      <div className="flex items-baseline justify-between">
        <h2 id="points-heading" className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          Точки
        </h2>
        <p className="text-xs text-slate-500" aria-live="polite">
          {isFiltered ? `${visiblePoints.length} з ${scopeTotal}` : scopeTotal}
        </p>
      </div>

      <div className="mt-3">
        <PointsFilters value={filters} onChange={setFilters} />
      </div>

      {visiblePoints.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {visiblePoints.map((point) => (
            <PointsListItem
              key={point.id}
              point={point}
              fieldName={filters.scope === 'all' ? fieldNameById.get(point.fieldId) : undefined}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center">
          {scopeTotal === 0 ? (
            <p className="text-sm text-slate-500">
              {filters.scope === 'active' ? 'На цьому полі ще немає точок.' : 'Ще немає жодної точки.'}
              <br />
              Клікніть у межах активного поля на карті.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-500">Нічого не знайдено за цими фільтрами.</p>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, type: 'all', search: '' })}
                className="mt-2 text-sm font-medium text-amber-700 hover:underline"
              >
                Скинути фільтри
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
