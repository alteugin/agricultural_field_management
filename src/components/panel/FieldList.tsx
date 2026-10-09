import { useMemo } from 'react'
import { formatArea } from '../../lib/format'
import { useFieldsStore } from '../../store/useFieldsStore'
import { usePointsStore } from '../../store/usePointsStore'

export function FieldList() {
  const fields = useFieldsStore((state) => state.fields)
  const loadErrors = useFieldsStore((state) => state.loadErrors)
  const activeFieldId = useFieldsStore((state) => state.activeFieldId)
  const setActiveField = useFieldsStore((state) => state.setActiveField)
  const points = usePointsStore((state) => state.points)

  const pointCountByField = useMemo(() => {
    const counts = new Map<string, number>()
    for (const point of points) counts.set(point.fieldId, (counts.get(point.fieldId) ?? 0) + 1)
    return counts
  }, [points])

  return (
    <section aria-labelledby="fields-heading" className="px-5 py-4">
      <h2 id="fields-heading" className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        Поля
      </h2>

      {loadErrors.length > 0 && (
        <div role="alert" className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Частину полів не вдалося завантажити ({loadErrors.length}). Деталі в консолі.
        </div>
      )}

      {fields.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Немає полів для відображення.</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {fields.map((field) => {
            const isActive = field.id === activeFieldId
            const pointCount = pointCountByField.get(field.id) ?? 0
            return (
              <li key={field.id}>
                <button
                  type="button"
                  onClick={() => setActiveField(field.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    isActive
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">{field.name}</span>
                    {pointCount > 0 && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {pointCount}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {field.crop} · {formatArea(field.areaHa)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
