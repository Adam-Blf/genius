import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Inbox,
  BookOpen,
  Trophy,
  Heart,
  Star,
  FolderOpen,
  MessageCircle,
  Bell,
  Bookmark,
  Users,
  FileText
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

type EmptyStateVariant =
  | 'search'
  | 'inbox'
  | 'content'
  | 'achievements'
  | 'favorites'
  | 'stars'
  | 'folder'
  | 'messages'
  | 'notifications'
  | 'bookmarks'
  | 'friends'
  | 'documents'
  | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

const variantConfig: Record<
  Exclude<EmptyStateVariant, 'custom'>,
  { icon: ReactNode; title: string; description: string }
> = {
  search: {
    icon: <Search />,
    title: 'Aucun resultat',
    description: 'Essaie de modifier ta recherche ou d\'utiliser d\'autres mots-cles.',
  },
  inbox: {
    icon: <Inbox />,
    title: 'Boite vide',
    description: 'Tu n\'as pas encore de messages. Ils apparaitront ici.',
  },
  content: {
    icon: <BookOpen />,
    title: 'Pas de contenu',
    description: 'Il n\'y a rien ici pour l\'instant. Reviens plus tard !',
  },
  achievements: {
    icon: <Trophy />,
    title: 'Pas encore de succes',
    description: 'Continue a apprendre pour debloquer tes premiers trophees !',
  },
  favorites: {
    icon: <Heart />,
    title: 'Pas de favoris',
    description: 'Ajoute des elements a tes favoris pour les retrouver facilement.',
  },
  stars: {
    icon: <Star />,
    title: 'Pas d\'evaluations',
    description: 'Tu n\'as pas encore evalue de contenu.',
  },
  folder: {
    icon: <FolderOpen />,
    title: 'Dossier vide',
    description: 'Ce dossier ne contient aucun element.',
  },
  messages: {
    icon: <MessageCircle />,
    title: 'Pas de messages',
    description: 'Tes conversations apparaitront ici.',
  },
  notifications: {
    icon: <Bell />,
    title: 'Aucune notification',
    description: 'Tu es a jour ! Pas de nouvelles notifications.',
  },
  bookmarks: {
    icon: <Bookmark />,
    title: 'Pas de signets',
    description: 'Sauvegarde des faits pour les retrouver ici.',
  },
  friends: {
    icon: <Users />,
    title: 'Pas encore d\'amis',
    description: 'Invite tes amis a rejoindre Genius !',
  },
  documents: {
    icon: <FileText />,
    title: 'Pas de documents',
    description: 'Tes documents apparaitront ici.',
  },
};

export function EmptyState({
  variant = 'content',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  const config = variant !== 'custom' ? variantConfig[variant] : null;

  const displayIcon = icon || config?.icon;
  const displayTitle = title || config?.title || 'Rien a afficher';
  const displayDescription = description || config?.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className
      )}
    >
      {/* Icon */}
      {displayIcon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className={cn(
            'flex items-center justify-center rounded-full bg-slate-800/50 mb-4',
            compact ? 'w-12 h-12' : 'w-20 h-20'
          )}
        >
          <div
            className={cn(
              'text-slate-500',
              compact ? '[&>svg]:w-6 [&>svg]:h-6' : '[&>svg]:w-10 [&>svg]:h-10'
            )}
          >
            {displayIcon}
          </div>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={cn(
          'font-bold text-white',
          compact ? 'text-base' : 'text-xl mb-2'
        )}
      >
        {displayTitle}
      </motion.h3>

      {/* Description */}
      {displayDescription && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'text-slate-400 max-w-sm',
            compact ? 'text-sm mt-1' : 'text-base mb-6'
          )}
        >
          {displayDescription}
        </motion.p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && !compact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {action && (
            <Button variant="genius" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Ralph-themed empty state
interface RalphEmptyStateProps extends Omit<EmptyStateProps, 'icon'> {
  mood?: 'happy' | 'thinking' | 'surprised' | 'encouraging';
}

export function RalphEmptyState({
  mood = 'encouraging',
  ...props
}: RalphEmptyStateProps) {
  const moodAnimations = {
    happy: {
      animate: { y: [0, -5, 0], rotate: [0, 3, -3, 0] },
      transition: { duration: 2, repeat: Infinity },
    },
    thinking: {
      animate: { rotate: [-5, 5, -5] },
      transition: { duration: 3, repeat: Infinity },
    },
    surprised: {
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 },
    },
    encouraging: {
      animate: { y: [0, -10, 0] },
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  return (
    <EmptyState
      {...props}
      icon={
        <motion.img
          src="/ralph.png"
          alt="Ralph"
          className="w-full h-full object-contain"
          {...moodAnimations[mood]}
        />
      }
    />
  );
}

// Error state
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Oups ! Une erreur s\'est produite',
  description = 'Quelque chose s\'est mal passe. Veuillez reessayer.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
        className="w-16 h-16 flex items-center justify-center rounded-full bg-[#FF5252]/20 mb-4"
      >
        <span className="text-4xl">!</span>
      </motion.div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-sm">{description}</p>

      {onRetry && (
        <Button variant="danger" onClick={onRetry}>
          Reessayer
        </Button>
      )}
    </motion.div>
  );
}
