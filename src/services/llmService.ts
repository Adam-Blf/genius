/**
 * LLM Service for Genius App
 * Handles all LLM API interactions
 */

import type {
  LLMConfig,
  LLMProvider,
  LLMRequest,
  LLMResponse,
  LLMMessage,
  LLMCacheEntry,
  LLM_CACHE_DURATION,
  GeneratedQuestion,
  GeneratedCategory,
  GeneratedFlashcard,
  QuestionGenerationRequest,
  CategoryGenerationRequest,
  FlashcardGenerationRequest
} from '../types/llm'
import { DEFAULT_LLM_CONFIG, SYSTEM_PROMPTS, LLMError } from '../types/llm'

// ============================================
// CACHE MANAGEMENT
// ============================================

const cache = new Map<string, LLMCacheEntry>()

function getCacheKey(request: LLMRequest): string {
  return btoa(JSON.stringify(request.messages))
}

function getCachedResponse(key: string): LLMResponse | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.response
}

function setCachedResponse(key: string, response: LLMResponse): void {
  cache.set(key, {
    key,
    response,
    timestamp: Date.now(),
    expiresAt: Date.now() + (1000 * 60 * 60 * 24) // 24 hours
  })
}

// ============================================
// API CALLS
// ============================================

async function callGroq(config: LLMConfig, request: LLMRequest): Promise<LLMResponse> {
  if (!config.apiKey) {
    throw new LLMError('Groq API key is required', 'CONFIG_ERROR', 'groq')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'llama-3.3-70b-versatile',
      messages: request.messages,
      temperature: request.temperature ?? config.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? config.maxTokens ?? 2048,
      response_format: request.jsonMode ? { type: 'json_object' } : undefined
    })
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new LLMError('Rate limit exceeded', 'RATE_LIMIT', 'groq')
    }
    throw new LLMError(`Groq API error: ${response.status}`, 'API_ERROR', 'groq')
  }

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    } : undefined,
    model: data.model,
    finishReason: data.choices[0]?.finish_reason
  }
}

async function callTogether(config: LLMConfig, request: LLMRequest): Promise<LLMResponse> {
  if (!config.apiKey) {
    throw new LLMError('Together API key is required', 'CONFIG_ERROR', 'together')
  }

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: request.messages,
      temperature: request.temperature ?? config.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? config.maxTokens ?? 2048
    })
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new LLMError('Rate limit exceeded', 'RATE_LIMIT', 'together')
    }
    throw new LLMError(`Together API error: ${response.status}`, 'API_ERROR', 'together')
  }

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    } : undefined,
    model: data.model,
    finishReason: data.choices[0]?.finish_reason
  }
}

async function callOllama(config: LLMConfig, request: LLMRequest): Promise<LLMResponse> {
  const baseUrl = config.baseUrl || 'http://localhost:11434'

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model || 'llama3.2',
      messages: request.messages,
      stream: false,
      options: {
        temperature: request.temperature ?? config.temperature ?? 0.7,
        num_predict: request.maxTokens ?? config.maxTokens ?? 2048
      }
    })
  })

  if (!response.ok) {
    throw new LLMError(`Ollama error: ${response.status}`, 'API_ERROR', 'ollama')
  }

  const data = await response.json()
  return {
    content: data.message?.content || '',
    model: data.model,
    finishReason: 'stop'
  }
}

async function callOpenRouter(config: LLMConfig, request: LLMRequest): Promise<LLMResponse> {
  if (!config.apiKey) {
    throw new LLMError('OpenRouter API key is required', 'CONFIG_ERROR', 'openrouter')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://genius-app.vercel.app',
      'X-Title': 'Genius Quiz App'
    },
    body: JSON.stringify({
      model: config.model || 'meta-llama/llama-3.1-70b-instruct:free',
      messages: request.messages,
      temperature: request.temperature ?? config.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? config.maxTokens ?? 2048
    })
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new LLMError('Rate limit exceeded', 'RATE_LIMIT', 'openrouter')
    }
    throw new LLMError(`OpenRouter API error: ${response.status}`, 'API_ERROR', 'openrouter')
  }

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens
    } : undefined,
    model: data.model,
    finishReason: data.choices[0]?.finish_reason
  }
}

// ============================================
// MAIN API FUNCTION
// ============================================

export async function callLLM(
  config: LLMConfig,
  request: LLMRequest,
  useCache: boolean = true
): Promise<LLMResponse> {
  // Check cache first
  if (useCache) {
    const cacheKey = getCacheKey(request)
    const cached = getCachedResponse(cacheKey)
    if (cached) {
      return cached
    }
  }

  // Call appropriate provider
  let response: LLMResponse

  try {
    switch (config.provider) {
      case 'groq':
        response = await callGroq(config, request)
        break
      case 'together':
        response = await callTogether(config, request)
        break
      case 'ollama':
        response = await callOllama(config, request)
        break
      case 'openrouter':
        response = await callOpenRouter(config, request)
        break
      default:
        throw new LLMError('No LLM provider configured', 'CONFIG_ERROR')
    }
  } catch (error) {
    if (error instanceof LLMError) throw error
    throw new LLMError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR',
      config.provider
    )
  }

  // Cache response
  if (useCache) {
    const cacheKey = getCacheKey(request)
    setCachedResponse(cacheKey, response)
  }

  return response
}

// ============================================
// QUESTION GENERATION
// ============================================

export async function generateQuestions(
  config: LLMConfig,
  request: QuestionGenerationRequest
): Promise<GeneratedQuestion[]> {
  const language = request.language || 'fr'
  const difficultyText = request.difficulty === 'mixed'
    ? 'un melange de facile, moyen et difficile'
    : request.difficulty

  const prompt = `Genere ${request.count} questions de quiz pour la categorie "${request.category}"${request.subcategory ? ` (sous-categorie: ${request.subcategory})` : ''}.
Difficulte: ${difficultyText}
Langue: ${language === 'fr' ? 'francais' : 'anglais'}

${request.avoidTopics?.length ? `Evite ces sujets: ${request.avoidTopics.join(', ')}` : ''}

Reponds avec un JSON contenant un tableau "questions" avec pour chaque question:
- question: le texte de la question
- correctAnswer: la bonne reponse
- incorrectAnswers: tableau de 3 mauvaises reponses plausibles
- explanation: explication courte de la reponse
- difficulty: "easy", "medium" ou "hard"

Exemple de format:
{"questions":[{"question":"...","correctAnswer":"...","incorrectAnswers":["...","...","..."],"explanation":"...","difficulty":"easy"}]}`

  const response = await callLLM(config, {
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.questionGenerator },
      { role: 'user', content: prompt }
    ],
    jsonMode: true,
    temperature: 0.8
  })

  try {
    // Clean potential markdown code blocks
    let content = response.content.trim()
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(content)
    const questions = parsed.questions || parsed

    return questions.map((q: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      question: q.question,
      correctAnswer: q.correctAnswer,
      incorrectAnswers: q.incorrectAnswers,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
      category: request.category,
      subcategory: request.subcategory,
      source: 'llm' as const,
      generatedAt: new Date().toISOString()
    }))
  } catch (error) {
    console.error('Failed to parse LLM response:', response.content)
    throw new LLMError('Failed to parse question response', 'INVALID_RESPONSE', config.provider)
  }
}

// ============================================
// CATEGORY GENERATION
// ============================================

export async function generateCategories(
  config: LLMConfig,
  request: CategoryGenerationRequest
): Promise<GeneratedCategory[]> {
  const prompt = `Genere ${request.count} categories de quiz originales et interessantes${request.theme ? ` autour du theme "${request.theme}"` : ''}.

${request.existingCategories?.length ? `Categories existantes a eviter: ${request.existingCategories.join(', ')}` : ''}

Reponds avec un JSON contenant un tableau "categories" avec pour chaque categorie:
- name: nom court et accrocheur
- description: description engageante (1-2 phrases)
- iconName: nom d'icone Lucide React (ex: "brain", "globe", "book", "music")
- color: gradient Tailwind (ex: "from-blue-500 to-cyan-600")
- subcategories: tableau de 3-5 sous-categories

Exemple de format:
{"categories":[{"name":"Mythologie","description":"Dieux, heros et legendes du monde entier","iconName":"crown","color":"from-amber-500 to-orange-600","subcategories":["Grecque","Nordique","Egyptienne"]}]}`

  const response = await callLLM(config, {
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.categoryGenerator },
      { role: 'user', content: prompt }
    ],
    jsonMode: true,
    temperature: 0.9
  })

  try {
    let content = response.content.trim()
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(content)
    const categories = parsed.categories || parsed

    return categories.map((c: any, index: number) => ({
      id: `cat-${Date.now()}-${index}`,
      name: c.name,
      description: c.description,
      iconName: c.iconName || 'folder',
      color: c.color || 'from-gray-500 to-slate-600',
      subcategories: c.subcategories || [],
      questionCount: 0,
      source: 'llm' as const
    }))
  } catch (error) {
    console.error('Failed to parse LLM response:', response.content)
    throw new LLMError('Failed to parse category response', 'INVALID_RESPONSE', config.provider)
  }
}

// ============================================
// FLASHCARD GENERATION
// ============================================

export async function generateFlashcards(
  config: LLMConfig,
  request: FlashcardGenerationRequest
): Promise<GeneratedFlashcard[]> {
  const prompt = `Transforme ce texte en ${request.maxCards} flashcards pour la memorisation:

"""
${request.sourceText}
"""

${request.focusTopics?.length ? `Focus sur ces sujets: ${request.focusTopics.join(', ')}` : ''}
${request.difficulty ? `Difficulte ciblee: ${request.difficulty}` : ''}

Reponds avec un JSON contenant un tableau "flashcards" avec pour chaque carte:
- question: question claire et concise
- answer: reponse directe et memorable
- hints: tableau de 1-2 indices optionnels
- tags: tableau de tags pertinents
- difficulty: "easy", "medium" ou "hard"

Exemple de format:
{"flashcards":[{"question":"...","answer":"...","hints":["..."],"tags":["..."],"difficulty":"easy"}]}`

  const response = await callLLM(config, {
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.flashcardGenerator },
      { role: 'user', content: prompt }
    ],
    jsonMode: true,
    temperature: 0.7
  })

  try {
    let content = response.content.trim()
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(content)
    const flashcards = parsed.flashcards || parsed

    return flashcards.map((f: any, index: number) => ({
      id: `fc-${Date.now()}-${index}`,
      question: f.question,
      answer: f.answer,
      hints: f.hints || [],
      tags: f.tags || [],
      difficulty: f.difficulty || 'medium'
    }))
  } catch (error) {
    console.error('Failed to parse LLM response:', response.content)
    throw new LLMError('Failed to parse flashcard response', 'INVALID_RESPONSE', config.provider)
  }
}

// ============================================
// EXPLANATION GENERATION
// ============================================

export async function generateExplanation(
  config: LLMConfig,
  question: string,
  correctAnswer: string
): Promise<string> {
  const prompt = `Explique brievement (2-3 phrases max) pourquoi "${correctAnswer}" est la bonne reponse a cette question:

Question: ${question}

Utilise un ton amical et educatif, comme si tu parlais a un eleve curieux.`

  const response = await callLLM(config, {
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.explanationGenerator },
      { role: 'user', content: prompt }
    ],
    temperature: 0.6,
    maxTokens: 256
  }, false) // Don't cache explanations

  return response.content.trim()
}

// ============================================
// HEALTH CHECK
// ============================================

export async function checkLLMHealth(config: LLMConfig): Promise<{
  available: boolean
  latency?: number
  error?: string
}> {
  const start = Date.now()

  try {
    await callLLM(config, {
      messages: [
        { role: 'user', content: 'Reponds juste "OK"' }
      ],
      maxTokens: 10
    }, false)

    return {
      available: true,
      latency: Date.now() - start
    }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================
// EXPORT SERVICE
// ============================================

export const llmService = {
  callLLM,
  generateQuestions,
  generateCategories,
  generateFlashcards,
  generateExplanation,
  checkLLMHealth
}

export default llmService
