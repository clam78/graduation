'use client'

import { useState } from 'react'
import { Suggestion } from '@/types'

interface SuggestionCardProps {
  suggestion: Suggestion
  onAddToBucketList: (suggestion: Suggestion) => void
}

export default function SuggestionCard({ suggestion, onAddToBucketList }: SuggestionCardProps) {
  const { venue, reason, isOpenDuringSlot } = suggestion
  const [added, setAdded] = useState(false)

  async function handleAdd() {
    await onAddToBucketList(suggestion)
    setAdded(true)
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-sand shadow-sm hover:border-sand-deep transition-all">
      {venue.imageUrl && (
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="w-full h-24 object-cover rounded-xl"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm text-bark truncate">{venue.name}</p>
          {venue.address && (
            <p className="text-xs text-muted truncate mt-0.5">{venue.address}</p>
          )}
        </div>
        {venue.rating && (
          <span className="text-xs font-medium text-bark-light flex-shrink-0">{venue.rating} ★</span>
        )}
      </div>

      <p className="text-xs text-muted leading-relaxed">{reason}</p>

      <div className="flex items-center justify-between pt-1">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isOpenDuringSlot ? 'bg-sage text-sage-deep' : 'bg-petal text-blush-deep'
        }`}>
          {isOpenDuringSlot ? 'Open' : 'Closed'}
        </span>
        <div className="flex items-center gap-2">
          {venue.yelpUrl && (
            <a
              href={venue.yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-bark underline underline-offset-2 transition-colors"
            >
              View
            </a>
          )}
          <button
            onClick={handleAdd}
            disabled={added}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              added
                ? 'bg-sage text-sage-deep cursor-default'
                : 'bg-bark text-white hover:bg-bark-light'
            }`}
          >
            {added ? 'Added to list!' : 'Add to list'}
          </button>
        </div>
      </div>
    </div>
  )
}
