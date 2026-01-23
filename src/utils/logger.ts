/**
 * Logger Utility for Genius App
 * Provides structured logging with levels and persistence
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
  source?: string
}

const LOG_STORAGE_KEY = 'genius_logs'
const MAX_STORED_LOGS = 100
const IS_DEV = import.meta.env.DEV

// Log levels priority
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

// Minimum level to display/store
const MIN_CONSOLE_LEVEL: LogLevel = IS_DEV ? 'debug' : 'warn'
const MIN_STORE_LEVEL: LogLevel = 'warn'

// Color codes for console
const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#888888',
  info: '#4FC3F7',
  warn: '#FFB74D',
  error: '#EF5350'
}

class Logger {
  private source: string

  constructor(source: string = 'App') {
    this.source = source
  }

  private shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[minLevel]
  }

  private formatMessage(level: LogLevel, message: string): string {
    return `[${this.source}] ${message}`
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source: this.source
    }

    // Console output
    if (this.shouldLog(level, MIN_CONSOLE_LEVEL)) {
      const formattedMsg = this.formatMessage(level, message)
      const style = `color: ${LOG_COLORS[level]}; font-weight: bold;`

      switch (level) {
        case 'debug':
          console.debug(`%c[DEBUG]`, style, formattedMsg, data ?? '')
          break
        case 'info':
          console.info(`%c[INFO]`, style, formattedMsg, data ?? '')
          break
        case 'warn':
          console.warn(`%c[WARN]`, style, formattedMsg, data ?? '')
          break
        case 'error':
          console.error(`%c[ERROR]`, style, formattedMsg, data ?? '')
          break
      }
    }

    // Persist to storage
    if (this.shouldLog(level, MIN_STORE_LEVEL)) {
      this.persistLog(entry)
    }
  }

  private persistLog(entry: LogEntry) {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY)
      const logs: LogEntry[] = stored ? JSON.parse(stored) : []
      logs.push(entry)

      // Keep only recent logs
      const trimmed = logs.slice(-MAX_STORED_LOGS)
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(trimmed))
    } catch (e) {
      // Silently fail - don't create infinite loop
    }
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data)
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  error(message: string, data?: unknown) {
    this.log('error', message, data)
  }

  // Create child logger with different source
  child(source: string): Logger {
    return new Logger(`${this.source}:${source}`)
  }
}

// Get stored logs
export function getStoredLogs(): LogEntry[] {
  try {
    const stored = localStorage.getItem(LOG_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Clear stored logs
export function clearStoredLogs(): void {
  localStorage.removeItem(LOG_STORAGE_KEY)
}

// Export logs as JSON file
export function exportLogs(): void {
  const logs = getStoredLogs()
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `genius-logs-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Create logger instances for different modules
export const logger = new Logger('Genius')
export const llmLogger = new Logger('LLM')
export const storageLogger = new Logger('Storage')
export const apiLogger = new Logger('API')
export const uiLogger = new Logger('UI')

// Default export
export default logger
