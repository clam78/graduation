import { FreeSlot, Venue, Suggestion, ActivityCategory } from '@/types'
import { SLOT_CATEGORY_MAP } from './boston-activities'
import { format } from 'date-fns'

// Check if a venue is open during an entire time slot.
// Venue hours use Yelp convention: 0=Mon … 6=Sun.
// JS Date.getDay(): 0=Sun, 1=Mon … 6=Sat.
function jsToYelpDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1
}

export function isVenueOpenDuring(venue: Venue, slot: FreeSlot): boolean {
  if (!venue.hours || venue.hours.length === 0) return true

  const yelpDay = jsToYelpDay(slot.start.getDay())
  const startHHMM = format(slot.start, 'HHmm')
  const endHHMM = format(slot.end, 'HHmm')

  return venue.hours.some(
    (period) =>
      period.day === yelpDay &&
      period.start <= startHHMM &&
      period.end >= endHHMM
  )
}

// Returns the suggested categories for a given slot, ordered by relevance.
export function getSuggestedCategories(slot: FreeSlot): ActivityCategory[] {
  const base = SLOT_CATEGORY_MAP[slot.slotType] ?? ['meal', 'outdoor']
  // On weekdays during work hours, boost study options
  if (!slot.isWeekend && slot.slotType === 'afternoon') {
    return ['study', 'cafe', ...base.filter((c) => c !== 'study' && c !== 'cafe')]
  }
  return base
}

// Score a venue for a given slot. Higher = better match.
export function scoreVenueForSlot(venue: Venue, slot: FreeSlot): number {
  let score = 0

  const suggestedCategories = getSuggestedCategories(slot)
  const categoryIndex = suggestedCategories.indexOf(venue.category)
  if (categoryIndex !== -1) {
    score += (suggestedCategories.length - categoryIndex) * 10
  }

  if (venue.rating) score += venue.rating * 5
  if (venue.isCurated) score += 20
  if (!isVenueOpenDuring(venue, slot)) score -= 100 // hard penalty for closed

  return score
}

// Build human-readable reason string shown on suggestion cards.
export function buildSuggestionReason(
  venue: Venue,
  slot: FreeSlot,
  isOpen: boolean
): string {
  if (!isOpen) {
    return `${venue.name} is closed during this window — try a different time.`
  }

  if (venue.tagline) return venue.tagline

  const dayLabel = slot.isWeekend ? 'weekend' : 'weekday'
  const slotLabels: Record<string, string> = {
    breakfast: 'morning fuel before the day starts',
    morning: 'a relaxed morning outing',
    lunch: 'a midday break',
    afternoon: slot.isWeekend ? 'an afternoon adventure' : 'an afternoon hangout',
    dinner: 'dinner together',
    evening: 'a fun evening out',
    late_night: 'a late-night hang',
  }

  return `Perfect for ${slotLabels[slot.slotType] ?? 'hanging out'} on a ${dayLabel}.`
}

// Combine curated Boston activities + Yelp results, score them, return ranked.
export function rankSuggestions(
  venues: Venue[],
  slot: FreeSlot,
  maxResults = 5
): Suggestion[] {
  return venues
    .map((venue) => {
      const isOpen = isVenueOpenDuring(venue, slot)
      return {
        venue,
        slot,
        relevanceScore: scoreVenueForSlot(venue, slot),
        isOpenDuringSlot: isOpen,
        reason: buildSuggestionReason(venue, slot, isOpen),
      }
    })
    .filter((s) => s.isOpenDuringSlot)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults)
}
