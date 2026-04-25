'use client'

import { useState } from 'react'
import { BucketListItem, ActivityCategory, ProposedTime } from '@/types'
import { format } from 'date-fns'

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  meal: 'bg-petal text-blush-deep',
  cafe: 'bg-sand text-bark-light',
  dessert: 'bg-petal text-blush-deep',
  outdoor: 'bg-sage text-sage-deep',
  culture: 'bg-lavender text-bark-light',
  social: 'bg-petal text-blush-deep',
  study: 'bg-sand text-bark-light',
  fitness: 'bg-sage text-sage-deep',
  nightlife: 'bg-lavender text-bark-light',
}

interface BucketListProps {
  items: BucketListItem[]
  groupId: string
  proposedTimes: ProposedTime[]
  currentUserId: string | null
  onItemAdded: (item: BucketListItem) => void
  onItemUpdated: (id: string, changes: Partial<BucketListItem>) => void
  onItemDeleted: (id: string) => void
  onRsvp: (proposedTimeId: string, response: 'yes' | 'no' | 'maybe') => void
}

export default function BucketList({ items, groupId, proposedTimes, currentUserId, onItemAdded, onItemUpdated, onItemDeleted, onRsvp }: BucketListProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<ActivityCategory>('outdoor')
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all')

  const filtered = items.filter((item) => {
    if (filter === 'todo') return !item.completed
    if (filter === 'done') return item.completed
    return true
  })

  async function addItem() {
    if (!newTitle.trim()) return
    setAdding(true)
    const res = await fetch('/api/bucket-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, title: newTitle.trim(), category: newCategory }),
    })
    const { item } = await res.json()
    onItemAdded(item)
    setNewTitle('')
    setShowAdd(false)
    setAdding(false)
  }

  async function toggleComplete(item: BucketListItem) {
    await fetch('/api/bucket-list', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, completed: !item.completed }),
    })
    onItemUpdated(item.id, { completed: !item.completed })
  }

  async function deleteItem(id: string) {
    await fetch('/api/bucket-list', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    onItemDeleted(id)
  }

  async function toggleUpvote(item: BucketListItem) {
    await fetch('/api/bucket-list', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, upvote: !item.hasUpvoted }),
    })
    onItemUpdated(item.id, {
      hasUpvoted: !item.hasUpvoted,
      upvoteCount: item.upvoteCount + (item.hasUpvoted ? -1 : 1),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(['all', 'todo', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-full capitalize font-medium transition-colors ${
                filter === f
                  ? 'bg-bark text-white'
                  : 'bg-white text-muted border border-sand hover:border-sand-deep'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="px-4 py-1.5 bg-bark text-white text-xs font-medium rounded-full hover:bg-bark-light transition-colors shadow-sm"
        >
          Add item
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-3 p-3.5 bg-white rounded-2xl border border-sand shadow-sm">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as ActivityCategory)}
            className="text-xs border border-sand rounded-xl px-2 py-1.5 bg-cream text-muted focus:outline-none focus:border-blush"
          >
            {(['meal','cafe','dessert','outdoor','culture','social','study','fitness','nightlife'] as ActivityCategory[]).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add something fun..."
            className="flex-1 bg-transparent focus:outline-none text-sm text-bark placeholder:text-muted-light"
          />
          <button
            onClick={addItem}
            disabled={adding || !newTitle.trim()}
            className="px-3 py-1.5 bg-bark text-white text-xs rounded-xl disabled:opacity-40 hover:bg-bark-light transition-colors"
          >
            Save
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {filtered.sort((a, b) => b.upvoteCount - a.upvoteCount).map((item) => {
          const itemProposed = proposedTimes.filter(pt => pt.itemId === item.id)
          return (
            <li
              key={item.id}
              className={`flex flex-col rounded-2xl border transition-all ${
                item.completed
                  ? 'bg-white border-sand opacity-50'
                  : 'bg-white border-sand hover:border-sand-deep shadow-sm'
              }`}
            >
              {/* Main row */}
              <div className="flex items-center gap-3 p-3.5">
                <button
                  onClick={() => toggleComplete(item)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.completed
                      ? 'border-sage-deep bg-sage-deep'
                      : 'border-sand-deep hover:border-blush'
                  }`}
                >
                  {item.completed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item.completed ? 'line-through text-muted' : 'text-bark'}`}>
                    {item.title}
                  </p>
                  {item.locationName && (
                    <p className="text-xs text-muted truncate mt-0.5">{item.locationName}</p>
                  )}
                </div>

                <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline ${CATEGORY_COLORS[item.category]}`}>
                  {item.category}
                </span>

                <button
                  onClick={() => toggleUpvote(item)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    item.hasUpvoted
                      ? 'bg-petal text-blush-deep'
                      : 'bg-sand text-muted hover:bg-sand-deep'
                  }`}
                >
                  <span className="text-[10px]">&#9825;</span>
                  <span>{item.upvoteCount}</span>
                </button>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-blush-deep hover:bg-petal transition-colors text-xs"
                  title="Delete"
                >
                  ✕
                </button>
              </div>

              {/* Proposed times */}
              {itemProposed.length > 0 && (
                <div className="px-3.5 pb-3 flex flex-col gap-1.5">
                  {itemProposed.map((pt) => {
                    const yesCount = pt.rsvps.filter(r => r.response === 'yes').length
                    const noCount  = pt.rsvps.filter(r => r.response === 'no').length
                    return (
                      <div key={pt.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-cream rounded-xl border border-sand">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-bark">
                            {format(new Date(pt.startTime), 'EEE MMM d, h:mm a')} – {format(new Date(pt.endTime), 'h:mm a')}
                          </p>
                          <p className="text-[10px] text-muted mt-0.5">
                            Proposed by {pt.proposedByName}
                            {pt.rsvps.length > 0 && ` · ${yesCount} yes${noCount > 0 ? `, ${noCount} no` : ''}`}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {(['yes', 'no', 'maybe'] as const).map(r => (
                            <button
                              key={r}
                              onClick={() => onRsvp(pt.id, r)}
                              className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors capitalize ${
                                pt.myRsvp === r
                                  ? r === 'yes' ? 'bg-sage text-sage-deep' : r === 'no' ? 'bg-petal text-blush-deep' : 'bg-sand text-bark-light'
                                  : 'bg-sand text-muted hover:bg-sand-deep'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="text-center text-muted text-sm py-10">
          {filter === 'done'
            ? 'Nothing completed yet — get out there.'
            : 'Add your first thing to do before graduation.'}
        </p>
      )}
    </div>
  )
}
