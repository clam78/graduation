import { NextRequest, NextResponse } from 'next/server'
import { BOSTON_ACTIVITIES } from '@/lib/boston-activities'
import { searchVenues } from '@/lib/google-places'
import { rankSuggestions, getSuggestedCategories } from '@/lib/scheduler'
import { FreeSlot, Venue } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const slot: FreeSlot = {
    ...body.slot,
    start: new Date(body.slot.start),
    end: new Date(body.slot.end),
  }

  const categories = getSuggestedCategories(slot)

  // Pull Google Places results for the top 2 relevant categories
  const placesResults = await Promise.allSettled(
    categories.slice(0, 2).map((cat) => searchVenues(cat, 8))
  )

  const placesVenues = placesResults
    .filter((r): r is PromiseFulfilledResult<Venue[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)

  // Merge curated Boston activities + Places results
  const curatedForSlot = BOSTON_ACTIVITIES.filter((a) =>
    categories.includes(a.category)
  )
  const allVenues = [...curatedForSlot, ...placesVenues]

  const suggestions = rankSuggestions(allVenues, slot, 8)

  return NextResponse.json({ suggestions })
}
