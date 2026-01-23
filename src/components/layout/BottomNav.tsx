import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Sparkles, FileText, GraduationCap, User } from 'lucide-react'
import { cn } from '../../lib/utils'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { path: '/', label: 'Accueil', icon: <Home className="w-6 h-6" /> },
  { path: '/funfacts', label: 'Fun Facts', icon: <Sparkles className="w-6 h-6" /> },
  { path: '/notes', label: 'Revision', icon: <FileText className="w-6 h-6" /> },
  { path: '/flashcards', label: 'Flashcards', icon: <GraduationCap className="w-6 h-6" /> },
  { path: '/profile', label: 'Profil', icon: <User className="w-6 h-6" /> }
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-genius-card/95 backdrop-blur-xl border-t border-genius-border safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full',
                'transition-colors duration-200',
                isActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-10 h-1 bg-primary-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {item.icon}
              </motion.div>

              <span className={cn(
                'text-[10px] mt-0.5 font-medium',
                isActive ? 'text-primary-400' : 'text-gray-500'
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
