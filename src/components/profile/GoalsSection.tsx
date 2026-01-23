/**
 * Goals Section Component
 * Learning goals with milestones tracking
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Plus,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Flag
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { LearningGoal, LearningGoalInput } from '../../types/userData'

interface GoalsSectionProps {
  goals: LearningGoal[]
  onAddGoal: (goal: LearningGoalInput) => string
  onUpdateGoal: (id: string, updates: Partial<LearningGoal>) => void
  onDeleteGoal: (id: string) => void
  onToggleMilestone: (goalId: string, milestoneId: string) => void
}

export function GoalsSection({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onToggleMilestone
}: GoalsSectionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [milestones, setMilestones] = useState<string[]>([])
  const [milestoneInput, setMilestoneInput] = useState('')

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setTargetDate('')
    setMilestones([])
    setMilestoneInput('')
    setIsCreating(false)
  }

  const handleSubmit = () => {
    if (!title.trim()) return

    onAddGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      progress: 0,
      milestones: milestones.map((m, i) => ({
        id: `ms-${Date.now()}-${i}`,
        title: m,
        completed: false
      }))
    })

    resetForm()
  }

  const handleAddMilestone = () => {
    if (milestoneInput.trim() && !milestones.includes(milestoneInput.trim())) {
      setMilestones([...milestones, milestoneInput.trim()])
      setMilestoneInput('')
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-emerald-500'
    if (progress >= 50) return 'bg-amber-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null
    const target = new Date(targetDate)
    const now = new Date()
    const diffMs = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Sort goals: incomplete first, then by target date
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.progress === 100 && b.progress !== 100) return 1
    if (a.progress !== 100 && b.progress === 100) return -1
    if (a.targetDate && b.targetDate) {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    }
    return 0
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Objectifs d'Apprentissage</h3>
          <span className="text-xs text-gray-500">({goals.length})</span>
        </div>

        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Ajouter
          </Button>
        )}
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card variant="glass" padding="md" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">Nouvel objectif</h4>
                <button onClick={resetForm} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Titre de l'objectif (ex: Maitriser les maths)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <textarea
                placeholder="Description (optionnel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />

              {/* Target Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Date cible:</span>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Etapes:</span>
                </div>

                {milestones.length > 0 && (
                  <div className="space-y-1 pl-6">
                    {milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" />
                        <span className="text-sm text-gray-300 flex-1">{m}</span>
                        <button
                          onClick={() => setMilestones(milestones.filter((_, j) => j !== i))}
                          className="text-gray-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pl-6">
                  <input
                    type="text"
                    placeholder="Ajouter une etape..."
                    value={milestoneInput}
                    onChange={(e) => setMilestoneInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                    className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button onClick={handleAddMilestone} variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button onClick={resetForm} variant="ghost" size="sm">
                  Annuler
                </Button>
                <Button onClick={handleSubmit} variant="primary" size="sm">
                  Creer
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      {sortedGoals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucun objectif defini</p>
          <p className="text-gray-500 text-xs mt-1">
            Cree des objectifs pour suivre ta progression
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGoals.map((goal, index) => {
            const isExpanded = expandedGoal === goal.id
            const daysRemaining = getDaysRemaining(goal.targetDate)
            const isComplete = goal.progress === 100
            const isOverdue = daysRemaining !== null && daysRemaining < 0 && !isComplete

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="default"
                  padding="none"
                  className={`overflow-hidden ${isComplete ? 'opacity-60' : ''}`}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isComplete && (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <h4 className={`font-medium text-white truncate ${isComplete ? 'line-through' : ''}`}>
                            {goal.title}
                          </h4>
                        </div>

                        {goal.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progression</span>
                        <span className="text-xs font-medium text-white">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                        />
                      </div>
                    </div>

                    {/* Date & Status */}
                    {daysRemaining !== null && (
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className={`text-xs ${
                          isOverdue ? 'text-red-400' :
                          daysRemaining <= 7 ? 'text-amber-400' :
                          'text-gray-500'
                        }`}>
                          {isOverdue
                            ? `En retard de ${Math.abs(daysRemaining)} jours`
                            : daysRemaining === 0
                            ? "Aujourd'hui"
                            : `${daysRemaining} jours restants`
                          }
                        </span>
                      </div>
                    )}

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-white/10"
                        >
                          {/* Milestones */}
                          {goal.milestones.length > 0 && (
                            <div className="space-y-2 mb-4">
                              <span className="text-xs text-gray-400">Etapes:</span>
                              {goal.milestones.map(milestone => (
                                <button
                                  key={milestone.id}
                                  onClick={() => onToggleMilestone(goal.id, milestone.id)}
                                  className="flex items-center gap-3 w-full text-left group"
                                >
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    milestone.completed
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-600 group-hover:border-gray-400'
                                  }`}>
                                    {milestone.completed && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className={`text-sm ${
                                    milestone.completed
                                      ? 'text-gray-500 line-through'
                                      : 'text-gray-300'
                                  }`}>
                                    {milestone.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-end">
                            <Button
                              onClick={() => onDeleteGoal(goal.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
