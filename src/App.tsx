import { useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ErrorFallback } from './components/ErrorFallback'
import { MapView } from './components/map/MapView'
import { FieldList } from './components/panel/FieldList'
import { PointsPanel } from './components/panel/PointsPanel'
import { Toaster } from './components/Toaster'
import { DESKTOP_QUERY, useMediaQuery } from './hooks/useMediaQuery'

function App() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  // On desktop the panel is a static sidebar, the drawer state doesn't apply
  const isDrawer = !isDesktop
  const isPanelVisible = isDesktop || isDrawerOpen

  const openButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const wasDrawerOpen = useRef(false)

  const closeDrawer = () => setDrawerOpen(false)

  // Move focus into the drawer when it opens and back to the toggle when it closes,
  // so keyboard users don't end up on elements hidden behind it
  useEffect(() => {
    if (!isDrawer) return
    if (isDrawerOpen) {
      wasDrawerOpen.current = true
      closeButtonRef.current?.focus()
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setDrawerOpen(false)
      }
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }
    if (wasDrawerOpen.current) {
      wasDrawerOpen.current = false
      openButtonRef.current?.focus()
    }
  }, [isDrawer, isDrawerOpen])

  return (
    <div className="flex h-full bg-slate-50 text-slate-900">
      {isDrawer && isDrawerOpen && (
        <div aria-hidden="true" onClick={closeDrawer} className="fixed inset-0 z-[1040] bg-slate-900/30" />
      )}

      {/* z-index above Leaflet controls (1000) so the drawer covers the map */}
      <aside
        id="side-panel"
        aria-label="Поля та точки"
        inert={!isPanelVisible}
        className={`fixed inset-y-0 left-0 z-[1050] flex w-[min(24rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:w-96 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          isPanelVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h1 className="text-base font-semibold">Моніторинг полів</h1>
            <p className="mt-0.5 text-xs text-slate-500">Оберіть поле в списку або на карті</p>
          </div>
          {isDrawer && (
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Закрити панель"
              className="-mr-2 rounded-md p-2 text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </header>
        <div className="flex-1 overflow-y-auto">
          <FieldList onSelect={isDrawer ? closeDrawer : undefined} />
          <PointsPanel />
        </div>
      </aside>

      <main className="relative min-w-0 flex-1">
        {/* A map crash shouldn't take the field and point lists down with it */}
        <ErrorBoundary
          fallback={(reset) => (
            <ErrorFallback
              title="Не вдалося відобразити карту"
              description="Список полів і точок працює далі. Спробуйте показати карту ще раз."
              actionLabel="Спробувати ще раз"
              onAction={reset}
            />
          )}
        >
          <MapView />
        </ErrorBoundary>
        {isDrawer && (
          <button
            ref={openButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-controls="side-panel"
            aria-expanded={isDrawerOpen}
            className="absolute bottom-6 left-3 z-[1000] flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Поля та точки
          </button>
        )}
      </main>
      <Toaster />
    </div>
  )
}

export default App
