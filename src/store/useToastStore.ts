import { create } from 'zustand'
import { createId } from '../lib/id'

export type ToastKind = 'info' | 'error'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  kind: ToastKind
  message: string
  action?: ToastAction
}

interface ToastState {
  toasts: Toast[]
  notify: (message: string, kind?: ToastKind, action?: ToastAction) => void
  dismiss: (id: string) => void
}

const AUTO_DISMISS_MS = 4000
// Give people a bit longer to reach an undo button
const AUTO_DISMISS_WITH_ACTION_MS = 6000

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  notify: (message, kind = 'info', action) => {
    // Repeated clicks outside a field shouldn't stack identical toasts.
    // Toasts with an action are never merged: each undo refers to a different point.
    if (!action && get().toasts.some((toast) => !toast.action && toast.message === message)) return

    const id = createId()
    set((state) => ({ toasts: [...state.toasts, { id, kind, message, action }] }))
    setTimeout(() => get().dismiss(id), action ? AUTO_DISMISS_WITH_ACTION_MS : AUTO_DISMISS_MS)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

/** For non-React code (store middleware, storage adapters). */
export const notify = (message: string, kind?: ToastKind, action?: ToastAction) =>
  useToastStore.getState().notify(message, kind, action)
