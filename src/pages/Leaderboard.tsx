import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Crown, Medal, Award } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { cn } from '../lib/utils'

interface LeaderboardUser {
  id: string
  rank: number
  name: string
  avatar: string
  xp: number
  isCurrentUser?: boolean
}

const mockLeagueData: LeaderboardUser[] = [
  { id: '1', rank: 1, name: 'Marie_Quiz', avatar: '👩', xp: 2450 },
  { id: '2', rank: 2, name: 'QuizMaster42', avatar: '🧔', xp: 2320 },
  { id: '3', rank: 3, name: 'BrainGenius', avatar: '🧠', xp: 2180 },
  { id: '4', rank: 4, name: 'Toi', avatar: '🦸', xp: 1850, isCurrentUser: true },
  { id: '5', rank: 5, name: 'CulturePro', avatar: '📚', xp: 1720 },
  { id: '6', rank: 6, name: 'SmartCookie', avatar: '🍪', xp: 1650 },
  { id: '7', rank: 7, name: 'HistoryBuff', avatar: '🏛️', xp: 1580 },
  { id: '8', rank: 8, name: 'ScienceNerd', avatar: '🔬', xp: 1450 },
  { id: '9', rank: 9, name: 'GeoExpert', avatar: '🌍', xp: 1320 },
  { id: '10', rank: 10, name: 'ArtLover', avatar: '🎨', xp: 1200 }
]

const mockFriendsData: LeaderboardUser[] = [
  { id: '1', rank: 1, name: 'Alex', avatar: '😎', xp: 3200 },
  { id: '2', rank: 2, name: 'Toi', avatar: '🦸', xp: 1850, isCurrentUser: true },
  { id: '3', rank: 3, name: 'Sophie', avatar: '👩‍🎓', xp: 1500 },
  { id: '4', rank: 4, name: 'Lucas', avatar: '🧑‍💻', xp: 980 }
]

const leagues = [
  { name: 'Bronze', icon: '🥉', color: 'from-amber-700 to-amber-900', minXp: 0 },
  { name: 'Argent', icon: '🥈', color: 'from-gray-400 to-gray-600', minXp: 500 },
  { name: 'Or', icon: '🥇', color: 'from-yellow-400 to-amber-500', minXp: 1500 },
  { name: 'Diamant', icon: '💎', color: 'from-cyan-400 to-blue-500', minXp: 3000 },
  { name: 'Master', icon: '👑', color: 'from-purple-400 to-pink-500', minXp: 5000 }
]

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'league' | 'friends'>('league')
  const currentLeague = leagues[0] // Bronze for demo

  const data = activeTab === 'league' ? mockLeagueData : mockFriendsData

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />
      case 2: return <Medal className="w-5 h-5 text-gray-400" />
      case 3: return <Award className="w-5 h-5 text-amber-600" />
      default: return <span className="text-gray-500 font-bold">{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-genius-bg pb-20 pt-16">
      <TopBar />

      <div className="p-4 max-w-lg mx-auto">
        {/* League header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${currentLeague.color} mb-3`}>
            <span className="text-4xl">{currentLeague.icon}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Ligue {currentLeague.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Top 10 monte en Ligue Argent
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('league')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
              activeTab === 'league'
                ? 'bg-primary-600 text-white'
                : 'bg-genius-card text-gray-400 hover:text-white'
            )}
          >
            <Trophy className="w-5 h-5" />
            Ligue
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
              activeTab === 'friends'
                ? 'bg-primary-600 text-white'
                : 'bg-genius-card text-gray-400 hover:text-white'
            )}
          >
            <Users className="w-5 h-5" />
            Amis
          </button>
        </div>

        {/* Leaderboard list */}
        <Card variant="default" padding="none" className="overflow-hidden">
          {data.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center gap-3 p-4 border-b border-genius-border last:border-b-0',
                user.isCurrentUser && 'bg-primary-500/10'
              )}
            >
              {/* Rank */}
              <div className="w-8 h-8 flex items-center justify-center">
                {getRankIcon(user.rank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-genius-card flex items-center justify-center text-xl">
                {user.avatar}
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className={cn(
                  'font-semibold',
                  user.isCurrentUser ? 'text-primary-400' : 'text-white'
                )}>
                  {user.name}
                  {user.isCurrentUser && ' (toi)'}
                </p>
              </div>

              {/* XP */}
              <Badge variant="xp" size="sm">
                {user.xp.toLocaleString()} XP
              </Badge>
            </motion.div>
          ))}
        </Card>

        {/* Time remaining */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-gray-500 text-sm">
            La ligue se termine dans <span className="text-white font-semibold">3j 14h</span>
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
