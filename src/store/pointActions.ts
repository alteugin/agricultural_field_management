import { usePointsStore } from './usePointsStore'
import { notify } from './useToastStore'

/** Shared by the map popup and the points list, so both offer the same undo. */
export function deletePointWithUndo(id: string): void {
  const { removePoint, restorePoint } = usePointsStore.getState()
  const removed = removePoint(id)
  if (!removed) return

  notify('Точку видалено', 'info', {
    label: 'Повернути',
    onClick: () => restorePoint(removed),
  })
}
