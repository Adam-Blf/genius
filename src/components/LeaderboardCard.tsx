import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { cn } from '../lib/utils';

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank?: number;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showPodium?: boolean;
  className?: string;
}

export function LeaderboardCard({
  entries,
  title = 'Classement',
  showPodium = true,
  className,
}: LeaderboardCardProps) {
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className={cn('', className)}>
      {title && (
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          {title}
        </h2>
      )}

      {/* Podium for top 3 */}
      {showPodium && topThree.length === 3 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {/* 2nd place */}
          <PodiumSpot entry={topThree[1]} position={2} />
          {/* 1st place */}
          <PodiumSpot entry={topThree[0]} position={1} />
          {/* 3rd place */}
          <PodiumSpot entry={topThree[2]} position={3} />
        </div>
      )}

      {/* Rest of leaderboard */}
      <div className="space-y-2">
        {(showPodium ? rest : entries).map((entry, index) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

// Podium spot component
function PodiumSpot({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
}) {
  const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
  const colors = {
    1: 'from-amber-400 to-amber-600',
    2: 'from-slate-300 to-slate-500',
    3: 'from-amber-600 to-amber-800',
  };
  const icons = {
    1: Crown,
    2: Medal,
    3: Medal,
  };

  const Icon = icons[position];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: position * 0.1 }}
      className="flex flex-col items-center"
    >
      {/* Avatar and name */}
      <div className="relative mb-2">
        <Avatar
          src={entry.avatar}
          name={entry.name}
          size={position === 1 ? 'lg' : 'md'}
          bordered={position === 1}
        />
        {position === 1 && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Crown className="w-5 h-5 text-amber-400" />
          </motion.div>
        )}
      </div>
      <span className="text-xs font-medium text-white truncate max-w-16 text-center">
        {entry.name}
      </span>
      <span className="text-xs text-[#00E5FF]">{entry.xp.toLocaleString()} XP</span>

      {/* Podium stand */}
      <div
        className={cn(
          'mt-2 w-16 rounded-t-lg flex items-start justify-center pt-2',
          heights[position],
          `bg-gradient-to-b ${colors[position]}`
        )}
      >
        <div className="flex flex-col items-center">
          <Icon className={cn(
            'mb-1',
            position === 1 ? 'w-6 h-6 text-white' : 'w-5 h-5 text-white/80'
          )} />
          <span className="text-lg font-bold text-white">{position}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Leaderboard row component
function LeaderboardRow({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) {
  const rankChange = entry.previousRank
    ? entry.previousRank - entry.rank
    : 0;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-colors',
        entry.isCurrentUser
          ? 'bg-gradient-to-r from-[#0052D4]/20 to-[#4364F7]/20 border border-[#4364F7]/30'
          : 'bg-slate-800/50 hover:bg-slate-800'
      )}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center">
        <span
          className={cn(
            'font-bold',
            entry.rank <= 3 ? 'text-amber-400' : 'text-slate-400'
          )}
        >
          {entry.rank}
        </span>
      </div>

      {/* Rank change indicator */}
      <div className="w-5">
        {rankChange > 0 && (
          <TrendingUp className="w-4 h-4 text-green-500" />
        )}
        {rankChange < 0 && (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        {rankChange === 0 && entry.previousRank && (
          <Minus className="w-4 h-4 text-slate-600" />
        )}
      </div>

      {/* Avatar */}
      <Avatar
        src={entry.avatar}
        name={entry.name}
        size="sm"
        bordered={entry.isCurrentUser}
      />

      {/* Name and level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">
            {entry.name}
          </span>
          {entry.isCurrentUser && (
            <span className="text-xs text-[#00E5FF]">(Toi)</span>
          )}
        </div>
        <span className="text-xs text-slate-500">Niveau {entry.level}</span>
      </div>

      {/* Streak */}
      {entry.streak && entry.streak > 0 && (
        <div className="flex items-center gap-1 text-orange-400">
          <Sparkles className="w-3 h-3" />
          <span className="text-xs font-medium">{entry.streak}j</span>
        </div>
      )}

      {/* XP */}
      <div className="text-right">
        <span className="text-sm font-bold text-[#00E5FF]">
          {entry.xp.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500 ml-1">XP</span>
      </div>
    </motion.div>
  );
}

// Mini leaderboard for widgets
interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

export function MiniLeaderboard({
  entries,
  currentUserId,
  className,
}: MiniLeaderboardProps) {
  // Find current user's position
  const userIndex = entries.findIndex((e) => e.id === currentUserId);
  const displayEntries = entries.slice(0, 5);

  return (
    <div className={cn('space-y-1.5', className)}>
      {displayEntries.map((entry, index) => (
        <div
          key={entry.id}
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg',
            entry.id === currentUserId
              ? 'bg-[#4364F7]/20'
              : 'bg-slate-800/30'
          )}
        >
          <span
            className={cn(
              'w-5 text-center text-xs font-bold',
              index < 3 ? 'text-amber-400' : 'text-slate-500'
            )}
          >
            {entry.rank}
          </span>
          <Avatar src={entry.avatar} name={entry.name} size="xs" />
          <span className="flex-1 text-xs text-white truncate">
            {entry.name}
          </span>
          <span className="text-xs text-[#00E5FF] font-medium">
            {entry.xp >= 1000 ? `${(entry.xp / 1000).toFixed(1)}K` : entry.xp}
          </span>
        </div>
      ))}

      {userIndex > 4 && (
        <>
          <div className="text-center text-slate-600 text-xs py-1">...</div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#4364F7]/20">
            <span className="w-5 text-center text-xs font-bold text-slate-400">
              {entries[userIndex].rank}
            </span>
            <Avatar
              src={entries[userIndex].avatar}
              name={entries[userIndex].name}
              size="xs"
            />
            <span className="flex-1 text-xs text-white truncate">
              {entries[userIndex].name}
            </span>
            <span className="text-xs text-[#00E5FF] font-medium">
              {entries[userIndex].xp >= 1000
                ? `${(entries[userIndex].xp / 1000).toFixed(1)}K`
                : entries[userIndex].xp}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
