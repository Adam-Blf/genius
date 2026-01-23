/**
 * Memos Section Component
 * Quick memos/reminders in the profile
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Plus,
  Check,
  Trash2,
  X,
  Clock
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { UserMemo, UserMemoInput } from '../../types/userData'

interface MemosSectionProps {
  memos: UserMemo[]
  onAddMemo: (memo: UserMemoInput) => string
  onUpdateMemo: (id: string, updates: Partial<UserMemo>) => void
  onDeleteMemo: (id: string) => void
  onToggleComplete: (id: string) => void
}

const MEMO_CATEGORIES = [
  { id: 'general', label: 'General', color: 'text-gray-400' },
  { id: 'study', label: 'Etude', color: 'text-blue-400' },
  { id: 'review', label: 'Reviser', color: 'text-green-400' },
  { id: 'goal', label: 'Objectif', color: 'text-amber-400' },
  { id: 'idea', label: 'Idee', color: 'text-purple-400' }
]

export function MemosSection({
  memos,
  onAddMemo,
  onDeleteMemo,
  onToggleComplete
}: MemosSectionProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [text, setText] = useState('')
  const [category, setCategory] = useState('general')
  const [showCompleted, setShowCompleted] = useState(false)

  const handleSubmit = () => {
    if (!text.trim()) return

    onAddMemo({
      text: text.trim(),
      category,
      isCompleted: false
    })

    setText('')
    setCategory('general')
    setIsAdding(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const activeMemos = memos.filter(m => !m.isCompleted)
  const completedMemos = memos.filter(m => m.isCompleted)

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'maintenant'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}j`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Memos Rapides</h3>
          <span className="text-xs text-gray-500">({activeMemos.length})</span>
        </div>

        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Ajouter
          </Button>
        )}
      </div>

      {/* Quick Add Input */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card variant="glass" padding="md" className="space-y-3">
              <textarea
                placeholder="Qu'est-ce que tu veux retenir ?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={2}
                autoFocus
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />

              {/* Category Selector */}
              <div className="flex flex-wrap gap-2">
                {MEMO_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      category === cat.id
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setIsAdding(false)
                    setText('')
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Annuler
                </Button>
                <Button onClick={handleSubmit} variant="primary" size="sm">
                  Ajouter
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Memos */}
      {activeMemos.length === 0 && !isAdding ? (
        <div className="text-center py-6">
          <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Aucun memo</p>
          <p className="text-gray-500 text-xs mt-1">
            Ajoute des rappels rapides
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeMemos.map((memo, index) => {
            const categoryInfo = MEMO_CATEGORIES.find(c => c.id === memo.category)

            return (
              <motion.div
                key={memo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group"
              >
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                  <button
                    onClick={() => onToggleComplete(memo.id)}
                    className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center hover:border-green-500 transition-colors"
                  >
                    <Check className="w-3 h-3 text-transparent group-hover:text-gray-500" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{memo.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {categoryInfo && (
                        <span className={`text-xs ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(memo.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMemo(memo.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Completed Memos */}
      {completedMemos.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400"
          >
            <Check className="w-3 h-3" />
            {completedMemos.length} termine{completedMemos.length > 1 ? 's' : ''}
            <motion.span
              animate={{ rotate: showCompleted ? 180 : 0 }}
              className="inline-block"
            >
              &#9660;
            </motion.span>
          </button>

          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-2"
              >
                {completedMemos.map(memo => (
                  <motion.div
                    key={memo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-xl opacity-60">
                      <button
                        onClick={() => onToggleComplete(memo.id)}
                        className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-green-400" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400 line-through">{memo.text}</p>
                      </div>

                      <button
                        onClick={() => onDeleteMemo(memo.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
