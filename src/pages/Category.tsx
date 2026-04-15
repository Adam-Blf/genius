import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft } from 'lucide-react'
import { db, type Category } from '../db'

const LABELS: Record<Category, { label: string; emoji: string }> = {
  histoire: { label: 'Histoire', emoji: '📜' },
  sciences: { label: 'Sciences', emoji: '🔬' },
  geo: { label: 'Geographie', emoji: '🌍' },
  arts: { label: 'Arts', emoji: '🎨' },
  sports: { label: 'Sports', emoji: '⚽' },
  divers: { label: 'Divers', emoji: '🎲' },
}

export function CategoryPage() {
  const { cat } = useParams<{ cat: Category }>()
  const navigate = useNavigate()
  const category = (cat as Category) || 'divers'
  const meta = LABELS[category] || LABELS.divers

  const cards = useLiveQuery(async () =>
    await db.flashcards.where('category').equals(category).toArray()
  , [category])

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-6 safe-t">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Retour</span>
      </button>

      <div className="mb-8">
        <div className="text-6xl mb-4">{meta.emoji}</div>
        <h1 className="font-display text-4xl">{meta.label}</h1>
        <p className="text-white/60 mt-2">{cards?.length ?? 0} cartes disponibles</p>
      </div>

      <Link to={`/learn/${category}`} className="btn-chunky block text-center mb-10" data-variant="grass">
        Lancer la session
      </Link>

      <h2 className="font-display text-2xl mb-4">Toutes les cartes</h2>
      <div className="space-y-2">
        {cards?.map((c) => (
          <div key={c.id} className="bg-surface border border-line rounded-2xl p-4">
            <div className="font-semibold text-sm">{c.question}</div>
            <div className="text-grass text-sm mt-1">→ {c.answer}</div>
            {c.source === 'user' && (
              <div className="inline-block mt-2 font-mono text-[10px] uppercase tracking-wider text-mint bg-mint/10 px-2 py-0.5 rounded-full">
                Perso
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
