import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Eager load splash and welcome (first screens)
import { Splash } from '@/pages/Splash'
import { Welcome } from '@/pages/Welcome'

// Lazy load other pages for better performance
const OnboardingName = lazy(() =>
  import('@/pages/OnboardingName').then((m) => ({ default: m.OnboardingName }))
)
const OnboardingCategories = lazy(() =>
  import('@/pages/OnboardingCategories').then((m) => ({ default: m.OnboardingCategories }))
)
const Swipe = lazy(() => import('@/pages/Swipe').then((m) => ({ default: m.Swipe })))
const Stats = lazy(() => import('@/pages/Stats').then((m) => ({ default: m.Stats })))
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-text-muted text-sm">Chargement...</p>
      </div>
    </div>
  )
}

// Wrap lazy components with Suspense
function withSuspense(Component: React.LazyExoticComponent<() => React.JSX.Element>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Splash />,
  },
  {
    path: '/welcome',
    element: <Welcome />,
  },
  {
    path: '/onboarding/name',
    element: withSuspense(OnboardingName),
  },
  {
    path: '/onboarding/categories',
    element: withSuspense(OnboardingCategories),
  },
  {
    path: '/swipe',
    element: withSuspense(Swipe),
  },
  {
    path: '/stats',
    element: withSuspense(Stats),
  },
  {
    path: '/settings',
    element: withSuspense(Settings),
  },
])
