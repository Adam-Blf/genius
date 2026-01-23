/**
 * Custom Data Section Component
 * Allows users to store arbitrary information
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Plus,
  Trash2,
  Edit3,
  X,
  Lock,
  Eye,
  EyeOff,
  Folder,
  Link,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  List
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { CustomDataEntry, CustomDataInput } from '../../types/userData'

interface CustomDataSectionProps {
  data: CustomDataEntry[]
  onAddData: (data: CustomDataInput) => string
  onUpdateData: (id: string, updates: Partial<CustomDataEntry>) => void
  onDeleteData: (id: string) => void
  getAllCategories: () => string[]
}

const DATA_TYPES = [
  { type: 'text', label: 'Texte', icon: Type },
  { type: 'number', label: 'Nombre', icon: Hash },
  { type: 'boolean', label: 'Oui/Non', icon: ToggleLeft },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'url', label: 'Lien', icon: Link },
  { type: 'list', label: 'Liste', icon: List }
] as const

const DATA_ICONS = [
  'file-text', 'star', 'heart', 'bookmark', 'flag',
  'zap', 'target', 'award', 'gift', 'key'
]

export function CustomDataSection({
  data,
  onAddData,
  onUpdateData,
  onDeleteData,
  getAllCategories
}: CustomDataSectionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPrivate, setShowPrivate] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Form state
  const [label, setLabel] = useState('')
  const [value, setValue] = useState<string>('')
  const [dataType, setDataType] = useState<CustomDataEntry['type']>('text')
  const [category, setCategory] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [listItems, setListItems] = useState<string[]>([])
  const [listInput, setListInput] = useState('')

  const existingCategories = getAllCategories()

  const resetForm = () => {
    setLabel('')
    setValue('')
    setDataType('text')
    setCategory('')
    setIsPrivate(false)
    setListItems([])
    setListInput('')
    setIsCreating(false)
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!label.trim()) return

    let finalValue: string | number | boolean | string[] = value

    if (dataType === 'number') {
      finalValue = parseFloat(value) || 0
    } else if (dataType === 'boolean') {
      finalValue = value === 'true'
    } else if (dataType === 'list') {
      finalValue = listItems
    }

    if (editingId) {
      onUpdateData(editingId, {
        label: label.trim(),
        value: finalValue,
        type: dataType,
        category: category.trim() || undefined,
        isPrivate
      })
    } else {
      onAddData({
        label: label.trim(),
        value: finalValue,
        type: dataType,
        category: category.trim() || undefined,
        isPrivate
      })
    }

    resetForm()
  }

  const handleEdit = (entry: CustomDataEntry) => {
    setLabel(entry.label)
    setDataType(entry.type)
    setCategory(entry.category || '')
    setIsPrivate(entry.isPrivate)

    if (entry.type === 'list' && Array.isArray(entry.value)) {
      setListItems(entry.value)
      setValue('')
    } else if (entry.type === 'boolean') {
      setValue(entry.value ? 'true' : 'false')
    } else {
      setValue(String(entry.value))
    }

    setEditingId(entry.id)
    setIsCreating(true)
  }

  const handleAddListItem = () => {
    if (listInput.trim() && !listItems.includes(listInput.trim())) {
      setListItems([...listItems, listInput.trim()])
      setListInput('')
    }
  }

  const togglePrivateVisibility = (id: string) => {
    setShowPrivate(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Group data by category
  const categories = new Map<string, CustomDataEntry[]>()
  categories.set('Sans categorie', [])

  data.forEach(entry => {
    const cat = entry.category || 'Sans categorie'
    if (!categories.has(cat)) {
      categories.set(cat, [])
    }
    categories.get(cat)!.push(entry)
  })

  const filteredCategories = selectedCategory
    ? new Map([[selectedCategory, categories.get(selectedCategory) || []]])
    : categories

  const renderValue = (entry: CustomDataEntry) => {
    if (entry.isPrivate && !showPrivate.has(entry.id)) {
      return '********'
    }

    if (entry.type === 'boolean') {
      return entry.value ? 'Oui' : 'Non'
    }

    if (entry.type === 'list' && Array.isArray(entry.value)) {
      return entry.value.join(', ')
    }

    if (entry.type === 'url') {
      return (
        <a
          href={String(entry.value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-400 hover:underline truncate block"
        >
          {String(entry.value)}
        </a>
      )
    }

    if (entry.type === 'date') {
      return new Date(String(entry.value)).toLocaleDateString('fr-FR')
    }

    return String(entry.value)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Donnees Personnelles</h3>
          <span className="text-xs text-gray-500">({data.length})</span>
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

      {/* Category Filter */}
      {existingCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              !selectedCategory
                ? 'bg-white/10 border-white/30 text-white'
                : 'border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            Tout
          </button>
          {existingCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                selectedCategory === cat
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

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
                  {editingId ? 'Modifier' : 'Nouvelle donnee'}
                </h4>
                <button onClick={resetForm} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Label */}
              <input
                type="text"
                placeholder="Nom du champ (ex: Date de naissance)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* Type Selection */}
              <div className="space-y-2">
                <span className="text-xs text-gray-400">Type de donnee:</span>
                <div className="flex flex-wrap gap-2">
                  {DATA_TYPES.map(dt => (
                    <button
                      key={dt.type}
                      onClick={() => setDataType(dt.type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        dataType === dt.type
                          ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <dt.icon className="w-3.5 h-3.5" />
                      {dt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value Input */}
              {dataType === 'text' && (
                <input
                  type="text"
                  placeholder="Valeur..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}

              {dataType === 'number' && (
                <input
                  type="number"
                  placeholder="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}

              {dataType === 'boolean' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setValue('true')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      value === 'true'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-slate-800 text-gray-400 border border-transparent'
                    }`}
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setValue('false')}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      value === 'false'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-slate-800 text-gray-400 border border-transparent'
                    }`}
                  >
                    Non
                  </button>
                </div>
              )}

              {dataType === 'date' && (
                <input
                  type="date"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}

              {dataType === 'url' && (
                <input
                  type="url"
                  placeholder="https://..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}

              {dataType === 'list' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {listItems.map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-white text-xs rounded"
                      >
                        {item}
                        <button onClick={() => setListItems(listItems.filter((_, j) => j !== i))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter un element..."
                      value={listInput}
                      onChange={(e) => setListInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddListItem()}
                      className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button onClick={handleAddListItem} variant="ghost" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Categorie (optionnel)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="existing-categories"
                  className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <datalist id="existing-categories">
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>

                <Button
                  onClick={() => setIsPrivate(!isPrivate)}
                  variant={isPrivate ? 'primary' : 'ghost'}
                  size="sm"
                  title={isPrivate ? 'Prive' : 'Public'}
                >
                  <Lock className="w-4 h-4" />
                </Button>
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

      {/* Data List */}
      {data.length === 0 ? (
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucune donnee personnalisee</p>
          <p className="text-gray-500 text-xs mt-1">
            Stocke n'importe quelle information
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(filteredCategories).map(([categoryName, entries]) => {
            if (entries.length === 0) return null

            return (
              <div key={categoryName}>
                {filteredCategories.size > 1 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-400">{categoryName}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{entry.label}</span>
                            {entry.isPrivate && (
                              <Lock className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                          <div className="text-sm text-white mt-0.5 truncate">
                            {renderValue(entry)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {entry.isPrivate && (
                            <button
                              onClick={() => togglePrivateVisibility(entry.id)}
                              className="p-1.5 text-gray-500 hover:text-white"
                            >
                              {showPrivate.has(entry.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1.5 text-gray-500 hover:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteData(entry.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
