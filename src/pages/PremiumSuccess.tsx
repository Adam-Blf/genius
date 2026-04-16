import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Crown, Check } from 'lucide-react'
import { verifySession } from '../lib/premium'

export function PremiumSuccessPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'ok' | 'fail'>('loading')
  const [until, setUntil] = useState<number | null>(null)

  useEffect(() => {
    const sid = params.get('session_id')
    if (!sid) { setState('fail'); return }
    verifySession(sid).then((u) => {
      if (u) { setUntil(u); setState('ok') } else setState('fail')
    }).catch(() => setState('fail'))
  }, [params])

  return (
    <div className="max-w-lg mx-auto px-5 pt-20 text-center safe-t">
      {state === 'loading' && <div className="text-white/60">Vérification du paiement…</div>}
      {state === 'ok' && (
        <>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-sun to-elephant-300 mb-6 shadow-xl">
            <Check className="w-12 h-12 text-ink" strokeWidth={3} />
          </div>
          <h1 className="font-display text-4xl">Bienvenue · Premium</h1>
          <p className="text-white/70 mt-3">Tu as accès à tout jusqu'au {until ? new Date(until).toLocaleDateString('fr-FR') : '—'}.</p>
          <button onClick={() => navigate('/')} className="btn-chunky mt-8" data-variant="elephant">
            <span className="inline-flex items-center gap-2"><Crown className="w-4 h-4" />Commencer</span>
          </button>
        </>
      )}
      {state === 'fail' && (
        <>
          <h1 className="font-display text-3xl">Vérification impossible</h1>
          <p className="text-white/60 mt-3">Si tu as bien payé, contacte-nous et l'accès sera activé.</p>
          <button onClick={() => navigate('/premium')} className="btn-chunky mt-6" data-variant="elephant">Réessayer</button>
        </>
      )}
    </div>
  )
}
