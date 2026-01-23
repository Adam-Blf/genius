/**
 * Content Service for Genius App
 * Aggregates content from multiple sources: APIs, LLM, and local
 */

import type { TriviaQuestion } from './apis'
import { fetchTriviaQuestions, fetchTriviaCategories, apiService } from './apis'

const { fallbackTrivia } = apiService
import type { GeneratedQuestion, GeneratedCategory, LLMConfig } from '../types/llm'
import { generateQuestions, generateCategories } from './llmService'

// ============================================
// TYPES
// ============================================

export interface ContentCategory {
  id: string
  name: string
  description: string
  iconName: string
  color: string
  subcategories: string[]
  source: 'api' | 'llm' | 'local'
  apiCategoryId?: number
  questionCount: number
}

export interface ContentQuestion {
  id: string
  question: string
  correctAnswer: string
  incorrectAnswers: string[]
  explanation?: string
  category: string
  categoryId: string
  difficulty: 'easy' | 'medium' | 'hard'
  source: 'api' | 'llm' | 'local'
}

// ============================================
// DEFAULT LOCAL CATEGORIES
// ============================================

export const LOCAL_CATEGORIES: ContentCategory[] = [
  {
    id: 'local-history',
    name: 'Histoire',
    description: 'Voyagez a travers les ages et les civilisations',
    iconName: 'scroll',
    color: 'from-amber-500 to-orange-600',
    subcategories: ['Antiquite', 'Moyen Age', 'Renaissance', 'Moderne', 'Contemporain'],
    source: 'local',
    questionCount: 50
  },
  {
    id: 'local-science',
    name: 'Sciences',
    description: 'Physique, chimie, biologie et plus encore',
    iconName: 'flask',
    color: 'from-green-500 to-emerald-600',
    subcategories: ['Physique', 'Chimie', 'Biologie', 'Astronomie', 'Medecine'],
    source: 'local',
    questionCount: 50
  },
  {
    id: 'local-geography',
    name: 'Geographie',
    description: 'Explorez le monde et ses merveilles',
    iconName: 'globe',
    color: 'from-blue-500 to-cyan-600',
    subcategories: ['Capitales', 'Pays', 'Fleuves', 'Montagnes', 'Oceans'],
    source: 'local',
    questionCount: 50
  },
  {
    id: 'local-arts',
    name: 'Arts',
    description: 'Peinture, musique, cinema et litterature',
    iconName: 'palette',
    color: 'from-purple-500 to-pink-600',
    subcategories: ['Peinture', 'Musique', 'Cinema', 'Litterature', 'Architecture'],
    source: 'local',
    questionCount: 30
  },
  {
    id: 'local-sports',
    name: 'Sports',
    description: 'Football, tennis, JO et records',
    iconName: 'trophy',
    color: 'from-red-500 to-rose-600',
    subcategories: ['Football', 'Tennis', 'JO', 'Athletisme', 'Sports Extremes'],
    source: 'local',
    questionCount: 30
  },
  {
    id: 'local-entertainment',
    name: 'Divertissement',
    description: 'Series, films, jeux video et pop culture',
    iconName: 'film',
    color: 'from-indigo-500 to-violet-600',
    subcategories: ['Series TV', 'Films', 'Jeux Video', 'Musique Pop', 'Celebrites'],
    source: 'local',
    questionCount: 30
  }
]

// Map Open Trivia DB categories to our local categories
const API_CATEGORY_MAP: Record<number, string> = {
  9: 'local-science', // General Knowledge -> Science
  17: 'local-science', // Science & Nature
  18: 'local-science', // Computers
  19: 'local-science', // Mathematics
  20: 'local-arts', // Mythology
  21: 'local-sports', // Sports
  22: 'local-geography', // Geography
  23: 'local-history', // History
  24: 'local-arts', // Politics
  25: 'local-arts', // Art
  26: 'local-arts', // Celebrities
  27: 'local-entertainment', // Animals
  28: 'local-entertainment', // Vehicles
  29: 'local-entertainment', // Comics
  30: 'local-science', // Gadgets
  31: 'local-entertainment', // Anime
  32: 'local-entertainment' // Cartoons
}

// ============================================
// CONTENT STORE (LOCAL CACHE)
// ============================================

const CONTENT_STORE_KEY = 'genius_content_store_v1'

interface ContentStore {
  categories: ContentCategory[]
  generatedQuestions: ContentQuestion[]
  lastRefresh: string
  version: number
}

const DEFAULT_CONTENT_STORE: ContentStore = {
  categories: LOCAL_CATEGORIES,
  generatedQuestions: [],
  lastRefresh: new Date().toISOString(),
  version: 1
}

function loadContentStore(): ContentStore {
  try {
    const saved = localStorage.getItem(CONTENT_STORE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...DEFAULT_CONTENT_STORE,
        ...parsed,
        categories: [...LOCAL_CATEGORIES, ...(parsed.customCategories || [])]
      }
    }
  } catch (e) {
    console.error('Failed to load content store:', e)
  }
  return DEFAULT_CONTENT_STORE
}

function saveContentStore(store: ContentStore): void {
  try {
    localStorage.setItem(CONTENT_STORE_KEY, JSON.stringify(store))
  } catch (e) {
    console.error('Failed to save content store:', e)
  }
}

let contentStore = loadContentStore()

// ============================================
// CATEGORY FUNCTIONS
// ============================================

export async function getAllCategories(): Promise<ContentCategory[]> {
  return contentStore.categories
}

export async function fetchAndMergeApiCategories(): Promise<ContentCategory[]> {
  try {
    const apiCategories = await fetchTriviaCategories()

    // Create new categories from API that don't exist locally
    const newCategories: ContentCategory[] = []

    for (const apiCat of apiCategories) {
      // Skip if already mapped to a local category
      if (API_CATEGORY_MAP[apiCat.id]) continue

      // Check if we already have this category
      const exists = contentStore.categories.some(
        c => c.apiCategoryId === apiCat.id || c.name.toLowerCase() === apiCat.name.toLowerCase()
      )

      if (!exists) {
        newCategories.push({
          id: `api-${apiCat.id}`,
          name: apiCat.name,
          description: `Questions de trivia sur ${apiCat.name}`,
          iconName: 'help-circle',
          color: 'from-gray-500 to-slate-600',
          subcategories: [],
          source: 'api',
          apiCategoryId: apiCat.id,
          questionCount: 0
        })
      }
    }

    if (newCategories.length > 0) {
      contentStore = {
        ...contentStore,
        categories: [...contentStore.categories, ...newCategories],
        lastRefresh: new Date().toISOString()
      }
      saveContentStore(contentStore)
    }

    return contentStore.categories
  } catch (e) {
    console.error('Failed to fetch API categories:', e)
    return contentStore.categories
  }
}

export async function generateAndAddCategories(
  llmConfig: LLMConfig,
  count: number = 5,
  theme?: string
): Promise<ContentCategory[]> {
  try {
    const existingNames = contentStore.categories.map(c => c.name)
    const generated = await generateCategories(llmConfig, {
      count,
      theme,
      existingCategories: existingNames
    })

    const newCategories: ContentCategory[] = generated.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      iconName: g.iconName,
      color: g.color,
      subcategories: g.subcategories,
      source: 'llm' as const,
      questionCount: 0
    }))

    contentStore = {
      ...contentStore,
      categories: [...contentStore.categories, ...newCategories],
      lastRefresh: new Date().toISOString()
    }
    saveContentStore(contentStore)

    return newCategories
  } catch (e) {
    console.error('Failed to generate categories:', e)
    throw e
  }
}

// ============================================
// QUESTION FUNCTIONS
// ============================================

export async function getQuestionsForCategory(
  categoryId: string,
  count: number = 10,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<ContentQuestion[]> {
  const questions: ContentQuestion[] = []
  const category = contentStore.categories.find(c => c.id === categoryId)

  if (!category) {
    throw new Error(`Category ${categoryId} not found`)
  }

  // First, try to get cached generated questions
  const cached = contentStore.generatedQuestions.filter(
    q => q.categoryId === categoryId && (!difficulty || q.difficulty === difficulty)
  )

  if (cached.length >= count) {
    // Shuffle and return
    return shuffleArray(cached).slice(0, count)
  }

  // If category has API ID, fetch from API
  if (category.apiCategoryId || category.source === 'api') {
    try {
      const apiQuestions = await fetchTriviaQuestions(count, difficulty)
      const converted = apiQuestions.map((q, i) => convertApiQuestion(q, category, i))
      questions.push(...converted)
    } catch (e) {
      console.error('Failed to fetch API questions:', e)
    }
  }

  // Add cached questions
  questions.push(...cached)

  // Shuffle and deduplicate
  const seen = new Set<string>()
  const unique = questions.filter(q => {
    const key = q.question.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return shuffleArray(unique).slice(0, count)
}

export async function generateQuestionsForCategory(
  llmConfig: LLMConfig,
  categoryId: string,
  count: number = 10,
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed',
  subcategory?: string
): Promise<ContentQuestion[]> {
  const category = contentStore.categories.find(c => c.id === categoryId)

  if (!category) {
    throw new Error(`Category ${categoryId} not found`)
  }

  try {
    const generated = await generateQuestions(llmConfig, {
      category: category.name,
      subcategory,
      difficulty,
      count
    })

    const questions: ContentQuestion[] = generated.map(g => ({
      id: g.id,
      question: g.question,
      correctAnswer: g.correctAnswer,
      incorrectAnswers: g.incorrectAnswers,
      explanation: g.explanation,
      category: category.name,
      categoryId: category.id,
      difficulty: g.difficulty,
      source: 'llm' as const
    }))

    // Cache generated questions
    contentStore = {
      ...contentStore,
      generatedQuestions: [...contentStore.generatedQuestions, ...questions].slice(-500), // Keep last 500
      lastRefresh: new Date().toISOString()
    }
    saveContentStore(contentStore)

    // Update category question count
    const categoryIndex = contentStore.categories.findIndex(c => c.id === categoryId)
    if (categoryIndex >= 0) {
      contentStore.categories[categoryIndex].questionCount += questions.length
    }

    return questions
  } catch (e) {
    console.error('Failed to generate questions:', e)
    throw e
  }
}

// ============================================
// MIXED CONTENT (API + LLM + LOCAL)
// ============================================

export async function getMixedQuestions(
  llmConfig: LLMConfig | null,
  count: number = 10,
  categoryId?: string,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<ContentQuestion[]> {
  const questions: ContentQuestion[] = []
  const targetPerSource = Math.ceil(count / 3)

  // 1. Try API questions
  try {
    const apiQuestions = await fetchTriviaQuestions(targetPerSource, difficulty)
    const category = categoryId
      ? contentStore.categories.find(c => c.id === categoryId)
      : contentStore.categories[0]

    questions.push(...apiQuestions.map((q, i) => convertApiQuestion(q, category!, i)))
  } catch (e) {
    console.error('API questions failed:', e)
  }

  // 2. Try LLM questions if configured
  if (llmConfig && llmConfig.provider !== 'none') {
    try {
      const category = categoryId
        ? contentStore.categories.find(c => c.id === categoryId)
        : contentStore.categories[Math.floor(Math.random() * LOCAL_CATEGORIES.length)]

      const generated = await generateQuestions(llmConfig, {
        category: category?.name || 'Culture Generale',
        difficulty: difficulty || 'mixed',
        count: targetPerSource
      })

      questions.push(...generated.map(g => ({
        id: g.id,
        question: g.question,
        correctAnswer: g.correctAnswer,
        incorrectAnswers: g.incorrectAnswers,
        explanation: g.explanation,
        category: category?.name || 'Culture Generale',
        categoryId: category?.id || 'local-science',
        difficulty: g.difficulty,
        source: 'llm' as const
      })))
    } catch (e) {
      console.error('LLM questions failed:', e)
    }
  }

  // 3. Add local/cached questions if needed
  const remaining = count - questions.length
  if (remaining > 0) {
    const cached = contentStore.generatedQuestions
      .filter(q => !categoryId || q.categoryId === categoryId)
      .filter(q => !difficulty || q.difficulty === difficulty)

    questions.push(...shuffleArray(cached).slice(0, remaining))
  }

  // 4. Fallback to hardcoded trivia if still not enough
  if (questions.length < count) {
    const fallback = fallbackTrivia.slice(0, count - questions.length)
    questions.push(...fallback.map((q: TriviaQuestion, i: number) => ({
      id: q.id,
      question: q.question,
      correctAnswer: q.correctAnswer,
      incorrectAnswers: q.incorrectAnswers,
      category: q.category,
      categoryId: 'local-science',
      difficulty: q.difficulty,
      source: 'local' as const
    })))
  }

  return shuffleArray(questions).slice(0, count)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function convertApiQuestion(
  q: TriviaQuestion,
  category: ContentCategory,
  index: number
): ContentQuestion {
  return {
    id: `api-${Date.now()}-${index}`,
    question: q.question,
    correctAnswer: q.correctAnswer,
    incorrectAnswers: q.incorrectAnswers,
    category: q.category || category.name,
    categoryId: category.id,
    difficulty: q.difficulty,
    source: 'api'
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ============================================
// STATS
// ============================================

export function getContentStats(): {
  totalCategories: number
  localCategories: number
  apiCategories: number
  llmCategories: number
  cachedQuestions: number
  lastRefresh: string
} {
  const local = contentStore.categories.filter(c => c.source === 'local').length
  const api = contentStore.categories.filter(c => c.source === 'api').length
  const llm = contentStore.categories.filter(c => c.source === 'llm').length

  return {
    totalCategories: contentStore.categories.length,
    localCategories: local,
    apiCategories: api,
    llmCategories: llm,
    cachedQuestions: contentStore.generatedQuestions.length,
    lastRefresh: contentStore.lastRefresh
  }
}

export function clearGeneratedContent(): void {
  contentStore = {
    ...contentStore,
    generatedQuestions: [],
    categories: LOCAL_CATEGORIES
  }
  saveContentStore(contentStore)
}

// ============================================
// EXPORT
// ============================================

export const contentService = {
  getAllCategories,
  fetchAndMergeApiCategories,
  generateAndAddCategories,
  getQuestionsForCategory,
  generateQuestionsForCategory,
  getMixedQuestions,
  getContentStats,
  clearGeneratedContent
}

export default contentService
