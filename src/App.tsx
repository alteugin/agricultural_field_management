import { MapView } from './components/map/MapView'
import { FieldList } from './components/panel/FieldList'
import { PointsPanel } from './components/panel/PointsPanel'
import { Toaster } from './components/Toaster'

function App() {
  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900 md:flex-row">
      <aside className="flex max-h-[45%] shrink-0 flex-col border-b border-slate-200 bg-white md:max-h-none md:w-80 md:border-r md:border-b-0 lg:w-96">
        <header className="border-b border-slate-200 px-5 py-4">
          <h1 className="text-base font-semibold">Моніторинг полів</h1>
          <p className="mt-0.5 text-xs text-slate-500">Оберіть поле в списку або на карті</p>
        </header>
        <div className="flex-1 overflow-y-auto">
          <FieldList />
          <PointsPanel />
        </div>
      </aside>
      <main className="relative min-h-0 flex-1">
        <MapView />
      </main>
      <Toaster />
    </div>
  )
}

export default App
