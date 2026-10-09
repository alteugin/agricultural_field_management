import { useId } from 'react'
import { isPointType, type SortOrder } from '../../lib/points'
import { POINT_TYPE_LABELS, POINT_TYPES, type PointType } from '../../types/point'

export type PointsScope = 'active' | 'all'

export interface PointsFiltersValue {
  scope: PointsScope
  type: PointType | 'all'
  search: string
  sort: SortOrder
}

interface PointsFiltersProps {
  value: PointsFiltersValue
  onChange: (value: PointsFiltersValue) => void
}

const SCOPE_OPTIONS: { value: PointsScope; label: string }[] = [
  { value: 'active', label: 'Активне поле' },
  { value: 'all', label: 'Усі поля' },
]

const controlClass =
  'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none'

export function PointsFilters({ value, onChange }: PointsFiltersProps) {
  const id = useId()
  const update = (patch: Partial<PointsFiltersValue>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-2">
      <div role="group" aria-label="Які точки показувати" className="grid grid-cols-2 rounded-md bg-slate-100 p-0.5">
        {SCOPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value.scope === option.value}
            onClick={() => update({ scope: option.value })}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              value.scope === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label htmlFor={`${id}-search`} className="sr-only">
        Пошук за описом
      </label>
      <input
        id={`${id}-search`}
        type="search"
        value={value.search}
        onChange={(event) => update({ search: event.target.value })}
        placeholder="Пошук за описом…"
        className={controlClass}
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${id}-type`} className="sr-only">
            Тип точки
          </label>
          <select
            id={`${id}-type`}
            value={value.type}
            onChange={(event) => {
              const next = event.target.value
              update({ type: isPointType(next) ? next : 'all' })
            }}
            className={controlClass}
          >
            <option value="all">Усі типи</option>
            {POINT_TYPES.map((type) => (
              <option key={type} value={type}>
                {POINT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-sort`} className="sr-only">
            Сортування за датою
          </label>
          <select
            id={`${id}-sort`}
            value={value.sort}
            onChange={(event) => update({ sort: event.target.value === 'oldest' ? 'oldest' : 'newest' })}
            className={controlClass}
          >
            <option value="newest">Спочатку нові</option>
            <option value="oldest">Спочатку старі</option>
          </select>
        </div>
      </div>
    </div>
  )
}
