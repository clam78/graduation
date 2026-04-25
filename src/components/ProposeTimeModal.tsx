'use client'

import { useState } from 'react'
import { FreeSlot, BucketListItem } from '@/types'
import { format } from 'date-fns'

interface ProposeTimeModalProps {
  item: BucketListItem
  freeSlots: FreeSlot[]
  onClose: () => void
  onProposed: (itemId: string, slotStart: string, slotEnd: string) => void
}

export default function ProposeTimeModal({ item, freeSlots, onClose, onProposed }: ProposeTimeModalProps) {
  const [selected, setSelected] = useState<FreeSlot | null>(null)
  const [loading, setLoading] = useState(false)

  async function propose() {
    if (!selected) return
    setLoading(true)
    await fetch('/api/proposed-times', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item.id,
        startTime: selected.start.toISOString(),
        endTime: selected.end.toISOString(),
      }),
    })
    onProposed(item.id, selected.start.toISOString(), selected.end.toISOString())
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-bark/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl border border-sand">
        <div className="p-5 border-b border-sand">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-bark">Propose a time</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-sand flex items-center justify-center text-muted hover:bg-sand-deep transition-colors text-sm"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-muted mt-1">{item.title}</p>
        </div>

        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-2">
          {freeSlots.length === 0 ? (
            <p className="text-center text-muted text-sm py-10">
              No shared free windows found in the next two weeks.
            </p>
          ) : (
            freeSlots.map((slot, i) => (
              <button
                key={i}
                onClick={() => setSelected(slot)}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  selected === slot
                    ? 'border-blush bg-petal'
                    : 'border-sand hover:border-sand-deep bg-white'
                }`}
              >
                <p className="text-sm font-medium text-bark">
                  {format(slot.start, 'EEEE, MMMM d')}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {format(slot.start, 'h:mm a')} – {format(slot.end, 'h:mm a')}
                  <span className="mx-1.5 text-sand-deep">·</span>
                  {Math.round(slot.durationMinutes / 60) > 1
                    ? `${Math.round(slot.durationMinutes / 60)} hrs free`
                    : `${slot.durationMinutes} min free`}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-sand">
          <button
            onClick={propose}
            disabled={!selected || loading}
            className="w-full py-3.5 bg-bark text-white rounded-full font-medium text-sm disabled:opacity-40 hover:bg-bark-light transition-colors"
          >
            {loading ? 'Sending...' : 'Propose this time'}
          </button>
        </div>
      </div>
    </div>
  )
}
