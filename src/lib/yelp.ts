import { Venue, VenueHourPeriod, ActivityCategory } from '@/types'

const YELP_BASE = 'https://api.yelp.com/v3'

const CATEGORY_TERMS: Record<ActivityCategory, string> = {
  meal: 'restaurants',
  cafe: 'cafes,coffee',
  outdoor: 'parks,hiking',
  culture: 'museums,arts',
  social: 'bars,entertainment',
  study: 'libraries,coffee',
  fitness: 'gyms,fitness',
  nightlife: 'bars,nightlife',
}

interface YelpBusiness {
  id: string
  name: string
  rating: number
  price?: string
  location: { address1: string; city: string }
  image_url?: string
  url: string
  hours?: {
    open: { day: number; start: string; end: string; is_overnight: boolean }[]
    is_open_now: boolean
  }[]
}

export async function searchVenues(
  category: ActivityCategory,
  location = 'Boston, MA',
  limit = 10
): Promise<Venue[]> {
  const term = CATEGORY_TERMS[category]
  const url = new URL(`${YELP_BASE}/businesses/search`)
  url.searchParams.set('term', term)
  url.searchParams.set('location', location)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('sort_by', 'rating')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` },
    next: { revalidate: 3600 }, // cache for 1 hour
  })

  if (!res.ok) throw new Error(`Yelp API error: ${res.status}`)
  const data = await res.json()

  return (data.businesses as YelpBusiness[]).map((b) => ({
    id: b.id,
    name: b.name,
    category,
    address: `${b.location.address1}, ${b.location.city}`,
    rating: b.rating,
    priceLevel: b.price,
    imageUrl: b.image_url,
    yelpUrl: b.url,
    hours: parseYelpHours(b.hours),
  }))
}

export async function getVenueDetails(yelpId: string): Promise<Venue | null> {
  const res = await fetch(`${YELP_BASE}/businesses/${yelpId}`, {
    headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` },
    next: { revalidate: 3600 },
  })

  if (!res.ok) return null
  const b: YelpBusiness = await res.json()

  return {
    id: b.id,
    name: b.name,
    category: 'meal', // override at call site if needed
    address: `${b.location.address1}, ${b.location.city}`,
    rating: b.rating,
    priceLevel: b.price,
    imageUrl: b.image_url,
    yelpUrl: b.url,
    hours: parseYelpHours(b.hours),
  }
}

function parseYelpHours(
  yelpHours?: YelpBusiness['hours']
): VenueHourPeriod[] | undefined {
  if (!yelpHours || yelpHours.length === 0) return undefined
  return yelpHours[0].open.map((p) => ({
    day: p.day,
    start: p.start,
    end: p.end,
  }))
}
