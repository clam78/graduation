'use client'

import { useState, useRef, useEffect } from 'react'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { FreeSlot, Suggestion } from '@/types'
import SuggestionCard from './SuggestionCard'

const HOUR_HEIGHT = 48  // px per hour
const START_HOUR = 8
const END_HOUR = 22
const TOTAL_HOURS = END_HOUR - START_HOUR
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT

interface WeekCalendarProps {
  freeSlots: FreeSlot[]
  selectedSlot: FreeSlot | null
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  onSlotSelect: (slot: FreeSlot | null) => void
  onAddToBucketList: (s: Suggestion) => void
}

export default function WeekCalendar({
  freeSlots,
  selectedSlot,
  suggestions,
  loadingSuggestions,
  onSlotSelect,
  onAddToBucketList,
}: WeekCalendarProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR)

  // Scroll to suggestions when a slot is selected
  useEffect(() => {
    if (selectedSlot && suggestionsRef.current) {
      setTimeout(() => {
        suggestionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [selectedSlot])

  function slotStyle(slot: FreeSlot) {
    const startH = slot.start.getHours() + slot.start.getMinutes() / 60
    const endH = slot.end.getHours() + slot.end.getMinutes() / 60
    const clampedStart = Math.max(startH, START_HOUR)
    const clampedEnd = Math.min(endH, END_HOUR)
    const top = (clampedStart - START_HOUR) * HOUR_HEIGHT
    const height = Math.max((clampedEnd - clampedStart) * HOUR_HEIGHT, 20)
    return { top: `${top}px`, height: `${height}px` }
  }

  function formatHour(h: number) {
    if (h === 12) return '12p'
    return h < 12 ? `${h}a` : `${h - 12}p`
  }

  const today = new Date()
  const firstWeekStart = startOfWeek(today, { weekStartsOn: 1 })
  const GRADUATION = new Date('2026-05-29')
  const lastWeekStart = startOfWeek(GRADUATION, { weekStartsOn: 1 })
  const isFirstWeek = weekStart <= firstWeekStart
  const isLastWeek = weekStart >= lastWeekStart

  return (
    <div className="flex flex-col gap-4">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (!isFirstWeek) setWeekStart(d => addDays(d, -7)) }}
          disabled={isFirstWeek}
          className="px-3 py-1.5 text-xs text-muted bg-white border border-sand rounded-full hover:border-sand-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-sand"
        >
          ← prev
        </button>
        <p className="text-xs font-medium text-muted">
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d')}
        </p>
        <button
          onClick={() => { if (!isLastWeek) setWeekStart(d => addDays(d, 7)) }}
          disabled={isLastWeek}
          className="px-3 py-1.5 text-xs text-muted bg-white border border-sand rounded-full hover:border-sand-deep transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-sand"
        >
          next →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-sand shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="flex border-b border-sand">
          <div className="w-8 flex-shrink-0" />
          {days.map((day) => {
            const isToday = isSameDay(day, today)
            return (
              <div key={day.toISOString()} className="flex-1 py-2 text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide">
                  {format(day, 'EEE')}
                </p>
                <p className={`text-xs font-semibold mt-0.5 w-5 h-5 rounded-full mx-auto flex items-center justify-center ${
                  isToday ? 'bg-bark text-white' : 'text-bark'
                }`}>
                  {format(day, 'd')}
                </p>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="flex overflow-y-auto" style={{ maxHeight: '420px' }}>
          {/* Hour labels */}
          <div className="w-8 flex-shrink-0 relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-1 text-[9px] text-muted-light leading-none"
                style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT - 4}px` }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const daySlots = freeSlots.filter(s => isSameDay(s.start, day))
            return (
              <div
                key={day.toISOString()}
                className="flex-1 relative border-l border-sand/60"
                style={{ height: `${TOTAL_HEIGHT}px` }}
              >
                {/* Hour lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-sand/40"
                    style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Free slot blocks */}
                {daySlots.map((slot, i) => {
                  const isSelected = selectedSlot === slot
                  return (
                    <button
                      key={i}
                      onClick={() => onSlotSelect(slot)}
                      style={slotStyle(slot)}
                      className={`absolute inset-x-0.5 rounded-lg text-[9px] font-medium leading-tight px-1 pt-1 text-left transition-all overflow-hidden ${
                        isSelected
                          ? 'bg-blush text-white shadow-md z-10'
                          : 'bg-petal text-blush-deep hover:bg-blush hover:text-white'
                      }`}
                    >
                      <span className="block">{format(slot.start.getHours() < START_HOUR ? new Date(slot.start.getFullYear(), slot.start.getMonth(), slot.start.getDate(), START_HOUR) : slot.start, 'h:mma')}–{format(slot.end, 'h:mma')}</span>
                      <span className="block opacity-80">
                        {(slot.durationMinutes / 60 % 1 === 0
                          ? slot.durationMinutes / 60
                          : (slot.durationMinutes / 60).toFixed(1)
                        )} hr
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {freeSlots.length === 0 && (
        <p className="text-center text-muted text-sm py-6">
          Connect calendars to see shared free windows.
        </p>
      )}

      {/* Suggestions — appear right below calendar when a slot is selected */}
      {selectedSlot && (
        <div ref={suggestionsRef}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-serif text-lg text-bark">Suggestions</h2>
              <p className="text-xs text-muted">
                {format(selectedSlot.start, 'EEEE MMM d, h:mm a')} – {format(selectedSlot.end, 'h:mm a')}
              </p>
            </div>
            <button
              onClick={() => onSlotSelect(null)}
              className="text-xs text-muted hover:text-bark"
            >
              ✕
            </button>
          </div>

          {loadingSuggestions ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-blush border-t-transparent rounded-full animate-spin" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No suggestions for this window.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((s, i) => (
                <SuggestionCard key={i} suggestion={s} onAddToBucketList={onAddToBucketList} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
