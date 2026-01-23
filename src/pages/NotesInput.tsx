import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Sparkles,
  Loader2,
  Copy,
  CheckCircle,
  AlertCircle,
  Trash2,
  ArrowRight,
  BookOpen,
  Brain,
  Wand2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useFlashcards } from '../contexts/FlashcardContext'

// Type for generated flashcards (before being added to store)
interface GeneratedFlashcard {
  id: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// Legacy exports for compatibility
export type { Flashcard, FlashcardSet } from '../types/flashcards'

// AI Service for generating flashcards
async function generateFlashcardsWithAI(notes: string, apiKey: string | null): Promise<GeneratedFlashcard[]> {
  // If no API key, use local generation
  if (!apiKey) {
    return generateFlashcardsLocally(notes)
  }

  try {
    // Try OpenAI first
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en creation de flashcards educatives.
            A partir des notes fournies, genere des flashcards au format JSON.
            Chaque flashcard doit avoir:
            - question: une question claire et concise
            - answer: une reponse complete mais pas trop longue
            - difficulty: "easy", "medium" ou "hard"

            Genere autant de flashcards que necessaire pour couvrir tout le contenu (pas de limite).
            Reponds UNIQUEMENT avec un tableau JSON valide.`
          },
          {
            role: 'user',
            content: `Genere des flashcards a partir de ces notes:\n\n${notes}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const cards = JSON.parse(jsonMatch[0])
      return cards.map((card: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium'
      }))
    }

    throw new Error('Failed to parse AI response')
  } catch (err) {
    console.error('AI Generation error:', err)
    // Fallback to local generation
    return generateFlashcardsLocally(notes)
  }
}

// Local flashcard generation (no AI required)
function generateFlashcardsLocally(notes: string): GeneratedFlashcard[] {
  const flashcards: GeneratedFlashcard[] = []

  // Split into sentences/paragraphs - No limit on cards!
  const sentences = notes
    .split(/[.!?]\s+/)
    .filter(s => s.trim().length > 20)

  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim()

    // Extract key concepts
    const words = trimmed.split(' ')
    if (words.length < 5) return

    // Generate different types of questions
    const questionTypes = [
      () => {
        // Definition style
        const keyWord = words.find(w => w.length > 6 && /^[A-Z]/.test(w)) || words[Math.floor(words.length / 2)]
        return {
          question: `Qu'est-ce que ${keyWord?.toLowerCase()} ?`,
          answer: trimmed.endsWith('.') ? trimmed : trimmed + '.'
        }
      },
      () => {
        // Complete the sentence
        const splitPoint = Math.floor(words.length * 0.6)
        return {
          question: `Complete: "${words.slice(0, splitPoint).join(' ')}..."`,
          answer: trimmed.endsWith('.') ? trimmed : trimmed + '.'
        }
      },
      () => {
        // True/False style
        return {
          question: `Vrai ou Faux: ${trimmed}`,
          answer: 'Vrai - ' + (trimmed.endsWith('.') ? trimmed : trimmed + '.')
        }
      }
    ]

    const generator = questionTypes[index % questionTypes.length]
    const { question, answer } = generator()

    flashcards.push({
      id: `local-${Date.now()}-${index}`,
      question,
      answer,
      difficulty: index < sentences.length / 3 ? 'easy' : index < (sentences.length * 2) / 3 ? 'medium' : 'hard'
    })
  })

  return flashcards.length > 0 ? flashcards : [{
    id: `local-${Date.now()}-0`,
    question: 'Resume le contenu principal de ces notes',
    answer: notes.slice(0, 200) + (notes.length > 200 ? '...' : ''),
    difficulty: 'medium'
  }]
}

export function NotesInputPage() {
  const navigate = useNavigate()
  const { addSet } = useFlashcards()
  const [notes, setNotes] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([])
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKey, setApiKey] = useState<string>('')

  // Load saved API key
  useState(() => {
    const savedKey = localStorage.getItem('genius_openai_key')
    if (savedKey) setApiKey(savedKey)
  })

  const handleGenerate = useCallback(async () => {
    if (notes.trim().length < 50) {
      setError('Veuillez entrer au moins 50 caracteres de notes.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const cards = await generateFlashcardsWithAI(
        notes,
        apiKey || import.meta.env.VITE_OPENAI_API_KEY || null
      )

      setGeneratedCards(cards)
      setSuccess(true)
    } catch (err) {
      setError('Erreur lors de la generation. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }, [notes, apiKey])

  const handleSaveSet = useCallback(() => {
    if (generatedCards.length === 0) return

    // Use the new store system
    const setId = addSet({
      title: title || `Notes du ${new Date().toLocaleDateString('fr-FR')}`,
      description: `${generatedCards.length} flashcards generees a partir de vos notes`,
      cards: generatedCards.map(card => ({
        ...card,
        timesReviewed: 0,
        timesCorrect: 0,
        lastReviewedAt: null,
        masteryLevel: 0
      })),
      source: 'notes'
    })

    // Navigate to player
    navigate('/flashcards', { state: { setId } })
  }, [generatedCards, title, navigate, addSet])

  const handleClear = () => {
    setNotes('')
    setTitle('')
    setGeneratedCards([])
    setSuccess(false)
    setError(null)
  }

  const saveApiKey = () => {
    if (apiKey) {
      localStorage.setItem('genius_openai_key', apiKey)
      setShowApiKeyInput(false)
    }
  }

  const wordCount = notes.trim().split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="min-h-screen bg-genius-bg pb-20 pt-16">
      <TopBar />

      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-6"
        >
          <motion.img
            src="/ralph.png"
            alt="Ralph"
            className="w-12 h-12 object-contain"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div>
            <h1 className="text-xl font-bold text-white">Revision</h1>
            <p className="text-gray-400 text-sm">Colle tes cours pour generer des flashcards</p>
          </div>
        </motion.div>

        {/* API Key Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            <Wand2 className="w-3 h-3" />
            {apiKey ? 'Cle API configuree' : 'Configurer cle OpenAI (optionnel)'}
          </button>

          <AnimatePresence>
            {showApiKeyInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 input-field text-sm"
                  />
                  <Button onClick={saveApiKey} variant="secondary" size="sm">
                    Sauver
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  La cle est stockee localement. Sans cle, la generation sera basique.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Title Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du set (ex: Histoire - Chapitre 3)"
            className="w-full input-field"
          />
        </motion.div>

        {/* Notes Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Colle tes notes de cours ici...

Exemple:
La Revolution francaise a commence en 1789 avec la prise de la Bastille. C'etait un evenement majeur qui a marque le debut de la fin de la monarchie absolue en France.

Les causes principales etaient les inegalites sociales, la crise economique, et l'influence des philosophes des Lumieres comme Voltaire et Rousseau..."
              className="w-full h-64 input-field resize-none"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">{wordCount} mots</span>
              {notes.length > 0 && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Button
            onClick={handleGenerate}
            disabled={loading || notes.length < 50}
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
          >
            {loading ? 'Generation en cours...' : 'Generer les Flashcards'}
          </Button>
        </motion.div>

        {/* Generated Cards Preview */}
        <AnimatePresence>
          {generatedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  {generatedCards.length} flashcards generees
                </h2>
              </div>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {generatedCards.slice(0, 5).map((card, index) => (
                  <Card key={card.id} variant="default" padding="sm">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-primary-400 mt-0.5">
                        Q{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {card.question}
                        </p>
                        <p className="text-gray-400 text-xs mt-1 truncate">
                          R: {card.answer}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        card.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        card.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {card.difficulty === 'easy' ? 'Facile' : card.difficulty === 'hard' ? 'Difficile' : 'Moyen'}
                      </span>
                    </div>
                  </Card>
                ))}
                {generatedCards.length > 5 && (
                  <p className="text-center text-gray-500 text-sm">
                    + {generatedCards.length - 5} autres cartes...
                  </p>
                )}
              </div>

              <Button
                onClick={handleSaveSet}
                variant="secondary"
                size="lg"
                className="w-full"
                leftIcon={<ArrowRight className="w-5 h-5" />}
              >
                Commencer la revision
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        {generatedCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-sm font-medium text-gray-400 mb-3">Conseils</h3>
            <div className="space-y-2">
              {[
                { icon: FileText, text: 'Colle des paragraphes complets pour de meilleurs resultats' },
                { icon: BookOpen, text: 'Plus il y a de contenu, plus les flashcards seront variees' },
                { icon: Sparkles, text: 'Avec une cle API, la generation sera plus intelligente' }
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-500 text-sm">
                  <tip.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
