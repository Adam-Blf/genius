import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Icon, Button } from '@/components/atoms'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            {/* Error Icon */}
            <div className="size-20 mx-auto rounded-full bg-error/20 flex items-center justify-center mb-6">
              <Icon name="AlertTriangle" className="size-10 text-error" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Oups ! Quelque chose s'est mal passé
            </h1>
            <p className="text-text-secondary mb-6">
              Une erreur inattendue s'est produite. Pas de panique, tes données sont en sécurité !
            </p>

            {/* Error Details (collapsible in dev) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-text-muted hover:text-text-secondary">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-surface text-xs text-error overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={this.handleRetry}>
                <Icon name="RefreshCw" className="size-4 mr-2" />
                Réessayer
              </Button>
              <Button variant="secondary" onClick={this.handleGoHome}>
                <Icon name="Home" className="size-4 mr-2" />
                Accueil
              </Button>
            </div>

            {/* Help text */}
            <p className="text-xs text-text-muted mt-6">
              Si le problème persiste, essaie de rafraîchir la page ou de vider le cache du navigateur.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
