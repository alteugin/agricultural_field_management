import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** Rendered instead of children after a render error; `reset` re-mounts the children. */
  fallback: (reset: () => void) => ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// React still has no hook equivalent of componentDidCatch, so this stays a class
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error caught by ErrorBoundary', error, info.componentStack)
  }

  reset = () => this.setState({ hasError: false })

  render() {
    return this.state.hasError ? this.props.fallback(this.reset) : this.props.children
  }
}
