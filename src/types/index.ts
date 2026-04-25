export type ActivityCategory =
  | 'meal'
  | 'cafe'
  | 'outdoor'
  | 'culture'
  | 'social'
  | 'study'
  | 'fitness'
  | 'nightlife'

export type SlotType =
  | 'breakfast'
  | 'morning'
  | 'lunch'
  | 'afternoon'
  | 'dinner'
  | 'evening'
  | 'late_night'

export interface VenueHourPeriod {
  day: number    // 0=Mon … 6=Sun (Yelp convention)
  start: string  // "1000"
  end: string    // "2200"
}

export interface Venue {
  id: string
  name: string
  category: ActivityCategory
  address?: string
  rating?: number
  priceLevel?: string  // "$" | "$$" | "$$$" | "$$$$"
  imageUrl?: string
  yelpUrl?: string
  hours?: VenueHourPeriod[]
  isCurated?: boolean  // part of the Boston curated list
}

export interface FreeSlot {
  start: Date
  end: Date
  durationMinutes: number
  slotType: SlotType
  dayOfWeek: number  // 0=Sun … 6=Sat
  isWeekend: boolean
}

export interface BucketListItem {
  id: string
  groupId: string
  title: string
  description?: string
  category: ActivityCategory
  locationName?: string
  address?: string
  yelpId?: string
  hours?: VenueHourPeriod[]
  addedBy: string
  addedByName: string
  completed: boolean
  completedAt?: string
  upvoteCount: number
  hasUpvoted: boolean
  createdAt: string
}

export interface ProposedTime {
  id: string
  itemId: string
  proposedBy: string
  proposedByName: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled'
  rsvps: { userId: string; displayName: string; response: 'yes' | 'no' | 'maybe' }[]
  createdAt: string
}

export interface Group {
  id: string
  name: string
  graduationDate: string
  inviteCode: string
  members: GroupMember[]
  createdAt: string
}

export interface GroupMember {
  userId: string
  displayName: string
  hasCalendarConnected: boolean
  joinedAt: string
}

export interface CalendarBusyBlock {
  userId: string
  start: string
  end: string
}

export interface Suggestion {
  venue: Venue
  slot: FreeSlot
  relevanceScore: number
  isOpenDuringSlot: boolean
  reason: string
}
