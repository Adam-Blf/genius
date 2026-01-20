import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/atoms'
import { useStore } from '@/store'

export function OnboardingName() {
  const navigate = useNavigate()
  const setUserName = useStore((s) => s.setUserName)
  const [name, setName] = useState('')

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim())
    }
    navigate('/onboarding/categories')
  }

  const handleSkip = () => {
    navigate('/onboarding/categories')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 pb-safe-bottom pt-safe-top">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-surface-elevated" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Comment tu t'appelles ?</h1>
        <p className="text-text-secondary mb-8">
          On personnalisera ton expérience. Tu peux aussi passer cette étape.
        </p>

        <Input
          placeholder="Ton prénom"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          icon="User"
          autoFocus
          className="mb-4"
        />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={handleContinue}
          icon="ArrowRight"
          iconPosition="right"
        >
          Continuer
        </Button>

        <Button variant="ghost" size="lg" className="w-full" onClick={handleSkip}>
          Passer
        </Button>
      </div>
    </div>
  )
}
