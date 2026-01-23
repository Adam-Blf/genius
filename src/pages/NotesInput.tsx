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
  Wand2,
  Zap,
  GraduationCap,
  Lightbulb,
  Target
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useFlashcards } from '../contexts/FlashcardContext'
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '../components/transitions'

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

// Difficulty badge component
function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const config = {
    easy: { label: 'Facile', color: 'from-[#00C853] to-[#69F0AE]', textColor: 'text-green-400' },
    medium: { label: 'Moyen', color: 'from-[#FF9100] to-[#FFD180]', textColor: 'text-amber-400' },
    hard: { label: 'Difficile', color: 'from-[#FF5252] to-[#FFAB91]', textColor: 'text-red-400' }
  }
  const { label, color, textColor } = config[difficulty]

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${color} bg-opacity-20 ${textColor} font-medium`}>
      {label}
    </span>
  )
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
        {/* Header with Genius Blue Edition styling */}
        <FadeIn delay={0}>
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className="relative"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="/ralph.png" alt="Ralph" className="w-14 h-14 object-contain" />
              <motion.div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#0052D4] to-[#6FB1FC] flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Brain className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-blue">Revision IA</h1>
              <p className="text-gray-400 text-sm">Transforme tes cours en flashcards</p>
            </div>
          </div>
        </FadeIn>

        {/* Stats Preview */}
        <SlideUp delay={0.1}>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0052D4]/20 to-[#4364F7]/20 rounded-2xl p-3 border border-[#4364F7]/30">
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#4364F7]/20 rounded-full blur-xl" />
              <GraduationCap className="w-4 h-4 text-[#6FB1FC] mb-1" />
              <p className="text-lg font-bold text-white">{wordCount}</p>
              <p className="text-[10px] text-gray-400">Mots</p>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-[#00E5FF]/20 to-[#00B8D4]/20 rounded-2xl p-3 border border-[#00E5FF]/30">
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#00E5FF]/20 rounded-full blur-xl" />
              <Target className="w-4 h-4 text-[#00E5FF] mb-1" />
              <p className="text-lg font-bold text-white">{Math.max(0, Math.floor(wordCount / 30))}</p>
              <p className="text-[10px] text-gray-400">Cartes estimees</p>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-3 border border-amber-500/30">
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-500/20 rounded-full blur-xl" />
              <Zap className="w-4 h-4 text-amber-400 mb-1" />
              <p className="text-lg font-bold text-white">+{Math.max(0, Math.floor(wordCount / 30) * 10)}</p>
              <p className="text-[10px] text-gray-400">XP potentiel</p>
            </div>
          </div>
        </SlideUp>

        {/* API Key Toggle - Genius Blue Edition */}
        <SlideUp delay={0.15}>
          <motion.div
            className="mb-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
            whileHover={{ borderColor: 'rgba(67, 100, 247, 0.3)' }}
          >
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="w-full flex items-center justify-between text-sm group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#0052D4] to-[#6FB1FC] flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">{apiKey ? 'Cle API configuree' : 'Configurer cle IA'}</span>
              </div>
              {apiKey && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs px-2 py-1 rounded-full bg-[#00C853]/20 text-[#00C853]"
                >
                  Active
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showApiKeyInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1 input-field text-sm focus:border-[#4364F7]"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveApiKey}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0052D4] to-[#6FB1FC] text-white text-sm font-medium"
                    >
                      Sauver
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Stockage local securise. Sans cle, generation basique.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </SlideUp>

        {/* Title Input - Enhanced */}
        <SlideUp delay={0.2}>
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">Titre du set</label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Histoire - La Revolution Francaise"
                className="w-full input-field focus:border-[#4364F7] pr-10"
              />
              {title && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle className="w-5 h-5 text-[#00C853]" />
                </motion.div>
              )}
            </div>
          </div>
        </SlideUp>

        {/* Notes Input - Enhanced with glow */}
        <SlideUp delay={0.25}>
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">Tes notes de cours</label>
            <div className="relative group">
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0052D4]/20 via-[#4364F7]/20 to-[#6FB1FC]/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Colle tes notes de cours ici...

Exemple:
La Revolution francaise a commence en 1789 avec la prise de la Bastille. C'etait un evenement majeur qui a marque le debut de la fin de la monarchie absolue en France.

Les causes principales etaient les inegalites sociales, la crise economique, et l'influence des philosophes des Lumieres comme Voltaire et Rousseau..."
                className="w-full h-48 input-field resize-none focus:border-[#4364F7] transition-all duration-300"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <motion.span
                  className={`text-xs px-2 py-1 rounded-full ${
                    wordCount >= 50 ? 'bg-[#00C853]/20 text-[#00C853]' : 'bg-slate-700 text-gray-400'
                  }`}
                  animate={wordCount >= 50 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {wordCount} mots
                </motion.span>
                {notes.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClear}
                    className="p-1.5 bg-[#FF5252]/20 hover:bg-[#FF5252]/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-[#FF5252]" />
                  </motion.button>
                )}
              </div>
            </div>
            {notes.length > 0 && notes.length < 50 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-amber-400 mt-2 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                Encore {50 - notes.length} caracteres minimum
              </motion.p>
            )}
          </div>
        </SlideUp>

        {/* Error Message - Enhanced */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 p-4 bg-[#FF5252]/10 border border-[#FF5252]/30 rounded-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#FF5252]/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-[#FF5252]" />
              </div>
              <span className="text-sm text-[#FF5252]">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button - Genius Blue Edition */}
        <SlideUp delay={0.3}>
          <motion.button
            onClick={handleGenerate}
            disabled={loading || notes.length < 50}
            className={`w-full py-4 rounded-2xl font-semibold text-white relative overflow-hidden transition-all duration-300 ${
              loading || notes.length < 50
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#0052D4] via-[#4364F7] to-[#6FB1FC]'
            }`}
            whileHover={notes.length >= 50 && !loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={notes.length >= 50 && !loading ? { scale: 0.98 } : {}}
            style={{
              boxShadow: notes.length >= 50 && !loading
                ? '0 10px 40px -10px rgba(0, 82, 212, 0.5)'
                : 'none'
            }}
          >
            {/* Animated shine effect */}
            {!loading && notes.length >= 50 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            )}

            <div className="flex items-center justify-center gap-2 relative z-10">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generation en cours...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Generer les Flashcards</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </div>
          </motion.button>
        </SlideUp>

        {/* Generated Cards Preview - Enhanced */}
        <AnimatePresence>
          {generatedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00C853] to-[#69F0AE] flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{generatedCards.length} flashcards</h2>
                    <p className="text-xs text-gray-400">Pret a reviser</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-medium"
                >
                  +{generatedCards.length * 10} XP
                </motion.div>
              </div>

              <StaggerContainer className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                {generatedCards.slice(0, 5).map((card, index) => (
                  <StaggerItem key={card.id}>
                    <motion.div
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-[#4364F7]/30 transition-all duration-300"
                      whileHover={{ x: 4, boxShadow: '0 4px 20px -4px rgba(0, 82, 212, 0.2)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#0052D4] to-[#6FB1FC] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">Q{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium line-clamp-1">
                            {card.question}
                          </p>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                            {card.answer}
                          </p>
                        </div>
                        <DifficultyBadge difficulty={card.difficulty} />
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {generatedCards.length > 5 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 text-sm mb-4"
                >
                  + {generatedCards.length - 5} autres cartes...
                </motion.p>
              )}

              <motion.button
                onClick={handleSaveSet}
                className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-[#00E5FF] via-[#18FFFF] to-[#84FFFF] relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{ boxShadow: '0 10px 40px -10px rgba(0, 229, 255, 0.5)' }}
              >
                <div className="flex items-center justify-center gap-2 text-slate-900">
                  <span>Commencer la revision</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips - Enhanced with Genius Blue Edition */}
        {generatedCards.length === 0 && (
          <SlideUp delay={0.4}>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Conseils
              </h3>
              <StaggerContainer className="space-y-2">
                {[
                  { icon: FileText, text: 'Colle des paragraphes complets pour de meilleurs resultats', color: 'from-[#0052D4] to-[#6FB1FC]' },
                  { icon: BookOpen, text: 'Plus il y a de contenu, plus les flashcards seront variees', color: 'from-[#00E5FF] to-[#84FFFF]' },
                  { icon: Sparkles, text: 'Avec une cle API, la generation sera plus intelligente', color: 'from-amber-500 to-orange-500' }
                ].map((tip, i) => (
                  <StaggerItem key={i}>
                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30"
                      whileHover={{ x: 4, borderColor: 'rgba(67, 100, 247, 0.3)' }}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tip.color} flex items-center justify-center flex-shrink-0`}>
                        <tip.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-400 text-sm">{tip.text}</span>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </SlideUp>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
