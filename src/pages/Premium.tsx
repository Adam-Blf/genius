/**
 * Page Premium · pitch + bouton Stripe Checkout.
 *
 * Flow : click → POST /api/checkout → redirect vers Stripe hosted page.
 * Au retour : /premium/success lit `?session_id=` et appelle /api/verify pour
 * activer le cache `premiumUntil` localement.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Crown, Check, ArrowLeft, Zap, Infinity as InfinityIcon, Heart, Sparkles, Shield } from 'lucide-react'
import { isPremium, premiumUntil, startCheckout } from '../lib/premium'

const BENEFITS = [
  { icon: InfinityIcon, title: 'Cœurs illimités', desc: "Apprends sans pause, les 5 cœurs ne bloquent plus ta progression." },
  { icon: Zap, title: 'Tous les chapitres', desc: "Accès aux 2868 chapitres premium · culture G, sciences, sports, arts." },
  { icon: Sparkles, title: 'Mode hors-ligne total', desc: "Toutes les cartes pré-téléchargées pour le métro/avion." },
  { icon: Shield, title: 'Sans pub · jamais', desc: "Un environnement épuré, centré sur l'apprentissage." },
  { icon: Heart, title: 'Soutiens le projet', desc: "Un dev indé, pas d'ads, pas de tracking · ton abo paye les serveurs." },
]

export function PremiumPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [err, setErr] = useState<string | null>(null)
  const [params] = useSearchParams()
  const canceled = params.get('canceled')
  const active = isPremium()

  const onSubscribe = async () => {
    setErr(null)
    setLoading(true)
    try {
      const url = await startCheckout(plan)
      window.location.assign(url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'error')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-10 safe-t">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white mb-6">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Retour</span>
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sun to-elephant-300 mb-4 shadow-xl">
          <Crown className="w-10 h-10 text-ink" />
        </div>
        <h1 className="font-display text-4xl">Genius Premium</h1>
        <p className="text-white/60 mt-2">Débloque toute la plateforme.</p>
      </div>

      {active ? (
        <div className="bg-leaf/10 border border-leaf/40 rounded-2xl p-5 mb-6 text-center">
          <Check className="w-6 h-6 text-leaf mx-auto mb-2" />
          <p className="text-leaf font-semibold">Premium actif</p>
          <p className="text-xs text-white/60 mt-1">
            Jusqu'au {new Date(premiumUntil()).toLocaleDateString('fr-FR')}
          </p>
        </div>
      ) : canceled ? (
        <div className="bg-sun/10 border border-sun/40 rounded-2xl p-4 mb-6 text-center text-sm">
          Paiement annulé · tu peux réessayer quand tu veux.
        </div>
      ) : null}

      <div className="space-y-3 mb-8">
        {BENEFITS.map((b) => (
          <div key={b.title} className="bg-surface border border-line rounded-2xl p-4 flex gap-3">
            <b.icon className="w-5 h-5 text-elephant-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">{b.title}</div>
              <div className="text-xs text-white/60 mt-0.5">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {!active && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setPlan('monthly')}
              className={`rounded-2xl p-4 border transition text-left ${plan === 'monthly' ? 'border-sun bg-sun/10' : 'border-line bg-surface'}`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Mensuel</div>
              <div className="font-display text-2xl mt-1">4,99 €<span className="text-xs text-white/50"> /mois</span></div>
            </button>
            <button
              onClick={() => setPlan('yearly')}
              className={`relative rounded-2xl p-4 border transition text-left ${plan === 'yearly' ? 'border-sun bg-sun/10' : 'border-line bg-surface'}`}
            >
              <div className="absolute -top-2 right-3 text-[10px] font-mono bg-leaf text-ink px-2 py-0.5 rounded">-33%</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Annuel</div>
              <div className="font-display text-2xl mt-1">39,90 €<span className="text-xs text-white/50"> /an</span></div>
              <div className="text-[10px] text-white/50 mt-0.5">≈ 3,32 €/mois</div>
            </button>
          </div>
          <p className="text-xs text-white/50 text-center mb-4">Annulable à tout moment · essai 7 jours</p>
          <button
            onClick={onSubscribe}
            disabled={loading}
            className="btn-chunky block w-full text-center disabled:opacity-60"
            data-variant="sun"
          >
            <span className="inline-flex items-center gap-2">
              <Crown className="w-4 h-4" />
              {loading ? 'Redirection…' : 'Devenir Premium'}
            </span>
          </button>
          {err ? <p className="text-red-400 text-xs text-center mt-3">{err}</p> : null}
          <p className="text-[10px] text-white/40 text-center mt-3 leading-relaxed">
            Paiement sécurisé par Stripe · aucune donnée bancaire ne transite par Genius.
            En souscrivant tu acceptes les <a href="/tos" className="underline">CGU</a> et la{' '}
            <a href="/privacy" className="underline">politique de confidentialité</a>.
          </p>
        </>
      )}
    </div>
  )
}
