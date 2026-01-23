/**
 * Notes Section Component
 * Displays and manages user notes in the profile
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Edit3,
  X,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { UserNote, UserNoteInput } from '../../types/userData'

interface NotesSectionProps {
  notes: UserNote[]
  onAddNote: (note: UserNoteInput) => string
  onUpdateNote: (id: string, updates: Partial<UserNote>) => void
  onDeleteNote: (id: string) => void
  onTogglePin: (id: string) => void
}

const NOTE_COLORS = [
  { name: 'default', class: 'bg-slate-800/50' },
  { name: 'blue', class: 'bg-blue-500/20 border-blue-500/30' },
  { name: 'green', class: 'bg-green-500/20 border-green-500/30' },
  { name: 'amber', class: 'bg-amber-500/20 border-amber-500/30' },
  { name: 'purple', class: 'bg-purple-500/20 border-purple-500/30' },
  { name: 'pink', class: 'bg-pink-500/20 border-pink-500/30' }
]

export function NotesSection({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin
}: NotesSectionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [selectedColor, setSelectedColor] = useState('default')

  const resetForm = () => {
    setTitle('')
    setContent('')
    setTags([])
    setTagInput('')
    setSelectedColor('default')
    setIsCreating(false)
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return

    if (editingId) {
      onUpdateNote(editingId, {
        title: title.trim(),
        content: content.trim(),
        tags,
        color: selectedColor
      })
    } else {
      onAddNote({
        title: title.trim(),
        content: content.trim(),
        tags,
        color: selectedColor,
        isPinned: false
      })
    }

    resetForm()
  }

  const handleEdit = (note: UserNote) => {
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags)
    setSelectedColor(note.color || 'default')
    setEditingId(note.id)
    setIsCreating(true)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  // Sort notes: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Mes Notes</h3>
          <span className="text-xs text-gray-500">({notes.length})</span>
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

      {/* Create/Edit Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card variant="glass" padding="md" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">
                  {editingId ? 'Modifier la note' : 'Nouvelle note'}
                </h4>
                <button onClick={resetForm} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Titre de la note..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <textarea
                placeholder="Contenu..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter un tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button onClick={handleAddTag} variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Color Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Couleur:</span>
                {NOTE_COLORS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-6 h-6 rounded-full ${color.class} border-2 ${
                      selectedColor === color.name ? 'border-white' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button onClick={resetForm} variant="ghost" size="sm">
                  Annuler
                </Button>
                <Button onClick={handleSubmit} variant="primary" size="sm">
                  {editingId ? 'Modifier' : 'Creer'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucune note pour l'instant</p>
          <p className="text-gray-500 text-xs mt-1">
            Ajoute des notes pour organiser tes idees
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedNotes.map((note, index) => {
            const colorClass = NOTE_COLORS.find(c => c.name === note.color)?.class || NOTE_COLORS[0].class
            const isExpanded = expandedId === note.id

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="default"
                  padding="none"
                  className={`${colorClass} border overflow-hidden`}
                >
                  <div className="p-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {note.isPinned && (
                            <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          )}
                          <h4 className="font-medium text-white truncate">{note.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : note.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Preview or Full Content */}
                    <p className={`text-sm text-gray-300 mt-2 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                      {note.content}
                    </p>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-white/5 text-gray-400 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions (visible when expanded) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10"
                        >
                          <Button
                            onClick={() => onTogglePin(note.id)}
                            variant="ghost"
                            size="sm"
                            className={note.isPinned ? 'text-amber-400' : ''}
                          >
                            <Pin className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(note)}
                            variant="ghost"
                            size="sm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteNote(note.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
