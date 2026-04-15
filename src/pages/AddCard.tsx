import { useState } from 'react'
import { db, type Category } from '../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Trash2, Upload, FileText, Globe, Lock, Sparkles, Download, Archive } from 'lucide-react'
import { exportUserCards, downloadBlob, importUserCards } from '../lib/portability'
import { motion, AnimatePresence } from 'framer-motion'
import { extractTextFromFile, extractQAs, basicClean, type ExtractedQA } from '../lib/pdf'

const CATS: Array<{ key: Category; label: string; emoji: string }> = [
  { key: 'histoire', label: 'Histoire', emoji: '📜' },
  { key: 'sciences', label: 'Sciences', emoji: '🔬' },
  { key: 'geo', label: 'Geo', emoji: '🌍' },
  { key: 'arts', label: 'Arts', emoji: '🎨' },
  { key: 'sports', label: 'Sports', emoji: '⚽' },
  { key: 'divers', label: 'Divers', emoji: '🎲' },
]

export function AddCardPage() {
  const [tab, setTab] = useState<'manual' | 'import'>('manual')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [distractors, setDistractors] = useState<string[]>(['', '', ''])
  const [category, setCategory] = useState<Category>('divers')
  const [visibility, setVisibility] = useState<'private' | 'public-pending'>('private')
  const [toast, setToast] = useState<string | null>(null)

  // Import state
  const [importing, setImporting] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedQA[]>([])
  const [rawText, setRawText] = useState('')

  const userCards = useLiveQuery(async () =>
    await db.flashcards.where('source').equals('user').reverse().sortBy('createdAt')
  )

  const canSubmit = question.trim().length > 3 && answer.trim().length > 0

  const showToast = (t: string) => {
    setToast(t)
    setTimeout(() => setToast(null), 1600)
  }

  const submitOne = async (q: string, a: string, choices?: string[]) => {
    await db.flashcards.add({
      uid: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      question: q.trim(),
      answer: a.trim(),
      choices,
      category,
      source: 'user',
      visibility,
      createdAt: Date.now(),
    })
  }

  const onSubmit = async () => {
    if (!canSubmit) return
    const choices = [answer, ...distractors.filter((d) => d.trim().length > 0)]
    await submitOne(question, answer, choices.length > 1 ? choices : undefined)
    setQuestion('')
    setAnswer('')
    setDistractors(['', '', ''])
    showToast('Carte ajoutee')
  }

  const onDelete = async (id: number) => {
    await db.flashcards.delete(id)
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await extractTextFromFile(file)
      const cleaned = basicClean(text)
      setRawText(cleaned)
      const qas = extractQAs(cleaned, 30)
      setExtracted(qas)
      if (qas.length === 0) showToast('Aucune question detectee · collez manuellement')
    } catch (err) {
      console.error(err)
      showToast('Erreur lecture du fichier')
    }
    setImporting(false)
  }

  const updateExtracted = (i: number, patch: Partial<ExtractedQA>) => {
    setExtracted((arr) => arr.map((it, j) => (j === i ? { ...it, ...patch } : it)))
  }

  const removeExtracted = (i: number) => {
    setExtracted((arr) => arr.filter((_, j) => j !== i))
  }

  const importAll = async () => {
    let n = 0
    for (const qa of extracted) {
      if (qa.question.trim().length > 3 && qa.answer.trim().length > 0) {
        await submitOne(qa.question, qa.answer)
        n++
      }
    }
    setExtracted([])
    setRawText('')
    showToast(`${n} cartes importees`)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-6 safe-t">
      <h1 className="font-display text-4xl mb-2">
        Creer une <span className="italic text-elephant-300">carte</span>.
      </h1>
      <p className="text-white/60 mb-6">Stockage local. Partage · en attente de backend.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-surface border border-line rounded-2xl p-1">
        <button
          onClick={() => setTab('manual')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            tab === 'manual' ? 'bg-elephant-500 text-white' : 'text-white/60'
          }`}
        >
          Manuel
        </button>
        <button
          onClick={() => setTab('import')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            tab === 'import' ? 'bg-elephant-500 text-white' : 'text-white/60'
          }`}
        >
          Import PDF
        </button>
      </div>

      {/* Visibility toggle · shared both tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setVisibility('private')}
          className={`flex-1 rounded-2xl border-2 p-3 text-left transition ${
            visibility === 'private' ? 'border-elephant-400 bg-elephant-500/10' : 'border-line bg-surface'
          }`}
        >
          <Lock className="w-4 h-4 mb-1" />
          <div className="text-sm font-semibold">Prive</div>
          <div className="text-[11px] text-white/50">Visible par toi seul</div>
        </button>
        <button
          onClick={() => setVisibility('public-pending')}
          className={`flex-1 rounded-2xl border-2 p-3 text-left transition ${
            visibility === 'public-pending' ? 'border-sun bg-sun/10' : 'border-line bg-surface'
          }`}
        >
          <Globe className="w-4 h-4 mb-1 text-sun" />
          <div className="text-sm font-semibold">Public</div>
          <div className="text-[11px] text-white/50">En attente backend</div>
        </button>
      </div>

      {/* Category · shared */}
      <div className="mb-6">
        <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">
          Categorie
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`p-3 rounded-2xl border-2 transition ${
                category === c.key ? 'border-elephant-400 bg-elephant-500/10' : 'border-line bg-surface'
              }`}
            >
              <div className="text-xl">{c.emoji}</div>
              <div className="text-xs font-semibold mt-1">{c.label}</div>
            </button>
          ))}
        </div>
      </div>

      {tab === 'manual' ? (
        <div className="space-y-4 mb-10">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="En quelle annee... ?"
              rows={2}
              className="w-full bg-surface border border-line rounded-2xl px-4 py-3 outline-none focus:border-elephant-400 transition resize-none"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">Bonne reponse</label>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="La bonne reponse"
              className="w-full bg-surface border border-line rounded-2xl px-4 py-3 outline-none focus:border-elephant-400 transition"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 block">Mauvaises reponses (optionnel)</label>
            <div className="space-y-2">
              {distractors.map((d, i) => (
                <input
                  key={i}
                  value={d}
                  onChange={(e) => {
                    const next = [...distractors]
                    next[i] = e.target.value
                    setDistractors(next)
                  }}
                  placeholder={`Distracteur ${i + 1}`}
                  className="w-full bg-surface border border-line rounded-2xl px-4 py-3 outline-none focus:border-elephant-300 transition"
                />
              ))}
            </div>
          </div>
          <button onClick={onSubmit} disabled={!canSubmit} className="btn-chunky w-full" data-variant="elephant">
            Ajouter
          </button>
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          <label className="block bg-surface border-2 border-dashed border-line rounded-2xl p-8 text-center cursor-pointer hover:border-elephant-400 transition">
            <input type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" className="hidden" onChange={onFileChange} />
            <Upload className="w-8 h-8 mx-auto mb-3 text-elephant-300" />
            <div className="font-semibold">{importing ? 'Lecture...' : 'Deposer un fichier'}</div>
            <div className="text-xs text-white/50 mt-1">PDF · TXT · Markdown</div>
          </label>

          {rawText && (
            <div className="bg-surface border border-line rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-elephant-300" />
                <div className="text-sm font-semibold">Texte extrait · {Math.round(rawText.length / 100) / 10}k caracteres</div>
              </div>
              <div className="text-xs text-white/50 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sun" />
                Nettoyage basique applique · IA serveur a brancher
              </div>
            </div>
          )}

          {extracted.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                  {extracted.length} Q/R detectees · editez-les
                </div>
                <button onClick={importAll} className="btn-chunky" data-variant="elephant">
                  Tout importer
                </button>
              </div>
              <div className="space-y-3">
                {extracted.map((qa, i) => (
                  <div key={i} className="bg-surface border border-line rounded-2xl p-3">
                    <textarea
                      value={qa.question}
                      onChange={(e) => updateExtracted(i, { question: e.target.value })}
                      rows={2}
                      className="w-full bg-transparent text-sm font-semibold outline-none resize-none"
                    />
                    <input
                      value={qa.answer}
                      onChange={(e) => updateExtracted(i, { answer: e.target.value })}
                      className="w-full bg-transparent text-elephant-300 text-sm mt-1 outline-none"
                    />
                    <button onClick={() => removeExtracted(i)} className="text-[10px] text-white/40 hover:text-blaze uppercase tracking-wider mt-2">
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Tes cartes ({userCards?.length ?? 0})</h2>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const blob = await exportUserCards()
                downloadBlob(blob, `genius-cards-${new Date().toISOString().slice(0, 10)}.json`)
                showToast('Export telecharge')
              }}
              disabled={!userCards?.length}
              className="p-2 rounded-xl bg-surface border border-line hover:border-white/20 disabled:opacity-40"
              title="Exporter JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <label className="p-2 rounded-xl bg-surface border border-line hover:border-white/20 cursor-pointer" title="Importer JSON">
              <Archive className="w-4 h-4" />
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  try {
                    const { imported, skipped } = await importUserCards(f)
                    showToast(`${imported} importees, ${skipped} ignorees`)
                  } catch {
                    showToast('Fichier invalide')
                  }
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </div>
        {userCards && userCards.length === 0 && <p className="text-white/50 text-sm">Aucune carte pour l'instant.</p>}
        <div className="space-y-2">
          {userCards?.map((c) => (
            <div key={c.id} className="bg-surface border border-line rounded-2xl p-4 flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{c.question}</div>
                <div className="text-xs text-elephant-300 mt-1">→ {c.answer}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">{c.category}</span>
                  {c.visibility === 'public-pending' ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-sun bg-sun/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" /> Public (attente)
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Prive
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => onDelete(c.id!)} className="p-2 text-white/50 hover:text-blaze hover:bg-blaze/10 rounded-xl transition" aria-label="Supprimer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-elephant-500 text-white font-bold px-5 py-3 rounded-2xl shadow-btn-elephant"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
