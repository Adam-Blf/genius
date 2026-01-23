import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FunFactsPage } from '../pages/FunFacts'

// Lazy load pages to avoid circular dependencies
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('../pages/Home').then(m => ({ default: m.HomePage })))
const LearnPage = lazy(() => import('../pages/Learn').then(m => ({ default: m.LearnPage })))
const LessonPage = lazy(() => import('../pages/Lesson').then(m => ({ default: m.LessonPage })))
const LeaderboardPage = lazy(() => import('../pages/Leaderboard').then(m => ({ default: m.LeaderboardPage })))
const ProfilePage = lazy(() => import('../pages/Profile').then(m => ({ default: m.ProfilePage })))
const PremiumPage = lazy(() => import('../pages/Premium').then(m => ({ default: m.PremiumPage })))
const OnboardingPage = lazy(() => import('../pages/Onboarding').then(m => ({ default: m.OnboardingPage })))
const NotesInputPage = lazy(() => import('../pages/NotesInput').then(m => ({ default: m.NotesInputPage })))
const FlashcardsPlayerPage = lazy(() => import('../pages/FlashcardsPlayer').then(m => ({ default: m.FlashcardsPlayerPage })))
const TriviaQuizPage = lazy(() => import('../pages/TriviaQuiz').then(m => ({ default: m.TriviaQuizPage })))

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-purple-700">
      <div className="text-white text-xl">Chargement...</div>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* All routes are now directly accessible */}
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/lesson/:categoryId/:lessonId" element={<LessonPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Learning Routes */}
          <Route path="/funfacts" element={<FunFactsPage />} />
          <Route path="/notes" element={<NotesInputPage />} />
          <Route path="/flashcards" element={<FlashcardsPlayerPage />} />
          <Route path="/trivia" element={<TriviaQuizPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
