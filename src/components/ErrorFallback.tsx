interface ErrorFallbackProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

export function ErrorFallback({ title, description, actionLabel, onAction }: ErrorFallbackProps) {
  return (
    <div role="alert" className="flex h-full items-center justify-center bg-slate-50 p-6">
      <div className="max-w-sm text-center">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}
