import { Avatar, ProgressBar, StreakProgress } from '@/components/atoms'
import { Card, CardHeader, CardContent, CategoryRadar, BadgeGrid } from '@/components/molecules'
import { TabBar } from '@/components/organisms'
import {
  useUserName,
  useTotalXp,
  useCurrentStreak,
  useLongestStreak,
  useTotalStats,
  useCategoryRadarData,
  useBadgeStats,
} from '@/store'
import { getLevel, LEVEL_THRESHOLDS } from '@/types'

export function Stats() {
  const userName = useUserName()
  const totalXp = useTotalXp()
  const currentStreak = useCurrentStreak()
  const longestStreak = useLongestStreak()
  const totalStats = useTotalStats()
  const categoryRadarData = useCategoryRadarData()
  const badgeStats = useBadgeStats()
  const level = getLevel(totalXp)

  // Calculate XP progress within current level
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0
  const nextLevelXp = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const xpInLevel = totalXp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp
  const levelProgress = xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 100

  return (
    <div className="min-h-screen bg-background p-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={userName || 'User'} size="lg" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">{userName || 'Swiper'}</h1>
          <p className="text-text-secondary">Niveau {level}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{totalXp}</p>
          <p className="text-xs text-text-muted">XP total</p>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-secondary">Niveau {level}</span>
            <span className="text-text-muted">
              {xpInLevel} / {xpNeeded} XP
            </span>
          </div>
          <ProgressBar value={levelProgress} variant="gradient" size="md" />
          <p className="text-xs text-text-muted text-center mt-2">
            Encore {xpNeeded - xpInLevel} XP pour le niveau {level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <StreakProgress current={currentStreak} longest={longestStreak} />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="p-3 rounded-xl bg-surface text-center">
          <p className="text-lg font-bold text-success">{totalStats.known}</p>
          <p className="text-[10px] text-text-muted">Connues</p>
        </div>
        <div className="p-3 rounded-xl bg-surface text-center">
          <p className="text-lg font-bold text-error">{totalStats.learned}</p>
          <p className="text-[10px] text-text-muted">À réviser</p>
        </div>
        <div className="p-3 rounded-xl bg-surface text-center">
          <p className="text-lg font-bold text-primary">{totalStats.totalCards}</p>
          <p className="text-[10px] text-text-muted">Total</p>
        </div>
        <div className="p-3 rounded-xl bg-surface text-center">
          <p className="text-lg font-bold text-warning">{totalStats.toReview}</p>
          <p className="text-[10px] text-text-muted">File</p>
        </div>
      </div>

      {/* Category Radar */}
      <Card className="mb-4">
        <CardHeader title="Maîtrise par catégorie" />
        <CardContent>
          <div className="flex justify-center">
            <CategoryRadar data={categoryRadarData} size={220} />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="mb-4">
        <CardHeader
          title="Badges"
          subtitle={
            badgeStats.totalCards > 0
              ? 'Continue pour en débloquer !'
              : 'Swipe pour débloquer des badges'
          }
        />
        <CardContent>
          <BadgeGrid stats={badgeStats} showLocked={true} />
        </CardContent>
      </Card>

      {/* Tab Bar */}
      <TabBar />
    </div>
  )
}
