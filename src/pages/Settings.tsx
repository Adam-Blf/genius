/**
 * Settings Page - Genius App v3.0
 * Configure LLM providers and app preferences
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Globe,
  Trash2,
  AlertTriangle,
  Cpu,
  RotateCcw,
  GraduationCap
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useUserData } from '../contexts/UserDataContext'
import { useOnboardingContext } from '../contexts/OnboardingContext'
import { useLLM } from '../hooks/useLLM'
import type { LLMProvider } from '../types/llm'
import { LLM_MODELS } from '../types/llm'

const PROVIDER_INFO = {
  huggingface: {
    name: 'Hugging Face',
    description: 'Gratuit, pas de cle requise',
    url: 'https://huggingface.co/settings/tokens',
    color: 'from-yellow-500 to-orange-500'
  },
  groq: {
    name: 'Groq',
    description: 'API ultra-rapide, gratuite (limite)',
    url: 'https://console.groq.com/keys',
    color: 'from-orange-500 to-red-500'
  },
  together: {
    name: 'Together.ai',
    description: 'Grande variete de modeles',
    url: 'https://api.together.xyz/settings/api-keys',
    color: 'from-blue-500 to-indigo-500'
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Acces a plusieurs providers',
    url: 'https://openrouter.ai/keys',
    color: 'from-purple-500 to-pink-500'
  },
  ollama: {
    name: 'Ollama (Local)',
    description: 'Modeles locaux, 100% prive',
    url: 'https://ollama.ai',
    color: 'from-green-500 to-emerald-500'
  },
  none: {
    name: 'Desactive',
    description: 'Pas de generation IA',
    url: '',
    color: 'from-gray-500 to-gray-600'
  }
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { preferences, updatePreferences, clearAllData } = useUserData()
  const { resetOnboarding } = useOnboardingContext()
  const { config, isConfigured, setProvider, testConnection, isLoading, error } = useLLM()

  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(
    (preferences.llmProvider as LLMProvider) || 'none'
  )
  const [apiKey, setApiKey] = useState(preferences.llmApiKey || '')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleProviderChange = (provider: LLMProvider) => {
    setSelectedProvider(provider)
    setConnectionStatus('idle')
    if (provider === 'none' || provider === 'ollama' || provider === 'huggingface') {
      setProvider(provider)
      if (provider !== 'huggingface') {
        setApiKey('')
      }
    }
  }

  const handleSaveApiKey = () => {
    if (!apiKey.trim() && selectedProvider !== 'ollama') return
    setProvider(selectedProvider, apiKey.trim())
    setConnectionStatus('idle')
  }

  const handleTestConnection = async () => {
    setConnectionStatus('testing')
    const success = await testConnection()
    setConnectionStatus(success ? 'success' : 'error')
  }

  const handleClearData = () => {
    clearAllData()
    resetOnboarding()
    setShowClearConfirm(false)
    navigate('/welcome')
  }

  const handleReplayTutorial = () => {
    resetOnboarding()
    navigate('/welcome')
  }

  const availableModels = LLM_MODELS[selectedProvider] || []

  return (
    <div className="min-h-screen bg-genius-bg pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-genius-bg/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center gap-4 p-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Parametres</h1>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* LLM Configuration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Generation IA</h2>
          </div>

          <Card variant="glass" padding="md" className="space-y-4">
            <p className="text-sm text-gray-400">
              Configure un provider LLM pour generer automatiquement des questions,
              des categories et des flashcards.
            </p>

            {/* Provider Selection */}
            <div className="space-y-2">
              <span className="text-sm text-gray-400">Provider:</span>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PROVIDER_INFO) as LLMProvider[]).map(provider => {
                  const info = PROVIDER_INFO[provider]
                  const isSelected = selectedProvider === provider

                  return (
                    <button
                      key={provider}
                      onClick={() => handleProviderChange(provider)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center mb-2`}>
                        <Cpu className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-white">{info.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{info.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* HuggingFace Info */}
            {selectedProvider === 'huggingface' && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  Hugging Face fonctionne sans cle API (tier gratuit).
                  Ajoutez une cle pour des limites de requetes plus elevees.
                </p>
              </div>
            )}

            {/* API Key Input */}
            {selectedProvider !== 'none' && selectedProvider !== 'ollama' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Cle API:</span>
                  <a
                    href={PROVIDER_INFO[selectedProvider].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-400 flex items-center gap-1 hover:underline"
                  >
                    Obtenir une cle
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-slate-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <Button onClick={handleSaveApiKey} variant="primary" size="sm">
                    Sauver
                  </Button>
                </div>
              </div>
            )}

            {/* Ollama URL */}
            {selectedProvider === 'ollama' && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-400">
                  Ollama utilise l'URL locale par defaut (http://localhost:11434).
                  Assurez-vous qu'Ollama est en cours d'execution.
                </p>
              </div>
            )}

            {/* Available Models */}
            {availableModels.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-gray-400">Modeles disponibles:</span>
                <div className="space-y-1">
                  {availableModels.map(model => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-white">{model.name}</p>
                        <p className="text-xs text-gray-500">{model.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connection Test */}
            {isConfigured && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleTestConnection}
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Tester la connexion
                </Button>

                {connectionStatus === 'success' && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Connecte
                  </div>
                )}

                {connectionStatus === 'error' && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    Echec
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </Card>
        </motion.div>

        {/* App Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Preferences</h2>

          <Card variant="default" padding="none">
            {/* Theme */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                {preferences.theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-blue-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">Theme</p>
                  <p className="text-xs text-gray-500">Mode sombre/clair</p>
                </div>
              </div>
              <select
                value={preferences.theme}
                onChange={(e) => updatePreferences({ theme: e.target.value as any })}
                className="bg-slate-800 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
                <option value="system">Systeme</option>
              </select>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                {preferences.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-green-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">Sons</p>
                  <p className="text-xs text-gray-500">Effets sonores</p>
                </div>
              </div>
              <button
                onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.soundEnabled ? 'bg-primary-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                {preferences.notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-amber-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">Notifications</p>
                  <p className="text-xs text-gray-500">Rappels quotidiens</p>
                </div>
              </div>
              <button
                onClick={() => updatePreferences({ notificationsEnabled: !preferences.notificationsEnabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.notificationsEnabled ? 'bg-primary-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">Langue</p>
                  <p className="text-xs text-gray-500">Langue de l'application</p>
                </div>
              </div>
              <select
                value={preferences.language}
                onChange={(e) => updatePreferences({ language: e.target.value as any })}
                className="bg-slate-800 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="fr">Francais</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Replay Tutorial */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Tutoriel</p>
                  <p className="text-xs text-gray-500">Revoir l'introduction</p>
                </div>
              </div>
              <Button
                onClick={handleReplayTutorial}
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:bg-purple-500/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Revoir
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zone de danger
          </h2>

          <Card variant="default" padding="md" className="border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Effacer toutes les donnees</p>
                <p className="text-xs text-gray-500">
                  Supprime toutes les notes, memos, et preferences
                </p>
              </div>

              {!showClearConfirm ? (
                <Button
                  onClick={() => setShowClearConfirm(true)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowClearConfirm(false)}
                    variant="ghost"
                    size="sm"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleClearData}
                    variant="primary"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Confirmer
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Version Info */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-600">Genius v3.0</p>
          <p className="text-xs text-gray-700">Made with Ralph + IA</p>
        </div>
      </div>
    </div>
  )
}
