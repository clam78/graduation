'use client'

import { useEffect, useState } from 'react'
import { FreeSlot, BucketListItem } from '@/types'
import { format } from 'date-fns'

interface ProposeTimeModalProps {
  item: BucketListItem
  freeSlots: FreeSlot[]
  onClose: () => void
  onProposed: () => void
}

function timeOptions(from: Date, to: Date, stepMin = 30): Date[] {
  const opts: Date[] = []
  let cur = new Date(from)
  while (cur < to) {
    opts.push(new Date(cur))
    cur = new Date(cur.getTime() + stepMin * 60 * 1000)
  }
  return opts
}

export default function ProposeTimeModal({ item, freeSlots, onClose, onProposed }: ProposeTimeModalProps) {
  const [selected, setSelected] = useState<FreeSlot | null>(null)
  const [startISO, setStartISO] = useState('')
  const [endISO, setEndISO] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!selected) return
    const defaultEnd = new Date(selected.start.getTime() + 60 * 60 * 1000)
    setStartISO(selected.start.toISOString())
    setEndISO((defaultEnd <= selected.end ? defaultEnd : selected.end).toISOString())
  }, [selected])

  // Re-clamp end if start moves past it
  useEffect(() => {
    if (!startISO || !endISO || !selected) return
    const s = new Date(startISO)
    const e = new Date(endISO)
    if (e <= s) {
      const next = new Date(s.getTime() + 60 * 60 * 1000)
      setEndISO((next <= selected.end ? next : selected.end).toISOString())
    }
  }, [startISO])

  async function propose() {
    if (!startISO || !endISO) return
    setLoading(true)
    await fetch('/api/proposed-times', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, startTime: startISO, endTime: endISO }),
    })
    setDone(true)
    setLoading(false)
    setTimeout(() => { onProposed(); onClose() }, 1200)
  }

  const startOpts = selected ? timeOptions(selected.start, selected.end) : []
  const endOpts = startISO && selected
    ? timeOptions(new Date(new Date(startISO).getTime() + 30 * 60 * 1000), new Date(selected.end.getTime() + 1))
    : []

  return (
    <div className="fixed inset-0 bg-bark/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-xl border border-sand">
        <div className="p-5 border-b border-sand flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-bark">Propose a time</h2>
            <p className="text-xs text-muted mt-0.5">{item.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-sand flex items-center justify-center text-muted hover:bg-sand-deep transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-2">
          {freeSlots.length === 0 ? (
            <p className="text-center text-muted text-sm py-10">No shared free windows in the next two weeks.</p>
          ) : (
            freeSlots.map((slot, i) => (
              <div key={i}>
                <button
                  onClick={() => setSelected(selected === slot ? null : slot)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    selected === slot
                      ? 'border-blush bg-petal'
                      : 'border-sand hover:border-sand-deep bg-white'
                  }`}
                >
                  <p className="text-sm font-medium text-bark">{format(slot.start, 'EEEE, MMMM d')}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {format(slot.start, 'h:mm a')} – {format(slot.end, 'h:mm a')}
                    <span className="mx-1.5 text-sand-deep">·</span>
                    {slot.durationMinutes >= 60
                      ? `${(slot.durationMinutes / 60 % 1 === 0 ? slot.durationMinutes / 60 : (slot.durationMinutes / 60).toFixed(1))} hrs free`
                      : `${slot.durationMinutes} min free`}
                  </p>
                </button>

                {selected === slot && (
                  <div className="mt-1 mx-1 p-3.5 bg-cream rounded-2xl border border-sand">
                    <p className="text-xs font-medium text-bark mb-2">Pick exact time</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-[10px] text-muted mb-1">Start</p>
                        <select
                          value={startISO}
                          onChange={e => setStartISO(e.target.value)}
                          className="w-full text-xs border border-sand rounded-xl px-2 py-1.5 bg-white text-bark focus:outline-none focus:border-blush"
                        >
                          {startOpts.map(t => (
                            <option key={t.toISOString()} value={t.toISOString()}>
                              {format(t, 'h:mm a')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-muted text-xs mt-4">to</span>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted mb-1">End</p>
                        <select
                          value={endISO}
                          onChange={e => setEndISO(e.target.value)}
                          className="w-full text-xs border border-sand rounded-xl px-2 py-1.5 bg-white text-bark focus:outline-none focus:border-blush"
                        >
                          {endOpts.map(t => (
                            <option key={t.toISOString()} value={t.toISOString()}>
                              {format(t, 'h:mm a')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-sand">
          <button
            onClick={propose}
            disabled={!selected || !startISO || !endISO || loading || done}
            className="w-full py-3.5 bg-bark text-white rounded-full font-medium text-sm disabled:opacity-40 hover:bg-bark-light transition-colors"
          >
            {done ? 'Proposed!' : loading ? 'Sending...' : 'Propose this time'}
          </button>
        </div>
      </div>
    </div>
  )
}
