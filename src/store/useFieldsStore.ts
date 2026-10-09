import { create } from 'zustand'
import fieldsData from '../data/fields.json'
import { parseFields } from '../lib/fields'
import type { Field } from '../types/field'

// Fields are static mock data, so they're parsed once at module load
const { fields, errors } = parseFields(fieldsData)
if (errors.length > 0) console.warn('Some fields were skipped:', errors)

interface FieldsState {
  fields: Field[]
  /** Validation errors from the source GeoJSON, shown in the UI. */
  loadErrors: string[]
  activeFieldId: string | null
  setActiveField: (id: string) => void
}

export const useFieldsStore = create<FieldsState>()((set, get) => ({
  fields,
  loadErrors: errors,
  activeFieldId: fields[0]?.id ?? null,
  setActiveField: (id) => {
    if (get().fields.some((field) => field.id === id)) set({ activeFieldId: id })
  },
}))

export const useActiveField = (): Field | undefined =>
  useFieldsStore((state) => state.fields.find((field) => field.id === state.activeFieldId))
