import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Check, Users } from 'lucide-react'
import { fetchPublicCards, importPublicCardsToLocal } from '../lib/publicCards'
import { useAuth } from '../contexts/AuthContext'
import type { PublicCard } from '../lib/supabase'

export function CommunityPage() {
  const navigate = useNavigate()
  const { available } = useAuth()
  const [cards, setCards] = useState<PublicCard[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)

  useEffect(() => {
    if (!available) return
    fetchPublicCards(50).then(setCards)
  }, [available])

  const doImport = async () => {
    if (!cards) return
    setImporting(true)
    await importPublicCardsToLocal(cards)
    setImporting(false)
    setImported(true)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-6 safe-t">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 mb-6">
        <ArrowLeft className="w-5 h-5" /><span className="text-sm">Retour</span>
      </button>

      <div className="mb-8">
        <Users className="w-8 h-8 text-elephant-300 mb-3" />
        <h1 className="font-display text-4xl">Communaute</h1>
        <p className="text-white/60 mt-2">Cartes publiees par d'autres utilisateurs.</p>
      </div>

      {!available && (
        <div className="bg-surface border border-line rounded-2xl p-5 text-center mb-6">
          <p className="text-sm text-white/70">Auth non configuree · branche Supabase pour voir la communaute.</p>
        </div>
      )}

      {available && cards === null && <p className="text-white/50 text-sm">Chargement...</p>}

      {available && cards && cards.length === 0 && (
        <p className="text-white/50 text-sm">Aucune carte publique pour l'instant. Sois le premier a publier.</p>
      )}

      {available && cards && cards.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {cards.length} cartes disponibles
            </div>
            <button
              onClick={doImport}
              disabled={importing || imported}
              className="btn-chunky text-sm"
              data-variant={imported ? 'ghost' : 'elephant'}
            >
              <span className="inline-flex items-center gap-2">
                {imported ? <><Check className="w-4 h-4" /> Importe</> : <><Plus className="w-4 h-4" /> {importing ? 'Import...' : 'Tout importer'}</>}
              </span>
            </button>
          </div>
          <div className="space-y-2">
            {cards.map((c) => (
              <div key={c.id} className="bg-surface border border-line rounded-2xl p-4">
                <div className="font-semibold text-sm">{c.question}</div>
                <div className="text-elephant-300 text-sm mt-1">→ {c.answer}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mt-2">
                  {c.category} · {new Date(c.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
