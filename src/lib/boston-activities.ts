import { Venue, VenueHourPeriod, ActivityCategory } from '@/types'

// 0=Mon … 6=Sun (Yelp/our convention)
function weekdays(start: string, end: string): VenueHourPeriod[] {
  return [0, 1, 2, 3, 4].map((day) => ({ day, start, end }))
}

function allWeek(start: string, end: string): VenueHourPeriod[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, start, end }))
}

function weekends(start: string, end: string): VenueHourPeriod[] {
  return [5, 6].map((day) => ({ day, start, end }))
}

function days(dayNums: number[], start: string, end: string): VenueHourPeriod[] {
  return dayNums.map((day) => ({ day, start, end }))
}

export const BOSTON_ACTIVITIES: Venue[] = [
  // ── Outdoor ──────────────────────────────────────────────────────────────
  {
    id: 'boston-common',
    name: 'Boston Common',
    category: 'outdoor',
    address: 'Boston Common, Boston, MA',
    isCurated: true,
    // open 24/7
    hours: allWeek('0000', '2359'),
  },
  {
    id: 'charles-river-esplanade',
    name: 'Charles River Esplanade',
    category: 'outdoor',
    address: 'Charles River Esplanade, Boston, MA',
    isCurated: true,
    hours: allWeek('0000', '2359'),
  },
  {
    id: 'swan-boats',
    name: 'Swan Boats',
    category: 'outdoor',
    address: 'Public Garden, Boston, MA',
    isCurated: true,
    // Mid-April to mid-September, 10am–4pm (Mon–Fri), 10am–5pm (weekends)
    hours: [
      ...weekdays('1000', '1600'),
      ...weekends('1000', '1700'),
    ],
  },
  {
    id: 'harvard-square',
    name: 'Harvard Square',
    category: 'outdoor',
    address: 'Harvard Square, Cambridge, MA',
    isCurated: true,
    hours: allWeek('0800', '2200'),
  },
  {
    id: 'newbury-street',
    name: 'Newbury Street',
    category: 'outdoor',
    address: 'Newbury St, Boston, MA',
    isCurated: true,
    hours: allWeek('1000', '2100'),
  },
  {
    id: 'north-end-walk',
    name: 'North End Food Walk',
    category: 'outdoor',
    address: 'Hanover St, Boston, MA',
    isCurated: true,
    hours: allWeek('1100', '2200'),
  },
  {
    id: 'arnold-arboretum',
    name: 'Arnold Arboretum',
    category: 'outdoor',
    address: '125 Arborway, Jamaica Plain, MA',
    isCurated: true,
    hours: allWeek('0700', '2000'),
  },

  // ── Culture ───────────────────────────────────────────────────────────────
  {
    id: 'mfa-boston',
    name: 'Museum of Fine Arts (MFA)',
    category: 'culture',
    address: '465 Huntington Ave, Boston, MA',
    rating: 4.7,
    isCurated: true,
    // Closed Tuesdays (day=1). Mon/Wed/Sun 10am-5pm, Thu/Fri 10am-10pm, Sat 10am-5pm
    hours: [
      { day: 0, start: '1000', end: '1700' }, // Mon
      // Tue closed
      { day: 2, start: '1000', end: '1700' }, // Wed
      { day: 3, start: '1000', end: '2200' }, // Thu
      { day: 4, start: '1000', end: '2200' }, // Fri
      { day: 5, start: '1000', end: '1700' }, // Sat
      { day: 6, start: '1000', end: '1700' }, // Sun
    ],
  },
  {
    id: 'gardner-museum',
    name: 'Isabella Stewart Gardner Museum',
    category: 'culture',
    address: '25 Evans Way, Boston, MA',
    rating: 4.7,
    isCurated: true,
    // Closed Tues. Wed–Mon 11am–5pm, Thu until 9pm
    hours: [
      { day: 0, start: '1100', end: '1700' }, // Mon
      // Tue closed
      { day: 2, start: '1100', end: '1700' }, // Wed
      { day: 3, start: '1100', end: '2100' }, // Thu
      { day: 4, start: '1100', end: '1700' }, // Fri
      { day: 5, start: '1100', end: '1700' }, // Sat
      { day: 6, start: '1100', end: '1700' }, // Sun
    ],
  },
  {
    id: 'ica-boston',
    name: 'ICA Boston',
    category: 'culture',
    address: '25 Harbor Shore Dr, Boston, MA',
    rating: 4.5,
    isCurated: true,
    // Closed Mon/Tue. Wed/Fri/Sat/Sun 10am-5pm, Thu 10am-9pm
    hours: [
      // Mon/Tue closed
      { day: 2, start: '1000', end: '1700' }, // Wed
      { day: 3, start: '1000', end: '2100' }, // Thu
      { day: 4, start: '1000', end: '1700' }, // Fri
      { day: 5, start: '1000', end: '1700' }, // Sat
      { day: 6, start: '1000', end: '1700' }, // Sun
    ],
  },
  {
    id: 'harvard-art-museums',
    name: 'Harvard Art Museums',
    category: 'culture',
    address: '32 Quincy St, Cambridge, MA',
    rating: 4.6,
    isCurated: true,
    hours: allWeek('1000', '1700'),
  },

  // ── Activities / Experiences ──────────────────────────────────────────────
  {
    id: 'duck-tours',
    name: 'Boston Duck Tours',
    category: 'outdoor',
    address: 'Various departure points, Boston, MA',
    rating: 4.8,
    isCurated: true,
    // Seasonal (Mar–Nov), tours run 9am–5pm
    hours: allWeek('0900', '1700'),
  },
  {
    id: 'brattle-cinema',
    name: 'Brattle Theatre (Cambridge)',
    category: 'culture',
    address: '40 Brattle St, Cambridge, MA',
    rating: 4.7,
    isCurated: true,
    hours: allWeek('1200', '2300'),
  },
  {
    id: 'aeronaut-brewing',
    name: 'Aeronaut Brewing (Somerville)',
    category: 'social',
    address: '14 Tyler St, Somerville, MA',
    rating: 4.5,
    isCurated: true,
    hours: [
      { day: 0, start: '1600', end: '2200' }, // Mon
      { day: 1, start: '1600', end: '2200' }, // Tue
      { day: 2, start: '1600', end: '2200' }, // Wed
      { day: 3, start: '1600', end: '2200' }, // Thu
      { day: 4, start: '1600', end: '2300' }, // Fri
      { day: 5, start: '1200', end: '2300' }, // Sat
      { day: 6, start: '1200', end: '2100' }, // Sun
    ],
  },
  {
    id: 'pasta-making-class',
    name: 'Pasta-Making Class',
    category: 'social',
    address: 'Boston, MA (varies by provider)',
    isCurated: true,
    // Typically evenings and weekends
    hours: [
      ...weekdays('1800', '2100'),
      ...weekends('1100', '2100'),
    ],
  },

  // ── Study / Cafe ──────────────────────────────────────────────────────────
  {
    id: 'widener-library',
    name: 'Widener Library (Harvard)',
    category: 'study',
    address: 'Widener Library, Cambridge, MA',
    isCurated: true,
    hours: [
      ...weekdays('0800', '2200'),
      { day: 5, start: '1000', end: '1800' }, // Sat
      { day: 6, start: '1200', end: '2200' }, // Sun
    ],
  },
  {
    id: 'cabot-library',
    name: 'Cabot Science Library',
    category: 'study',
    address: 'One Oxford St, Cambridge, MA',
    isCurated: true,
    hours: [
      ...weekdays('0830', '2200'),
      { day: 5, start: '1000', end: '1800' },
      { day: 6, start: '1200', end: '2200' },
    ],
  },
  {
    id: 'forge-baking',
    name: 'Forge Baking Company (Somerville)',
    category: 'cafe',
    address: '626 Somerville Ave, Somerville, MA',
    isCurated: true,
    hours: [
      ...weekdays('0700', '1500'),
      ...weekends('0800', '1500'),
    ],
  },
]

// Categories suggested per slot type
export const SLOT_CATEGORY_MAP: Record<string, ActivityCategory[]> = {
  breakfast: ['meal', 'cafe'],
  morning: ['cafe', 'study', 'outdoor', 'culture'],
  lunch: ['meal', 'cafe', 'outdoor'],
  afternoon: ['outdoor', 'culture', 'study', 'cafe', 'social'],
  dinner: ['meal', 'outdoor', 'social'],
  evening: ['social', 'nightlife', 'culture'],
  late_night: ['social', 'nightlife'],
}
