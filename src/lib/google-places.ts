import { Venue, VenueHourPeriod, ActivityCategory } from '@/types'

const PLACES_BASE = 'https://places.googleapis.com/v1/places:searchText'

const CATEGORY_QUERIES: Record<ActivityCategory, string> = {
  meal: 'restaurants in Boston MA',
  cafe: 'coffee shops cafes in Boston MA',
  dessert: 'ice cream dessert shops in Boston MA',
  outdoor: 'parks gardens in Boston MA',
  culture: 'museums art galleries in Boston MA',
  social: 'bars entertainment venues in Boston MA',
  study: 'libraries study cafes in Boston MA',
  fitness: 'gyms fitness centers in Boston MA',
  nightlife: 'bars nightlife in Boston MA',
}

const PRICE_LEVEL_MAP: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

interface PlacesPhoto {
  name: string
}

interface PlacesOpenPeriod {
  open: { day: number; hour: number; minute: number }
  close?: { day: number; hour: number; minute: number }
}

interface PlacesResult {
  id: string
  displayName: { text: string }
  formattedAddress?: string
  rating?: number
  priceLevel?: string
  photos?: PlacesPhoto[]
  regularOpeningHours?: { periods: PlacesOpenPeriod[] }
  googleMapsUri?: string
}

export async function searchVenues(
  category: ActivityCategory,
  limit = 10
): Promise<Venue[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return []

  const res = await fetch(PLACES_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.rating',
        'places.priceLevel',
        'places.photos',
        'places.regularOpeningHours',
        'places.googleMapsUri',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery: CATEGORY_QUERIES[category],
      maxResultCount: limit,
      locationBias: {
        circle: {
          center: { latitude: 42.3601, longitude: -71.0589 }, // Boston
          radius: 6000,
        },
      },
    }),
    next: { revalidate: 3600 },
  })

  if (!res.ok) return []
  const data = await res.json()

  return ((data.places ?? []) as PlacesResult[]).map((p) => ({
    id: p.id,
    name: p.displayName.text,
    category,
    address: p.formattedAddress,
    rating: p.rating,
    priceLevel: p.priceLevel ? PRICE_LEVEL_MAP[p.priceLevel] : undefined,
    imageUrl: p.photos?.[0]
      ? buildPhotoUrl(p.photos[0].name, apiKey)
      : undefined,
    yelpUrl: p.googleMapsUri,
    hours: parsePlacesHours(p.regularOpeningHours?.periods),
  }))
}

function buildPhotoUrl(photoName: string, apiKey: string): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${apiKey}`
}

// Google Places: day 0=Sun … 6=Sat (JS convention)
// Our VenueHourPeriod: day 0=Mon … 6=Sun (Yelp convention)
function googleDayToOurDay(googleDay: number): number {
  return googleDay === 0 ? 6 : googleDay - 1
}

function toHHMM(hour: number, minute: number): string {
  return String(hour).padStart(2, '0') + String(minute).padStart(2, '0')
}

function parsePlacesHours(
  periods?: PlacesOpenPeriod[]
): VenueHourPeriod[] | undefined {
  if (!periods || periods.length === 0) return undefined
  return periods
    .filter((p) => p.close) // skip 24h open entries
    .map((p) => ({
      day: googleDayToOurDay(p.open.day),
      start: toHHMM(p.open.hour, p.open.minute),
      end: toHHMM(p.close!.hour, p.close!.minute),
    }))
}
