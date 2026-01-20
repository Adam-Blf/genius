import { useLocation, useNavigate } from 'react-router-dom'
import { Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'

interface TabItem {
  path: string
  icon: IconName
  label: string
}

const tabs: TabItem[] = [
  { path: '/swipe', icon: 'Layers', label: 'Swipe' },
  { path: '/stats', icon: 'ChartBar', label: 'Stats' },
  { path: '/settings', icon: 'Settings', label: 'Réglages' },
]

export function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-surface-overlay pb-safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <Icon name={tab.icon} className={cn('size-6', isActive && 'text-primary')} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
