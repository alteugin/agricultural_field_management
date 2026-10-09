import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { ErrorFallback } from './components/ErrorFallback.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary
      fallback={() => (
        <ErrorFallback
          title="Щось пішло не так"
          description="Застосунок зіткнувся з неочікуваною помилкою. Збережені точки не втрачено."
          actionLabel="Перезавантажити сторінку"
          onAction={() => window.location.reload()}
        />
      )}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
