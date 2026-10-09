import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { isRecord } from '../lib/guards'
import { createId } from '../lib/id'
import { sanitizePoints } from '../lib/points'
import type { MonitoringPoint } from '../types/point'
import { notify } from './useToastStore'

export type NewPoint = Omit<MonitoringPoint, 'id' | 'createdAt'>

interface PointsState {
  points: MonitoringPoint[]
  addPoint: (input: NewPoint) => MonitoringPoint
  removePoint: (id: string) => void
}

/**
 * persist doesn't catch write errors: a full or blocked localStorage would
 * make addPoint throw. Keep the in-memory state working and tell the user.
 */
const safeLocalStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch (error) {
      console.error('Failed to persist points', error)
      notify('Не вдалося зберегти точки в браузері. Зміни буде втрачено після перезавантаження.', 'error')
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
}

export const usePointsStore = create<PointsState>()(
  persist(
    (set) => ({
      points: [],
      addPoint: (input) => {
        const point: MonitoringPoint = {
          ...input,
          description: input.description.trim(),
          id: createId(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ points: [...state.points, point] }))
        return point
      },
      removePoint: (id) => set((state) => ({ points: state.points.filter((point) => point.id !== id) })),
    }),
    {
      name: 'field-monitoring:points',
      // Bump together with a `migrate` function when MonitoringPoint changes shape
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ points: state.points }),
      // Stored data is untrusted: it may be hand-edited or left by an older build
      merge: (persisted, current) => {
        const { points, dropped } = sanitizePoints(isRecord(persisted) ? persisted.points : undefined)
        if (dropped > 0) notify(`Пропущено пошкоджених точок зі сховища: ${dropped}`, 'error')
        return { ...current, points }
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Failed to restore points', error)
          notify('Не вдалося відновити збережені точки', 'error')
        }
      },
    },
  ),
)
