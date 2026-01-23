import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FunFactsPage } from '../pages/FunFacts'
import { FlashcardProvider } from '../contexts/FlashcardContext'
import { UserDataProvider } from '../contexts/UserDataContext'
import { OnboardingProvider } from '../contexts/OnboardingContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { OnboardingGuard } from '../components/OnboardingGuard'

// Lazy load pages to avoid circular dependencies
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('../pages/Home').then(m => ({ default: m.HomePage })))
const LearnPage = lazy(() => import('../pages/Learn').then(m => ({ default: m.LearnPage })))
const LessonPage = lazy(() => import('../pages/Lesson').then(m => ({ default: m.LessonPage })))
const LeaderboardPage = lazy(() => import('../pages/Leaderboard').then(m => ({ default: m.LeaderboardPage })))
const ProfilePage = lazy(() => import('../pages/Profile').then(m => ({ default: m.ProfilePage })))
const PremiumPage = lazy(() => import('../pages/Premium').then(m => ({ default: m.PremiumPage })))
const OnboardingPage = lazy(() => import('../pages/Onboarding').then(m => ({ default: m.OnboardingPage })))
const OnboardingFlowPage = lazy(() => import('../pages/OnboardingFlow').then(m => ({ default: m.OnboardingFlowPage })))
const NotesInputPage = lazy(() => import('../pages/NotesInput').then(m => ({ default: m.NotesInputPage })))
const FlashcardsPlayerPage = lazy(() => import('../pages/FlashcardsPlayer').then(m => ({ default: m.FlashcardsPlayerPage })))
const TriviaQuizPage = lazy(() => import('../pages/TriviaQuiz').then(m => ({ default: m.TriviaQuizPage })))
const SettingsPage = lazy(() => import('../pages/Settings').then(m => ({ default: m.SettingsPage })))

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-genius-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <div className="text-white text-lg font-medium">Chargement...</div>
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <OnboardingProvider>
          <UserDataProvider>
            <FlashcardProvider>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Onboarding Flow - First Launch Tutorial */}
                  <Route path="/welcome" element={<OnboardingFlowPage />} />

                  {/* Legacy onboarding page (for direct access) */}
                  <Route path="/onboarding" element={<OnboardingPage />} />

                  {/* Protected routes - require onboarding completion */}
                  <Route path="/" element={
                    <OnboardingGuard>
                      <HomePage />
                    </OnboardingGuard>
                  } />
                  <Route path="/learn" element={
                    <OnboardingGuard>
                      <LearnPage />
                    </OnboardingGuard>
                  } />
                  <Route path="/lesson/:categoryId/:lessonId" element={
                    <OnboardingGuard>
                      <LessonPage />
                    </OnboardingGuard>
                  } />
                  <Route path="/leaderboard" element={
                    <OnboardingGuard>
                      <LeaderboardPage />
                    </OnboardingGuard>
                  } />
                  <Route path="/profile" element={
                    <OnboardingGuard>
                      <ProfilePage />
                    </OnboardingGuard>
                  } />
                  <Route path="/premium" element={
                    <OnboardingGuard>
                      <PremiumPage />
                    </OnboardingGuard>
                  } />
                  <Route path="/settings" element={
                    <OnboardingGuard>
                      <SettingsPage />
                    </OnboardingGuard>
                  } />

                  {/* Learning Routes */}
                  <Route path="/funfacts" element={
                    <OnboardingGuard>
                      <FunFactsPage />
                    </OnboardingGuard>
                  } />
                  <Route path="/notes" element={
                    <OnboardingGuard>
                      <NotesInputPage />
                    </OnboardingGuard>
                  } />
                  <Route path="/flashcards" element={
                    <OnboardingGuard>
                      <FlashcardsPlayerPage />
                    </OnboardingGuard>
                  } />
                  <Route path="/trivia" element={
                    <OnboardingGuard>
                      <TriviaQuizPage />
                    </OnboardingGuard>
                  } />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </FlashcardProvider>
          </UserDataProvider>
        </OnboardingProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
