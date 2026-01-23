/**
 * LLM Types for Genius App
 * Integration with Open Source LLMs
 */

// ============================================
// PROVIDER CONFIGURATION
// ============================================

export type LLMProvider = 'huggingface' | 'groq' | 'together' | 'ollama' | 'openrouter' | 'none'

export interface LLMConfig {
  provider: LLMProvider
  apiKey?: string
  model?: string
  baseUrl?: string // For Ollama self-hosted
  temperature?: number
  maxTokens?: number
}

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'huggingface',
  model: 'mistralai/Mistral-7B-Instruct-v0.3',
  temperature: 0.7,
  maxTokens: 2048
}

// Provider-specific models
export const LLM_MODELS: Record<LLMProvider, { id: string; name: string; description: string }[]> = {
  huggingface: [
    { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B', description: 'Gratuit, rapide et performant' },
    { id: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B', description: 'Gratuit, modele compact' },
    { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', description: 'Gratuit, haute qualite' },
    { id: 'microsoft/Phi-3-mini-4k-instruct', name: 'Phi 3 Mini', description: 'Gratuit, tres rapide' }
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Best quality, fast' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Very fast, good quality' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Good for complex tasks' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google model, balanced' }
  ],
  together: [
    { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', name: 'Llama 3.1 70B', description: 'Best quality' },
    { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', name: 'Llama 3.1 8B', description: 'Fast and efficient' },
    { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'Good balance' }
  ],
  ollama: [
    { id: 'llama3.2', name: 'Llama 3.2', description: 'Local model' },
    { id: 'mistral', name: 'Mistral', description: 'Local model' },
    { id: 'phi3', name: 'Phi 3', description: 'Small but capable' }
  ],
  openrouter: [
    { id: 'meta-llama/llama-3.1-70b-instruct:free', name: 'Llama 3.1 70B (Free)', description: 'Free tier' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', description: 'Free tier' }
  ],
  none: []
}

// ============================================
// REQUEST / RESPONSE TYPES
// ============================================

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMRequest {
  messages: LLMMessage[]
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export interface LLMResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model?: string
  finishReason?: 'stop' | 'length' | 'error'
}

// ============================================
// GENERATION TYPES
// ============================================

export interface GeneratedQuestion {
  id: string
  question: string
  correctAnswer: string
  incorrectAnswers: string[]
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  subcategory?: string
  source: 'llm' | 'api' | 'local'
  generatedAt: string
}

export interface GeneratedCategory {
  id: string
  name: string
  description: string
  iconName: string
  color: string
  subcategories: string[]
  questionCount: number
  source: 'llm' | 'api' | 'local'
}

export interface GeneratedFlashcard {
  id: string
  question: string
  answer: string
  hints?: string[]
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

// ============================================
// PROMPT TEMPLATES
// ============================================

export const SYSTEM_PROMPTS = {
  questionGenerator: `Tu es un expert en creation de questions de quiz educatif pour une application mobile francaise.
Tu generes des questions de culture generale de haute qualite avec des reponses precises et des explications claires.
IMPORTANT: Reponds UNIQUEMENT en JSON valide, sans markdown ni texte supplementaire.`,

  categoryGenerator: `Tu es un expert en education qui cree des categories de quiz interessantes et diversifiees.
Tu proposes des categories originales avec des descriptions engageantes.
IMPORTANT: Reponds UNIQUEMENT en JSON valide, sans markdown ni texte supplementaire.`,

  flashcardGenerator: `Tu es un expert en pedagogie qui transforme des notes en flashcards efficaces.
Tu utilises les techniques de memorisation comme la repetition espacee et les indices mnemoniques.
IMPORTANT: Reponds UNIQUEMENT en JSON valide, sans markdown ni texte supplementaire.`,

  explanationGenerator: `Tu es un enseignant bienveillant qui explique des concepts de maniere simple et memorable.
Tu utilises des analogies et des exemples concrets.`
}

// ============================================
// GENERATION REQUESTS
// ============================================

export interface QuestionGenerationRequest {
  category: string
  subcategory?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  count: number
  language?: 'fr' | 'en'
  avoidTopics?: string[]
}

export interface CategoryGenerationRequest {
  theme?: string
  count: number
  existingCategories?: string[]
}

export interface FlashcardGenerationRequest {
  sourceText: string
  maxCards: number
  difficulty?: 'easy' | 'medium' | 'hard'
  focusTopics?: string[]
}

// ============================================
// ERROR TYPES
// ============================================

export class LLMError extends Error {
  constructor(
    message: string,
    public code: 'API_ERROR' | 'RATE_LIMIT' | 'INVALID_RESPONSE' | 'NETWORK_ERROR' | 'CONFIG_ERROR',
    public provider?: LLMProvider
  ) {
    super(message)
    this.name = 'LLMError'
  }
}

// ============================================
// CACHE TYPES
// ============================================

export interface LLMCacheEntry {
  key: string
  response: LLMResponse
  timestamp: number
  expiresAt: number
}

export const LLM_CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours
