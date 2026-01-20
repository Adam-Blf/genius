import { useNavigate } from 'react-router-dom'
import { Button, CategoryIcon } from '@/components/atoms'
import { useStore, useSelectedCategories } from '@/store'
import { ALL_CATEGORIES, CATEGORY_CONFIG, type Category } from '@/types'
import { cn } from '@/lib/utils'

export function OnboardingCategories() {
  const navigate = useNavigate()
  const toggleCategory = useStore((s) => s.toggleCategory)
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const selectedCategories = useSelectedCategories()

  const handleToggle = (category: Category) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    toggleCategory(category)
  }

  const handleContinue = () => {
    completeOnboarding()
    navigate('/swipe', { replace: true })
  }

  const canContinue = selectedCategories.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-background p-6 pb-safe-bottom pt-safe-top">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Qu'est-ce qui t'intéresse ?</h1>
        <p className="text-text-secondary mb-8">
          Choisis au moins 1 catégorie. Tu pourras changer plus tard.
        </p>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-3">
          {ALL_CATEGORIES.map((category) => {
            const config = CATEGORY_CONFIG[category]
            const isSelected = selectedCategories.includes(category)

            return (
              <button
                key={category}
                onClick={() => {
                  handleToggle(category)
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-fast',
                  'active:scale-[0.97]',
                  isSelected
                    ? `bg-${config.color}/20 border-${config.color} text-${config.color}`
                    : 'bg-surface border-transparent text-text-secondary hover:bg-surface-elevated'
                )}
                style={{
                  backgroundColor: isSelected ? `var(--color-${config.color})20` : undefined,
                  borderColor: isSelected ? `var(--color-${config.color})` : 'transparent',
                  color: isSelected ? `var(--color-${config.color})` : undefined,
                }}
              >
                <CategoryIcon
                  category={category}
                  className="size-8"
                  style={{ color: isSelected ? `var(--color-${config.color})` : undefined }}
                />
                <span className="font-medium">{config.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={handleContinue}
          disabled={!canContinue}
          icon="Sparkles"
          iconPosition="right"
        >
          C'est parti ! ({selectedCategories.length} sélectionnée
          {selectedCategories.length > 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  )
}
