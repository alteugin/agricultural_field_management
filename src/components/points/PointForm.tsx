import { useId, useState, type FormEvent } from 'react'
import { isPointType } from '../../lib/points'
import { POINT_TYPE_LABELS, POINT_TYPES, type PointType } from '../../types/point'
import { Coordinates } from './Coordinates'

export const DESCRIPTION_MAX_LENGTH = 500

export interface PointFormValues {
  type: PointType
  description: string
}

interface PointFormProps {
  lat: number
  lng: number
  fieldName: string
  onSubmit: (values: PointFormValues) => void
  onCancel: () => void
}

export function PointForm({ lat, lng, fieldName, onSubmit, onCancel }: PointFormProps) {
  const [type, setType] = useState<PointType | ''>('')
  const [description, setDescription] = useState('')
  const [showTypeError, setShowTypeError] = useState(false)
  const id = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (type === '') {
      setShowTypeError(true)
      return
    }
    onSubmit({ type, description })
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel()
      }}
      noValidate
      className="w-64 space-y-3"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">Нова точка</p>
        <p className="text-xs text-slate-500">{fieldName}</p>
      </div>

      <Coordinates lat={lat} lng={lng} />

      <div>
        <label htmlFor={`${id}-type`} className="mb-1 block text-xs font-medium text-slate-700">
          Тип точки
        </label>
        <select
          id={`${id}-type`}
          value={type}
          onChange={(event) => {
            const value = event.target.value
            setType(isPointType(value) ? value : '')
            setShowTypeError(false)
          }}
          aria-invalid={showTypeError}
          aria-describedby={showTypeError ? `${id}-type-error` : undefined}
          className={`w-full rounded-md border bg-white px-2 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none ${
            showTypeError ? 'border-red-500' : 'border-slate-300'
          }`}
        >
          <option value="" disabled>
            Оберіть тип…
          </option>
          {POINT_TYPES.map((pointType) => (
            <option key={pointType} value={pointType}>
              {POINT_TYPE_LABELS[pointType]}
            </option>
          ))}
        </select>
        {showTypeError && (
          <p id={`${id}-type-error`} className="mt-1 text-xs text-red-600">
            Оберіть тип точки
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-description`} className="mb-1 block text-xs font-medium text-slate-700">
          Опис <span className="font-normal text-slate-400">(необов'язково)</span>
        </label>
        <textarea
          id={`${id}-description`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={DESCRIPTION_MAX_LENGTH}
          rows={3}
          className="w-full resize-none rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Зберегти
        </button>
      </div>
    </form>
  )
}
