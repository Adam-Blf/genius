/**
 * LLM Hook for Genius App
 * React hook for LLM interactions
 */

import { useState, useCallback, useMemo } from 'react'
import { useUserData } from '../contexts/UserDataContext'
import type {
  LLMConfig,
  LLMProvider,
  GeneratedQuestion,
  GeneratedCategory,
  GeneratedFlashcard,
  QuestionGenerationRequest,
  CategoryGenerationRequest,
  FlashcardGenerationRequest
} from '../types/llm'
import { DEFAULT_LLM_CONFIG, LLM_MODELS, LLMError } from '../types/llm'
import {
  generateQuestions,
  generateCategories,
  generateFlashcards,
  generateExplanation,
  checkLLMHealth
} from '../services/llmService'

export interface UseLLMReturn {
  // Config
  config: LLMConfig
  isConfigured: boolean
  availableModels: typeof LLM_MODELS[LLMProvider]

  // State
  isLoading: boolean
  error: string | null

  // Actions
  setProvider: (provider: LLMProvider, apiKey?: string) => void
  setModel: (model: string) => void

  // Generation
  generateQuizQuestions: (request: QuestionGenerationRequest) => Promise<GeneratedQuestion[]>
  generateNewCategories: (request: CategoryGenerationRequest) => Promise<GeneratedCategory[]>
  generateFlashcardsFromText: (request: FlashcardGenerationRequest) => Promise<GeneratedFlashcard[]>
  explainAnswer: (question: string, answer: string) => Promise<string>

  // Health check
  testConnection: () => Promise<boolean>
}

export function useLLM(): UseLLMReturn {
  const { preferences, updatePreferences } = useUserData()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build config from preferences
  const config = useMemo<LLMConfig>(() => ({
    ...DEFAULT_LLM_CONFIG,
    provider: (preferences.llmProvider as LLMProvider) || 'none',
    apiKey: preferences.llmApiKey
  }), [preferences.llmProvider, preferences.llmApiKey])

  const isConfigured = useMemo(() => {
    if (config.provider === 'none') return false
    if (config.provider === 'ollama') return true // Ollama doesn't need API key
    if (config.provider === 'huggingface') return true // HuggingFace works without API key (free tier)
    return !!config.apiKey
  }, [config])

  const availableModels = useMemo(() => {
    return LLM_MODELS[config.provider] || []
  }, [config.provider])

  // Set provider and API key
  const setProvider = useCallback((provider: LLMProvider, apiKey?: string) => {
    updatePreferences({
      llmProvider: provider,
      llmApiKey: apiKey
    })
  }, [updatePreferences])

  // Set model
  const setModel = useCallback((model: string) => {
    // Store in localStorage as preferences doesn't have model field
    localStorage.setItem('genius_llm_model', model)
  }, [])

  // Generate quiz questions
  const generateQuizQuestions = useCallback(async (
    request: QuestionGenerationRequest
  ): Promise<GeneratedQuestion[]> => {
    if (!isConfigured) {
      throw new Error('LLM not configured')
    }

    setIsLoading(true)
    setError(null)

    try {
      const questions = await generateQuestions(config, request)
      return questions
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate questions'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [config, isConfigured])

  // Generate categories
  const generateNewCategories = useCallback(async (
    request: CategoryGenerationRequest
  ): Promise<GeneratedCategory[]> => {
    if (!isConfigured) {
      throw new Error('LLM not configured')
    }

    setIsLoading(true)
    setError(null)

    try {
      const categories = await generateCategories(config, request)
      return categories
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate categories'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [config, isConfigured])

  // Generate flashcards from text
  const generateFlashcardsFromText = useCallback(async (
    request: FlashcardGenerationRequest
  ): Promise<GeneratedFlashcard[]> => {
    if (!isConfigured) {
      throw new Error('LLM not configured')
    }

    setIsLoading(true)
    setError(null)

    try {
      const flashcards = await generateFlashcards(config, request)
      return flashcards
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate flashcards'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [config, isConfigured])

  // Explain answer
  const explainAnswer = useCallback(async (
    question: string,
    answer: string
  ): Promise<string> => {
    if (!isConfigured) {
      return 'Configuration LLM requise pour les explications detaillees.'
    }

    try {
      return await generateExplanation(config, question, answer)
    } catch (err) {
      console.error('Failed to generate explanation:', err)
      return 'Explication non disponible.'
    }
  }, [config, isConfigured])

  // Test connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!isConfigured) return false

    setIsLoading(true)
    setError(null)

    try {
      const result = await checkLLMHealth(config)
      if (!result.available && result.error) {
        setError(result.error)
      }
      return result.available
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection test failed'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [config, isConfigured])

  return {
    config,
    isConfigured,
    availableModels,
    isLoading,
    error,
    setProvider,
    setModel,
    generateQuizQuestions,
    generateNewCategories,
    generateFlashcardsFromText,
    explainAnswer,
    testConnection
  }
}
