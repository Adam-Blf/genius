import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (!offline) return null
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-sun text-ink font-semibold text-sm py-2 px-4 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      Hors ligne · l'app continue de fonctionner
    </div>
  )
}
