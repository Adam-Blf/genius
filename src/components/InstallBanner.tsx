import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const [evt, setEvt] = useState<BIPEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setEvt(e as BIPEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    setDismissed(localStorage.getItem('genius-install-dismissed') === '1')
  }, [])

  if (!evt || dismissed) return null

  const install = async () => {
    await evt.prompt()
    const r = await evt.userChoice
    if (r.outcome) setEvt(null)
  }
  const dismiss = () => {
    localStorage.setItem('genius-install-dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="fixed top-4 inset-x-4 max-w-lg mx-auto z-50 bg-elephant-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-pop">
      <Download className="w-5 h-5" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">Installer Genius</div>
        <div className="text-xs opacity-80">Plus rapide · fonctionne hors ligne</div>
      </div>
      <button onClick={install} className="bg-white text-elephant-700 font-bold rounded-xl px-3 py-1.5 text-sm">Installer</button>
      <button onClick={dismiss} className="p-1 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}
