import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/components/atoms/Icon'

// Toast Types
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, duration?: number) => void
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// Toast Provider
interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: Toast = { id, type, message, duration }
    setToasts((prev) => [...prev, toast])
  }, [])

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast('success', message, duration)
    },
    [addToast]
  )
  const error = useCallback(
    (message: string, duration?: number) => {
      addToast('error', message, duration)
    },
    [addToast]
  )
  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast('warning', message, duration)
    },
    [addToast]
  )
  const info = useCallback(
    (message: string, duration?: number) => {
      addToast('info', message, duration)
    },
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => {
            removeToast(toast.id)
          }}
        />
      ))}
    </div>,
    document.body
  )
}

// Single Toast Item
interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

const toastConfig: Record<ToastType, { icon: IconName; bg: string; border: string }> = {
  success: { icon: 'CircleCheck', bg: 'bg-success/20', border: 'border-success/30' },
  error: { icon: 'CircleX', bg: 'bg-error/20', border: 'border-error/30' },
  warning: { icon: 'TriangleAlert', bg: 'bg-warning/20', border: 'border-warning/30' },
  info: { icon: 'Info', bg: 'bg-primary/20', border: 'border-primary/30' },
}

const toastTextColor: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-primary',
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const config = toastConfig[toast.type]

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(onClose, toast.duration)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [toast.duration, onClose])

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
        'pointer-events-auto shadow-elevated',
        config.bg,
        config.border
      )}
      role="alert"
    >
      <Icon name={config.icon} className={cn('size-5 flex-shrink-0', toastTextColor[toast.type])} />
      <p className="text-sm text-text-primary">{toast.message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg hover:bg-surface-overlay transition-colors"
        aria-label="Fermer"
      >
        <Icon name="X" className="size-4 text-text-muted" />
      </button>
    </div>
  )
}
