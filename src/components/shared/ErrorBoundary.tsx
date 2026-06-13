import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="font-display text-neon-pink text-3xl mb-2">Something went wrong</h2>
          <p className="text-text-muted font-body mb-6">{this.state.error.message}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
