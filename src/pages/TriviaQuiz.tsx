import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Brain,
  Trophy,
  Timer,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Loader2,
  Target,
  Zap
} from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { fetchTriviaQuestions, type TriviaQuestion } from '../services/apis'

// Local storage key for quiz stats
const QUIZ_STATS_KEY = 'genius_quiz_stats'

interface QuizStats {
  totalPlayed: number
  totalCorrect: number
  bestStreak: number
  currentStreak: number
}

type Difficulty = 'easy' | 'medium' | 'hard'
type GameState = 'menu' | 'playing' | 'result'

function shuffleAnswers(question: TriviaQuestion): string[] {
  const answers = [...question.incorrectAnswers, question.correctAnswer]
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]]
  }
  return answers
}

export function TriviaQuizPage() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(false)
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([])
  const [stats, setStats] = useState<QuizStats>({
    totalPlayed: 0,
    totalCorrect: 0,
    bestStreak: 0,
    currentStreak: 0
  })
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem(QUIZ_STATS_KEY)
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats))
      } catch (e) {
        console.error('Failed to parse quiz stats')
      }
    }
  }, [])

  // Save stats to localStorage
  const saveStats = (newStats: QuizStats) => {
    setStats(newStats)
    localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(newStats))
  }

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto select wrong
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerActive, timeLeft])

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      setTimerActive(false)
      setIsCorrect(false)
      setStreak(0)
    }
  }

  // Start game
  const startGame = async (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty)
    setLoading(true)
    setScore(0)
    setStreak(0)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsCorrect(null)

    try {
      const fetchedQuestions = await fetchTriviaQuestions(10, selectedDifficulty)
      setQuestions(fetchedQuestions)

      if (fetchedQuestions.length > 0) {
        setShuffledAnswers(shuffleAnswers(fetchedQuestions[0]))
        setGameState('playing')
        setTimeLeft(getDifficultyTime(selectedDifficulty))
        setTimerActive(true)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyTime = (diff: Difficulty): number => {
    switch (diff) {
      case 'easy': return 30
      case 'medium': return 20
      case 'hard': return 15
      default: return 30
    }
  }

  const getDifficultyPoints = (diff: Difficulty): number => {
    switch (diff) {
      case 'easy': return 10
      case 'medium': return 20
      case 'hard': return 30
      default: return 10
    }
  }

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return

    setTimerActive(false)
    setSelectedAnswer(answer)
    const correct = answer === questions[currentIndex].correctAnswer
    setIsCorrect(correct)

    if (correct) {
      const points = getDifficultyPoints(difficulty)
      setScore(prev => prev + points + (streak * 5)) // Bonus for streak
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }
  }

  // Move to next question
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShuffledAnswers(shuffleAnswers(questions[nextIndex]))
      setTimeLeft(getDifficultyTime(difficulty))
      setTimerActive(true)
    } else {
      // Game over - show results
      endGame()
    }
  }

  // End game
  const endGame = () => {
    setGameState('result')
    setTimerActive(false)

    // Update stats
    const correctCount = questions.filter((_, i) => {
      // This is simplified - in real app track each answer
      return true
    }).length

    const newStats: QuizStats = {
      totalPlayed: stats.totalPlayed + 1,
      totalCorrect: stats.totalCorrect + score / getDifficultyPoints(difficulty),
      bestStreak: Math.max(stats.bestStreak, streak),
      currentStreak: score > 0 ? stats.currentStreak + 1 : 0
    }
    saveStats(newStats)
  }

  // Difficulty colors
  const difficultyColors = {
    easy: 'from-green-500 to-emerald-600',
    medium: 'from-amber-500 to-orange-600',
    hard: 'from-red-500 to-rose-600'
  }

  const difficultyLabels = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile'
  }

  // Current question
  const currentQuestion = questions[currentIndex]

  return (
    <div className="min-h-screen bg-genius-bg pb-20 pt-16">
      <TopBar />

      <div className="p-4 max-w-lg mx-auto">
        {/* Menu State */}
        {gameState === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <motion.img
                src="/ralph.png"
                alt="Ralph"
                className="w-12 h-12 object-contain"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <h1 className="text-xl font-bold text-white">Trivia Quiz</h1>
                <p className="text-gray-400 text-sm">Teste tes connaissances !</p>
              </div>
            </div>

            {/* Stats Card */}
            <Card variant="glass" padding="lg" className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">Tes statistiques</span>
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalPlayed}</p>
                  <p className="text-xs text-gray-500">Quiz joues</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-400">{stats.bestStreak}</p>
                  <p className="text-xs text-gray-500">Meilleur streak</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.totalPlayed > 0
                      ? Math.round((stats.totalCorrect / (stats.totalPlayed * 10)) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Precision</p>
                </div>
              </div>
            </Card>

            {/* Difficulty Selection */}
            <h2 className="text-lg font-semibold text-white mb-3">Choisis ta difficulte</h2>

            <div className="space-y-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff, index) => (
                <motion.div
                  key={diff}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="default"
                    padding="none"
                    interactive
                    onClick={() => startGame(diff)}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${difficultyColors[diff]}`}>
                        {diff === 'easy' && <Sparkles className="w-6 h-6 text-white" />}
                        {diff === 'medium' && <Target className="w-6 h-6 text-white" />}
                        {diff === 'hard' && <Zap className="w-6 h-6 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{difficultyLabels[diff]}</h3>
                        <p className="text-sm text-gray-400">
                          {diff === 'easy' && '30s par question - 10 pts'}
                          {diff === 'medium' && '20s par question - 20 pts'}
                          {diff === 'hard' && '15s par question - 30 pts'}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {loading && (
              <div className="flex items-center justify-center mt-8">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              </div>
            )}
          </motion.div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && currentQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Progress & Timer Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary-400" />
                <span className="text-sm text-white font-medium">
                  {currentIndex + 1}/{questions.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white font-bold">{streak}</span>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                  timeLeft <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-white'
                }`}>
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-bold">{timeLeft}s</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Score */}
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-white">{score}</span>
              <span className="text-gray-400 ml-2">points</span>
            </div>

            {/* Question Card */}
            <Card variant="glass" padding="lg" className="mb-6">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 mb-3 inline-block">
                {currentQuestion.category}
              </span>
              <h2 className="text-lg font-semibold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </Card>

            {/* Answers */}
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {shuffledAnswers.map((answer, index) => {
                  const isSelected = selectedAnswer === answer
                  const isCorrectAnswer = answer === currentQuestion.correctAnswer
                  const showResult = selectedAnswer !== null

                  let buttonStyle = 'bg-slate-800 hover:bg-slate-700 border-transparent'
                  if (showResult) {
                    if (isCorrectAnswer) {
                      buttonStyle = 'bg-green-500/20 border-green-500 text-green-400'
                    } else if (isSelected && !isCorrectAnswer) {
                      buttonStyle = 'bg-red-500/20 border-red-500 text-red-400'
                    }
                  }

                  return (
                    <motion.button
                      key={answer}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswer(answer)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${buttonStyle} ${
                        selectedAnswer === null ? 'active:scale-98' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={showResult && isCorrectAnswer ? 'text-green-400' : 'text-white'}>
                          {answer}
                        </span>
                        {showResult && isCorrectAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {showResult && isSelected && !isCorrectAnswer && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Next Button */}
            {selectedAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Button
                  onClick={nextQuestion}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {currentIndex < questions.length - 1 ? 'Question suivante' : 'Voir les resultats'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Result State */}
        {gameState === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.img
              src="/ralph.png"
              alt="Ralph"
              className="w-32 h-32 mx-auto mb-4 object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            <h1 className="text-3xl font-bold text-white mb-2">
              {score >= questions.length * getDifficultyPoints(difficulty) * 0.7
                ? 'Bravo !'
                : score >= questions.length * getDifficultyPoints(difficulty) * 0.4
                ? 'Bien joue !'
                : 'Continue comme ca !'}
            </h1>

            <p className="text-gray-400 mb-6">Tu as termine le quiz !</p>

            <Card variant="glass" padding="lg" className="mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{score}</p>
                  <p className="text-sm text-gray-500">Points</p>
                </div>
                <div>
                  <Zap className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{streak}</p>
                  <p className="text-sm text-gray-500">Meilleur streak</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-400">Difficulte:</span>
                  <span className={`font-semibold ${
                    difficulty === 'easy' ? 'text-green-400' :
                    difficulty === 'medium' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {difficultyLabels[difficulty]}
                  </span>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => startGame(difficulty)}
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<RefreshCw className="w-5 h-5" />}
              >
                Rejouer
              </Button>

              <Button
                onClick={() => setGameState('menu')}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Changer de difficulte
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
