import { create } from 'zustand'
import { createId } from '../lib/id'

export type ToastKind = 'info' | 'error'

export interface Toast {
  id: string
  kind: ToastKind
  message: string
}

interface ToastState {
  toasts: Toast[]
  notify: (message: string, kind?: ToastKind) => void
  dismiss: (id: string) => void
}

const AUTO_DISMISS_MS = 4000

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  notify: (message, kind = 'info') => {
    // Repeated clicks outside a field shouldn't stack identical toasts
    if (get().toasts.some((toast) => toast.message === message)) return

    const id = createId()
    set((state) => ({ toasts: [...state.toasts, { id, kind, message }] }))
    setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))

/** For non-React code (store middleware, storage adapters). */
export const notify = (message: string, kind?: ToastKind) => useToastStore.getState().notify(message, kind)
