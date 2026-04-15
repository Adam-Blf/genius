export interface Chapter {
  id: string
  order: number
  title: string
  subtitle: string
  emoji: string
  cardUids: string[] // references flashcards by uid
}

// Linear roadmap · each chapter has ~8-10 cards, completion at 8/10 correct
export const CHAPTERS: Chapter[] = [
  {
    id: 'ch-1',
    order: 1,
    title: 'Les fondamentaux',
    subtitle: 'Tout commence ici',
    emoji: '🌱',
    cardUids: ['d4', 'd3', 's1', 'g5', 'sp1', 'd2', 'g4', 'h4'],
  },
  {
    id: 'ch-2',
    order: 2,
    title: 'Histoire ancienne',
    subtitle: 'Des pharaons a la Renaissance',
    emoji: '📜',
    cardUids: ['h3', 'h7', 'h8', 'h10', 'h2', 'h5', 'a1', 'h9'],
  },
  {
    id: 'ch-3',
    order: 3,
    title: 'Sciences et nature',
    subtitle: 'Cosmos et vivant',
    emoji: '🔬',
    cardUids: ['s1', 's2', 's4', 's6', 's7', 's9', 's10', 's3'],
  },
  {
    id: 'ch-4',
    order: 4,
    title: 'Le monde moderne',
    subtitle: 'Geopolitique et societe',
    emoji: '🌍',
    cardUids: ['g1', 'g2', 'g3', 'g8', 'g6', 'g7', 'g9', 'g10'],
  },
  {
    id: 'ch-5',
    order: 5,
    title: 'Arts et culture',
    subtitle: 'Creation et spectacle',
    emoji: '🎨',
    cardUids: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'],
  },
  {
    id: 'ch-6',
    order: 6,
    title: 'Sports et divertissement',
    subtitle: 'Terrain et scene',
    emoji: '⚽',
    cardUids: ['sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8'],
  },
  {
    id: 'ch-7',
    order: 7,
    title: 'Culture generale avancee',
    subtitle: 'Le boss final',
    emoji: '🏆',
    cardUids: ['h1', 'h6', 's5', 's8', 'a2', 'g3', 'd5', 'd7', 'd8', 'd6'],
  },
]

export function chapterState(
  chapter: Chapter,
  completedIds: Set<string>
): 'done' | 'current' | 'locked' {
  if (completedIds.has(chapter.id)) return 'done'
  // current = first chapter not done whose predecessor is done (or it's the first)
  const prev = CHAPTERS.find((c) => c.order === chapter.order - 1)
  if (!prev) return 'current'
  if (completedIds.has(prev.id)) return 'current'
  return 'locked'
}
