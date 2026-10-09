import { formatArea } from '../../lib/format'
import { useActiveField } from '../../store/useFieldsStore'

export function ActiveFieldCard() {
  const field = useActiveField()
  if (!field) return null

  return (
    <div className="pointer-events-none absolute top-3 left-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Активне поле</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{field.name}</p>
      <p className="mt-1 text-xs text-slate-600">
        {field.crop} · {formatArea(field.areaHa)}
      </p>
      <p className="mt-2 text-xs text-slate-500">Клікніть у межах поля, щоб додати точку</p>
    </div>
  )
}
