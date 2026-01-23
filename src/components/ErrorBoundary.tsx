/**
 * Error Boundary Component
 * Catches and displays errors gracefully
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })

    // Log to analytics or monitoring service
    logError(error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-genius-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Oups ! Une erreur est survenue
            </h2>

            <p className="text-gray-400 text-sm mb-4">
              Ne vous inquietez pas, vos donnees sont en securite.
              Essayez de recharger la page ou de retourner a l'accueil.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-900/30 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs text-red-300 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reessayer
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Simple error logging function
function logError(error: Error, errorInfo: ErrorInfo) {
  // In production, send to monitoring service (Sentry, LogRocket, etc.)
  const errorLog = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }

  // Store locally for debugging
  try {
    const logs = JSON.parse(localStorage.getItem('genius_error_logs') || '[]')
    logs.push(errorLog)
    // Keep only last 10 errors
    localStorage.setItem('genius_error_logs', JSON.stringify(logs.slice(-10)))
  } catch (e) {
    console.error('Failed to store error log:', e)
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error) => {
    console.error('useErrorHandler:', error)
    // Could trigger error boundary or show toast
  }
}
