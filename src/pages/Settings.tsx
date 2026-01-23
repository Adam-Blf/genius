/**
 * Settings Page - Genius App v3.6 - Blue Edition
 * Configure LLM providers and app preferences
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  GraduationCap,
  Zap,
  ChevronRight,
  Shield,
  Palette
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useUserData } from '../contexts/UserDataContext'
import { useOnboardingContext } from '../contexts/OnboardingContext'
import { useLLM } from '../hooks/useLLM'
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '../components/transitions'
import type { LLMProvider } from '../types/llm'
import { LLM_MODELS } from '../types/llm'

// Genius Blue Edition color scheme for providers
const PROVIDER_INFO = {
  huggingface: {
    name: 'Hugging Face',
    description: 'Gratuit, pas de cle requise',
    url: 'https://huggingface.co/settings/tokens',
    color: 'from-[#FF9100] to-[#FFD180]',
    icon: Zap
  },
  groq: {
    name: 'Groq',
    description: 'API ultra-rapide, gratuite (limite)',
    url: 'https://console.groq.com/keys',
    color: 'from-[#FF5252] to-[#FFAB91]',
    icon: Zap
  },
  together: {
    name: 'Together.ai',
    description: 'Grande variete de modeles',
    url: 'https://api.together.xyz/settings/api-keys',
    color: 'from-[#0052D4] to-[#6FB1FC]',
    icon: Sparkles
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Acces a plusieurs providers',
    url: 'https://openrouter.ai/keys',
    color: 'from-[#AA00FF] to-[#EA80FC]',
    icon: Globe
  },
  ollama: {
    name: 'Ollama (Local)',
    description: 'Modeles locaux, 100% prive',
    url: 'https://ollama.ai',
    color: 'from-[#00C853] to-[#69F0AE]',
    icon: Shield
  },
  none: {
    name: 'Desactive',
    description: 'Pas de generation IA',
    url: '',
    color: 'from-slate-600 to-slate-700',
    icon: XCircle
  }
}

// Toggle Switch Component - Genius Blue Edition
function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${
        enabled
          ? 'bg-gradient-to-r from-[#0052D4] to-[#6FB1FC]'
          : 'bg-slate-700'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: enabled ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )
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
      {/* Header - Genius Blue Edition */}
      <div className="sticky top-0 z-50 bg-genius-bg/90 backdrop-blur-xl border-b border-[#4364F7]/20">
        <div className="flex items-center gap-4 p-4 max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-white hover:border-[#4364F7]/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gradient-blue">Parametres</h1>
            <p className="text-xs text-gray-500">Personnalise ton experience</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <img src="/ralph.png" alt="Ralph" className="w-10 h-10 object-contain" />
          </motion.div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* LLM Configuration Section - Genius Blue Edition */}
        <SlideUp delay={0}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052D4] to-[#6FB1FC] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Generation IA</h2>
              <p className="text-xs text-gray-500">Flashcards automatiques</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-4">
            <p className="text-sm text-gray-400">
              Configure un provider LLM pour generer automatiquement des questions et des flashcards.
            </p>

            {/* Provider Selection - Grid Enhanced */}
            <div className="space-y-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Provider</span>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PROVIDER_INFO) as LLMProvider[]).map(provider => {
                  const info = PROVIDER_INFO[provider]
                  const isSelected = selectedProvider === provider
                  const IconComponent = info.icon

                  return (
                    <motion.button
                      key={provider}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleProviderChange(provider)}
                      className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-[#4364F7] bg-[#4364F7]/10'
                          : 'border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selectedProvider"
                          className="absolute inset-0 bg-gradient-to-br from-[#0052D4]/10 to-[#6FB1FC]/10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center mb-2`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-white">{info.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{info.description}</p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00E5FF] flex items-center justify-center"
                        >
                          <CheckCircle className="w-3 h-3 text-slate-900" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* HuggingFace Info - Enhanced */}
            <AnimatePresence>
              {selectedProvider === 'huggingface' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-[#FF9100]/10 border border-[#FF9100]/30 rounded-xl"
                >
                  <p className="text-sm text-[#FFD180]">
                    Hugging Face fonctionne sans cle API (tier gratuit).
                    Ajoutez une cle pour des limites plus elevees.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* API Key Input - Enhanced */}
            <AnimatePresence>
              {selectedProvider !== 'none' && selectedProvider !== 'ollama' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Cle API</span>
                    <a
                      href={PROVIDER_INFO[selectedProvider].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#6FB1FC] flex items-center gap-1 hover:underline"
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
                        className="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-700/50 focus:outline-none focus:border-[#4364F7] transition-colors"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveApiKey}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0052D4] to-[#6FB1FC] text-white text-sm font-medium"
                    >
                      Sauver
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ollama URL - Enhanced */}
            <AnimatePresence>
              {selectedProvider === 'ollama' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-[#00C853]/10 border border-[#00C853]/30 rounded-xl"
                >
                  <p className="text-sm text-[#69F0AE]">
                    Ollama utilise l'URL locale par defaut (http://localhost:11434).
                    Assurez-vous qu'Ollama est en cours d'execution.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Available Models - Enhanced */}
            <AnimatePresence>
              {availableModels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Modeles disponibles</span>
                  <div className="space-y-1">
                    {availableModels.map((model, index) => (
                      <motion.div
                        key={model.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-[#4364F7]/30 transition-colors"
                      >
                        <div>
                          <p className="text-sm text-white font-medium">{model.name}</p>
                          <p className="text-xs text-gray-500">{model.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connection Test - Enhanced */}
            {isConfigured && (
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white text-sm font-medium hover:border-[#4364F7]/50 transition-colors flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tester la connexion
                </motion.button>

                <AnimatePresence>
                  {connectionStatus === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1 text-[#00E5FF] text-sm bg-[#00E5FF]/10 px-3 py-1.5 rounded-full"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Connecte
                    </motion.div>
                  )}

                  {connectionStatus === 'error' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1 text-[#FF5252] text-sm bg-[#FF5252]/10 px-3 py-1.5 rounded-full"
                    >
                      <XCircle className="w-4 h-4" />
                      Echec
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#FF5252] bg-[#FF5252]/10 p-3 rounded-xl"
              >
                {error}
              </motion.p>
            )}
          </div>
        </SlideUp>

        {/* App Preferences - Genius Blue Edition */}
        <SlideUp delay={0.1}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Preferences</h2>
              <p className="text-xs text-gray-500">Apparence et comportement</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Theme */}
            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              className="flex items-center justify-between p-4 border-b border-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  preferences.theme === 'dark'
                    ? 'bg-[#4364F7]/20'
                    : 'bg-amber-500/20'
                }`}>
                  {preferences.theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-[#6FB1FC]" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Theme</p>
                  <p className="text-xs text-gray-500">Mode sombre/clair</p>
                </div>
              </div>
              <select
                value={preferences.theme}
                onChange={(e) => updatePreferences({ theme: e.target.value as any })}
                className="bg-slate-700/50 text-white text-sm rounded-xl px-4 py-2 border border-slate-600/50 focus:outline-none focus:border-[#4364F7] transition-colors cursor-pointer"
              >
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
                <option value="system">Systeme</option>
              </select>
            </motion.div>

            {/* Sound */}
            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              className="flex items-center justify-between p-4 border-b border-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  preferences.soundEnabled
                    ? 'bg-[#00C853]/20'
                    : 'bg-slate-700/50'
                }`}>
                  {preferences.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-[#69F0AE]" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Sons</p>
                  <p className="text-xs text-gray-500">Effets sonores</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={preferences.soundEnabled}
                onToggle={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
              />
            </motion.div>

            {/* Notifications */}
            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              className="flex items-center justify-between p-4 border-b border-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  preferences.notificationsEnabled
                    ? 'bg-amber-500/20'
                    : 'bg-slate-700/50'
                }`}>
                  {preferences.notificationsEnabled ? (
                    <Bell className="w-5 h-5 text-amber-400" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Notifications</p>
                  <p className="text-xs text-gray-500">Rappels quotidiens</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={preferences.notificationsEnabled}
                onToggle={() => updatePreferences({ notificationsEnabled: !preferences.notificationsEnabled })}
              />
            </motion.div>

            {/* Language */}
            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              className="flex items-center justify-between p-4 border-b border-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4364F7]/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#6FB1FC]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Langue</p>
                  <p className="text-xs text-gray-500">Langue de l'application</p>
                </div>
              </div>
              <select
                value={preferences.language}
                onChange={(e) => updatePreferences({ language: e.target.value as any })}
                className="bg-slate-700/50 text-white text-sm rounded-xl px-4 py-2 border border-slate-600/50 focus:outline-none focus:border-[#4364F7] transition-colors cursor-pointer"
              >
                <option value="fr">Francais</option>
                <option value="en">English</option>
              </select>
            </motion.div>

            {/* Replay Tutorial */}
            <motion.div
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#AA00FF]/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#EA80FC]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Tutoriel</p>
                  <p className="text-xs text-gray-500">Revoir l'introduction</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReplayTutorial}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#AA00FF]/10 text-[#EA80FC] text-sm font-medium border border-[#AA00FF]/30 hover:border-[#AA00FF]/50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Revoir
              </motion.button>
            </motion.div>
          </div>
        </SlideUp>

        {/* Danger Zone - Genius Blue Edition */}
        <SlideUp delay={0.2}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#FFAB91] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#FF5252]">Zone de danger</h2>
              <p className="text-xs text-gray-500">Actions irreversibles</p>
            </div>
          </div>

          <div className="bg-[#FF5252]/5 border border-[#FF5252]/30 rounded-2xl p-4">
            <AnimatePresence mode="wait">
              {!showClearConfirm ? (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5252]/10 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-[#FF5252]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Effacer toutes les donnees</p>
                      <p className="text-xs text-gray-500">
                        Supprime notes, flashcards et preferences
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowClearConfirm(true)}
                    className="p-2 rounded-xl bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30 hover:border-[#FF5252]/50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-2"
                >
                  <p className="text-[#FF5252] font-medium mb-4">
                    Es-tu sur ? Cette action est irreversible.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowClearConfirm(false)}
                      className="px-6 py-2 rounded-xl bg-slate-700/50 text-white text-sm font-medium border border-slate-600/50 hover:border-slate-500 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClearData}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF5252] to-[#FF7B7B] text-white text-sm font-medium"
                      style={{ boxShadow: '0 4px 20px -4px rgba(255, 82, 82, 0.5)' }}
                    >
                      Confirmer la suppression
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SlideUp>

        {/* Version Info - Genius Blue Edition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center pt-6 pb-2"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <img src="/ralph.png" alt="Ralph" className="w-8 h-8 object-contain" />
            </motion.div>
            <span className="text-gradient-blue font-bold">Genius Blue Edition</span>
          </div>
          <p className="text-xs text-gray-600">v3.6 - Made with Ralph + IA</p>
          <p className="text-xs text-gray-700 mt-1">By Adam Beloucif</p>
        </motion.div>
      </div>
    </div>
  )
}
