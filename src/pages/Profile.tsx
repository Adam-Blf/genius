/**
 * Profile Page - Genius App v3.0
 * Refonte complete avec stockage local flexible et nouvelles fonctionnalites
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Settings,
  Crown,
  Trophy,
  Target,
  LogOut,
  ChevronRight,
  Zap,
  Flame,
  Heart,
  Award,
  TrendingUp,
  Clock,
  Brain,
  Star,
  Lock,
  CheckCircle,
  BarChart3,
  FileText,
  MessageSquare,
  Database,
  Sparkles,
  Download,
  Upload,
  Edit2
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn, Pop } from '../components/transitions/PageTransition'
import { useFlashcards } from '../contexts/FlashcardContext'
import { useUserData } from '../contexts/UserDataContext'
import { formatNumber, cn } from '../lib/utils'
import { calculateLevel } from '../types/flashcards'

// Profile Section Components
import { NotesSection } from '../components/profile/NotesSection'
import { MemosSection } from '../components/profile/MemosSection'
import { CustomDataSection } from '../components/profile/CustomDataSection'
import { GoalsSection } from '../components/profile/GoalsSection'

// Badge display component
function BadgeItem({ badge, isLocked }: { badge: any; isLocked: boolean }) {
  const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-indigo-600',
    epic: 'from-purple-500 to-pink-600',
    legendary: 'from-amber-500 to-orange-600'
  }

  const rarityBorders = {
    common: 'border-gray-500/30',
    rare: 'border-blue-500/30',
    epic: 'border-purple-500/30',
    legendary: 'border-amber-500/30'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-3 rounded-xl border ${rarityBorders[badge.rarity as keyof typeof rarityBorders]} ${
        isLocked ? 'opacity-50 grayscale' : ''
      }`}
    >
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rarityColors[badge.rarity as keyof typeof rarityColors]} flex items-center justify-center text-2xl mx-auto mb-2 shadow-lg`}>
        {isLocked ? <Lock className="w-5 h-5 text-white/50" /> : badge.icon}
      </div>
      <p className="text-xs text-center text-white font-medium truncate">{badge.name}</p>
      {!isLocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-3 h-3 text-white" />
        </motion.div>
      )}
      {isLocked && (
        <div className="text-[10px] text-gray-500 text-center mt-1">
          {badge.progress}/{badge.requirement}
        </div>
      )}
    </motion.div>
  )
}

// Weekly XP Chart
function WeeklyXpChart({ data }: { data: number[] }) {
  const maxXp = Math.max(...data, 1)
  const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
  const today = new Date().getDay()

  return (
    <div className="flex items-end justify-between gap-2 h-24">
      {data.map((xp, index) => {
        const height = (xp / maxXp) * 100
        const isToday = index === today

        return (
          <div key={index} className="flex flex-col items-center gap-1 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(height, 5)}%` }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`w-full rounded-t-lg ${
                isToday
                  ? 'bg-gradient-to-t from-primary-500 to-secondary-500'
                  : 'bg-slate-700'
              }`}
            />
            <span className={`text-xs ${isToday ? 'text-primary-400 font-bold' : 'text-gray-500'}`}>
              {days[index]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Session history item
function SessionItem({ session }: { session: any }) {
  const percentage = Math.round((session.cardsCorrect / session.cardsStudied) * 100)
  const date = new Date(session.completedAt)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        percentage >= 80 ? 'bg-green-500/20 text-green-400' :
        percentage >= 50 ? 'bg-amber-500/20 text-amber-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {percentage >= 80 ? <Star className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{session.setTitle}</p>
        <p className="text-xs text-gray-500">
          {date.toLocaleDateString('fr-FR')} - {session.cardsStudied} cartes
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">{percentage}%</p>
        <p className="text-xs text-amber-400">+{session.xpEarned} XP</p>
      </div>
    </motion.div>
  )
}

type TabId = 'stats' | 'badges' | 'history' | 'notes' | 'memos' | 'data' | 'goals'

export function ProfilePage() {
  const navigate = useNavigate()
  const { gamification, stats, getRecentSessions, getUnlockedBadges, getNextBadges } = useFlashcards()
  const userData = useUserData()

  const [activeTab, setActiveTab] = useState<TabId>('stats')

  // Mock profile data - no auth needed
  const profile = {
    display_name: userData.profile.nickname || 'Genie',
    username: 'genius_user',
    avatar_url: null,
    is_premium: false,
    hearts: 5
  }

  const levelInfo = calculateLevel(gamification.totalXp)
  const xpProgress = (levelInfo.xpInLevel / levelInfo.xpForNextLevel) * 100

  const recentSessions = getRecentSessions(5)
  const unlockedBadges = getUnlockedBadges()
  const nextBadges = getNextBadges(3)

  const mainStats = [
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'XP Total',
      value: formatNumber(gamification.totalXp),
      color: 'text-amber-400 bg-amber-500/20'
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: 'Serie actuelle',
      value: `${gamification.currentStreak}j`,
      color: 'text-orange-400 bg-orange-500/20'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Cartes revisees',
      value: formatNumber(gamification.totalCardsReviewed),
      color: 'text-green-400 bg-green-500/20'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Badges',
      value: unlockedBadges.length.toString(),
      color: 'text-purple-400 bg-purple-500/20'
    }
  ]

  const menuItems = [
    {
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      label: 'Genius Plus',
      description: 'Vies illimitees, sans pub',
      onClick: () => navigate('/premium'),
      badge: 'PRO'
    },
    {
      icon: <Heart className="w-5 h-5 text-red-400" />,
      label: 'Recharger les vies',
      description: `${profile?.hearts || 5}/5 vies`,
      onClick: () => {}
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      label: 'IA Generation',
      description: 'Configurer le LLM',
      onClick: () => navigate('/settings')
    },
    {
      icon: <Settings className="w-5 h-5 text-gray-400" />,
      label: 'Parametres',
      description: 'Notifications, langue, etc.',
      onClick: () => navigate('/settings')
    }
  ]

  const handleSignOut = async () => {
    navigate('/')
  }

  const handleExport = () => {
    const data = userData.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `genius-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        const success = userData.importData(text)
        if (success) {
          alert('Donnees importees avec succes!')
        } else {
          alert('Erreur lors de l\'import')
        }
      }
    }
    input.click()
  }

  const tabs = [
    { id: 'stats' as TabId, label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'badges' as TabId, label: 'Badges', icon: <Award className="w-4 h-4" /> },
    { id: 'history' as TabId, label: 'Historique', icon: <Clock className="w-4 h-4" /> },
    { id: 'notes' as TabId, label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'memos' as TabId, label: 'Memos', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'goals' as TabId, label: 'Objectifs', icon: <Target className="w-4 h-4" /> },
    { id: 'data' as TabId, label: 'Donnees', icon: <Database className="w-4 h-4" /> }
  ]

  return (
    <div className="min-h-screen bg-genius-bg pb-20 pt-16">
      <TopBar />

      <div className="p-4 max-w-lg mx-auto">
        {/* Profile header - Enhanced */}
        <FadeIn>
          <div className="text-center mb-6 relative">
            {/* Background gradient effect */}
            <div className="absolute inset-0 -top-16 bg-gradient-to-b from-primary-500/10 via-genius-cyan/5 to-transparent blur-3xl" />

            <motion.div
              className="relative inline-block"
              whileHover={{ scale: 1.02 }}
            >
              {/* Animated ring around avatar */}
              <motion.div
                className="absolute -inset-2 rounded-full"
                style={{
                  background: 'linear-gradient(45deg, #0052D4, #4364F7, #6FB1FC, #00E5FF, #0052D4)',
                  backgroundSize: '400% 400%'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative w-28 h-28 rounded-full bg-genius-bg p-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : userData.profile.avatarEmoji ? (
                    <motion.span
                      className="text-5xl"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {userData.profile.avatarEmoji}
                    </motion.span>
                  ) : (
                    <img src="/ralph.png" alt="Ralph" className="w-20 h-20 object-contain" />
                  )}
                </div>
              </div>

              {/* Edit button */}
              <motion.button
                className="absolute bottom-0 right-0 w-9 h-9 bg-genius-cyan rounded-full flex items-center justify-center border-2 border-genius-bg shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/settings')}
              >
                <Edit2 className="w-4 h-4 text-white" />
              </motion.button>

              {/* Premium crown */}
              {profile?.is_premium && (
                <motion.div
                  className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </motion.div>

            <motion.h1
              className="text-2xl font-bold text-white mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {profile?.display_name || 'Genie'}
            </motion.h1>
            <motion.p
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              @{profile?.username || 'genius_user'}
            </motion.p>

            {/* Level and XP Progress - Enhanced */}
            <SlideUp delay={0.2}>
              <div className="mt-5 px-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-genius-cyan flex items-center justify-center shadow-lg shadow-primary-500/30"
                      animate={{ boxShadow: ['0 0 15px rgba(0, 82, 212, 0.3)', '0 0 25px rgba(0, 82, 212, 0.5)', '0 0 15px rgba(0, 82, 212, 0.3)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-white font-bold">{levelInfo.level}</span>
                    </motion.div>
                    <span className="text-white font-semibold">Niveau {levelInfo.level}</span>
                  </div>
                  <span className="text-genius-cyan text-sm font-medium">
                    {levelInfo.xpInLevel}/{levelInfo.xpForNextLevel} XP
                  </span>
                </div>

                {/* Enhanced progress bar */}
                <div className="relative">
                  <div className="w-full bg-slate-700/80 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(90deg, #0052D4, #4364F7, #6FB1FC, #00E5FF)'
                      }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                      />
                    </motion.div>
                  </div>

                  {/* XP label inside bar */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white/80">{Math.round(xpProgress)}%</span>
                  </div>
                </div>
              </div>
            </SlideUp>

            {/* Streak badge - Enhanced */}
            {gamification.currentStreak > 0 && (
              <Pop delay={0.3}>
                <div className="flex justify-center mt-4">
                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Flame className="w-5 h-5 text-orange-400" />
                    </motion.div>
                    <span className="text-orange-400 font-bold">{gamification.currentStreak} jours</span>
                    <span className="text-orange-400/70 text-sm">de serie</span>
                  </motion.div>
                </div>
              </Pop>
            )}
          </div>
        </FadeIn>

        {/* Stats grid - Enhanced */}
        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-2 gap-3 mb-6">
          {mainStats.map((stat, index) => (
            <StaggerItem key={stat.label}>
              <Card variant="default" padding="md" className="group relative overflow-hidden">
                {/* Hover gradient overlay */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity",
                  stat.color.replace('text-', 'bg-').replace('bg-', 'bg-gradient-to-br from-')
                )} />

                <motion.div
                  className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-2 relative`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {stat.icon}
                </motion.div>
                <motion.p
                  className="text-2xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Tabs - Scrollable & Enhanced */}
        <SlideUp delay={0.3}>
          <div className="mb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2 bg-genius-card/80 p-1.5 rounded-2xl min-w-max backdrop-blur-sm border border-genius-border/50">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-medium text-sm transition-all whitespace-nowrap",
                    activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="profileActiveTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.icon}
                    {tab.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </SlideUp>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Weekly XP */}
              <Card variant="default" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary-400" />
                    XP Cette Semaine
                  </h3>
                  <span className="text-primary-400 font-bold">
                    {gamification.weeklyXp.reduce((a, b) => a + b, 0)} XP
                  </span>
                </div>
                <WeeklyXpChart data={gamification.weeklyXp} />
              </Card>

              {/* Daily Goal */}
              <Card variant="default" padding="md">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  Objectif du jour
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Cartes revisees</span>
                      <span className="text-white text-sm font-medium">
                        {gamification.dailyGoal.cardsReviewed}/{gamification.dailyGoal.cardsToReview}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (gamification.dailyGoal.cardsReviewed / gamification.dailyGoal.cardsToReview) * 100)}%`
                        }}
                        className="h-2 rounded-full bg-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">XP gagne</span>
                      <span className="text-white text-sm font-medium">
                        {gamification.dailyGoal.xpEarned}/{gamification.dailyGoal.xpToEarn}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (gamification.dailyGoal.xpEarned / gamification.dailyGoal.xpToEarn) * 100)}%`
                        }}
                        className="h-2 rounded-full bg-amber-500"
                      />
                    </div>
                  </div>

                  {gamification.dailyGoal.completedAt && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center gap-2 bg-green-500/20 text-green-400 py-2 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Objectif atteint !
                    </motion.div>
                  )}
                </div>
              </Card>

              {/* Quick stats */}
              <Card variant="default" padding="md">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Sets crees</p>
                    <p className="text-xl font-bold text-white">{stats.totalSets}</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Cartes totales</p>
                    <p className="text-xl font-bold text-white">{stats.totalCards}</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Sessions parfaites</p>
                    <p className="text-xl font-bold text-white">{gamification.perfectSessions}</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Meilleure serie</p>
                    <p className="text-xl font-bold text-white">{gamification.longestStreak}j</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {unlockedBadges.length > 0 && (
                <Card variant="default" padding="md">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Badges debloques ({unlockedBadges.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {unlockedBadges.map((badge) => (
                      <BadgeItem key={badge.id} badge={badge} isLocked={false} />
                    ))}
                  </div>
                </Card>
              )}

              {nextBadges.length > 0 && (
                <Card variant="default" padding="md">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    Prochains badges
                  </h3>
                  <div className="space-y-3">
                    {nextBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl opacity-50">
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{badge.name}</p>
                          <p className="text-xs text-gray-400">{badge.description}</p>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                            <div
                              className="h-1.5 rounded-full bg-primary-500"
                              style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {badge.progress}/{badge.requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {unlockedBadges.length === 0 && nextBadges.length === 0 && (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Commence a reviser pour debloquer des badges !</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {recentSessions.length > 0 ? (
                <>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Sessions recentes
                  </h3>
                  {recentSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SessionItem session={session} />
                    </motion.div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Aucune session pour l'instant</p>
                  <Button
                    onClick={() => navigate('/flashcards')}
                    variant="primary"
                    size="md"
                    className="mt-4"
                  >
                    Commencer a reviser
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <NotesSection
                notes={userData.notes}
                onAddNote={userData.addNote}
                onUpdateNote={userData.updateNote}
                onDeleteNote={userData.deleteNote}
                onTogglePin={userData.toggleNotePin}
              />
            </motion.div>
          )}

          {activeTab === 'memos' && (
            <motion.div
              key="memos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <MemosSection
                memos={userData.memos}
                onAddMemo={userData.addMemo}
                onUpdateMemo={userData.updateMemo}
                onDeleteMemo={userData.deleteMemo}
                onToggleComplete={userData.toggleMemoComplete}
              />
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GoalsSection
                goals={userData.goals}
                onAddGoal={userData.addGoal}
                onUpdateGoal={userData.updateGoal}
                onDeleteGoal={userData.deleteGoal}
                onToggleMilestone={userData.toggleMilestone}
              />
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <CustomDataSection
                data={userData.customData}
                onAddData={userData.addCustomData}
                onUpdateData={userData.updateCustomData}
                onDeleteData={userData.deleteCustomData}
                getAllCategories={userData.getAllCategories}
              />

              {/* Export/Import Section */}
              <Card variant="default" padding="md">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-400" />
                  Sauvegarde
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExport}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Exporter
                  </Button>
                  <Button
                    onClick={handleImport}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    Importer
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 mt-6 mb-6"
        >
          {menuItems.map((item, index) => (
            <Card
              key={item.label}
              variant="default"
              padding="none"
              interactive
              onClick={item.onClick}
            >
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-genius-card flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{item.label}</p>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Sign out button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="lg"
            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
            leftIcon={<LogOut className="w-5 h-5" />}
          >
            Deconnexion
          </Button>
        </motion.div>

        {/* App version */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Genius v3.0 - Made with Ralph + IA
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
