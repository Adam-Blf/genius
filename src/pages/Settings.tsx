import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Icon } from '@/components/atoms'
import { Card, ConfirmModal, useToast } from '@/components/molecules'
import { TabBar } from '@/components/organisms'
import {
  useStore,
  useSoundEnabled,
  useHapticEnabled,
  useUserName,
  useTotalXp,
  useTotalStats,
} from '@/store'
import { exportUserData, downloadJSON } from '@/lib/export-data'

export function Settings() {
  const navigate = useNavigate()
  const toast = useToast()
  const soundEnabled = useSoundEnabled()
  const hapticEnabled = useHapticEnabled()
  const userName = useUserName()
  const totalXp = useTotalXp()
  const totalStats = useTotalStats()

  const toggleSound = useStore((s) => s.toggleSound)
  const toggleHaptic = useStore((s) => s.toggleHaptic)
  const resetAllData = useStore((s) => s.resetAllData)

  const [showResetModal, setShowResetModal] = useState(false)

  const handleReset = () => {
    resetAllData()
    toast.success('Données réinitialisées')
    navigate('/', { replace: true })
  }

  const handleExport = () => {
    const state = useStore.getState()
    const data = exportUserData({
      preferences: state.preferences,
      stats: state.stats,
      learnedCards: state.learnedCards,
      knownCards: state.knownCards,
      reviewQueue: state.reviewQueue,
    })

    const filename = `swipy-${userName || 'export'}-${new Date().toISOString().split('T')[0]}.json`
    downloadJSON(data, filename)
    toast.success('Export téléchargé !')
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24 overflow-y-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Réglages</h1>

      {/* User Info */}
      <Card className="mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {userName ? userName[0].toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-text-primary">{userName || 'Swiper'}</h2>
            <p className="text-sm text-text-secondary">{totalXp} XP total</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-success">{totalStats.known}</p>
            <p className="text-xs text-text-muted">Connues</p>
          </div>
        </div>
      </Card>

      {/* Audio & Haptics */}
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2 mt-6">
        Audio & Vibrations
      </h2>

      <Card className="mb-2" onClick={toggleSound}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Icon name={soundEnabled ? 'Volume2' : 'VolumeX'} className="size-5 text-primary" />
            </div>
            <div>
              <span className="text-text-primary font-medium">Sons</span>
              <p className="text-xs text-text-muted">Effets sonores</p>
            </div>
          </div>
          <div
            className={`w-12 h-7 rounded-full p-1 transition-colors ${soundEnabled ? 'bg-primary' : 'bg-surface-overlay'}`}
          >
            <div
              className={`size-5 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </div>
        </div>
      </Card>

      <Card className="mb-2" onClick={toggleHaptic}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Icon name="Vibrate" className="size-5 text-warning" />
            </div>
            <div>
              <span className="text-text-primary font-medium">Vibrations</span>
              <p className="text-xs text-text-muted">Retour haptique</p>
            </div>
          </div>
          <div
            className={`w-12 h-7 rounded-full p-1 transition-colors ${hapticEnabled ? 'bg-primary' : 'bg-surface-overlay'}`}
          >
            <div
              className={`size-5 rounded-full bg-white transition-transform ${hapticEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2 mt-6">
        Données
      </h2>

      <Card className="mb-2" onClick={handleExport}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-success/20 flex items-center justify-center">
            <Icon name="Download" className="size-5 text-success" />
          </div>
          <div className="flex-1">
            <span className="text-text-primary font-medium">Exporter mes données</span>
            <p className="text-xs text-text-muted">Télécharger en JSON</p>
          </div>
          <Icon name="ChevronRight" className="size-5 text-text-muted" />
        </div>
      </Card>

      <Card
        className="mb-2"
        onClick={() => {
          setShowResetModal(true)
        }}
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-error/20 flex items-center justify-center">
            <Icon name="Trash2" className="size-5 text-error" />
          </div>
          <div className="flex-1">
            <span className="text-error font-medium">Réinitialiser</span>
            <p className="text-xs text-text-muted">Supprimer toutes les données</p>
          </div>
          <Icon name="ChevronRight" className="size-5 text-text-muted" />
        </div>
      </Card>

      {/* App Info */}
      <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2 mt-6">
        À propos
      </h2>

      <Card className="mb-2">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-surface-elevated flex items-center justify-center">
            <Icon name="Info" className="size-5 text-text-muted" />
          </div>
          <div className="flex-1">
            <span className="text-text-primary font-medium">Swipy</span>
            <p className="text-xs text-text-muted">Version 1.0.0</p>
          </div>
        </div>
      </Card>

      <p className="text-center text-xs text-text-muted mt-6">Fait avec ❤️ par Adam Beloucif</p>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false)
        }}
        onConfirm={handleReset}
        title="Réinitialiser ?"
        message="Toutes tes données seront supprimées : progression, XP, badges. Cette action est irréversible."
        confirmText="Supprimer tout"
        variant="danger"
      />

      {/* Tab Bar */}
      <TabBar />
    </div>
  )
}
