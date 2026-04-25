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

export const BOSTON_ACTIVITIES: Venue[] = [

  // ── Outdoor / Walks ────────────────────────────────────────────────────────
  {
    id: 'boston-common',
    name: 'Boston Common + Public Garden',
    category: 'outdoor',
    address: 'Boston Common, Boston, MA',
    isCurated: true,
    tagline: 'Classic stroll through the heart of the city — grab ice cream and people-watch.',
    hours: allWeek('0000', '2359'),
  },
  {
    id: 'beacon-hill-photo-walk',
    name: 'Beacon Hill Photo Walk',
    category: 'outdoor',
    address: 'Beacon Hill, Boston, MA',
    isCurated: true,
    tagline: 'Cobblestone streets, gas lamps, and brick rowhouses — one of the prettiest corners of Boston.',
    hours: allWeek('0700', '2100'),
  },
  {
    id: 'back-bay-photo-walk',
    name: 'Back Bay Photo Walk',
    category: 'outdoor',
    address: 'Commonwealth Ave, Boston, MA',
    isCurated: true,
    tagline: 'Walk the Comm Ave mall and brownstones, stop at the Prudential for city views.',
    hours: allWeek('0700', '2100'),
  },
  {
    id: 'charles-river-esplanade',
    name: 'Charles River Esplanade',
    category: 'outdoor',
    address: 'Charles River Esplanade, Boston, MA',
    isCurated: true,
    tagline: 'Run, bike, or just sit by the water — best river views in the city.',
    hours: allWeek('0000', '2359'),
  },
  {
    id: 'swan-boats',
    name: 'Swan Boats in the Public Garden',
    category: 'outdoor',
    address: 'Public Garden, Boston, MA',
    isCurated: true,
    tagline: 'Iconic Boston experience — pedal around the lagoon before you graduate.',
    // Mid-April to mid-September, 10am–4pm (Mon–Fri), 10am–5pm (weekends)
    hours: [
      ...weekdays('1000', '1600'),
      ...weekends('1000', '1700'),
    ],
  },
  {
    id: 'rose-kennedy-greenway',
    name: 'Rose Kennedy Greenway',
    category: 'outdoor',
    address: 'Rose Kennedy Greenway, Boston, MA',
    isCurated: true,
    tagline: 'Mile-long park through downtown with food trucks, fountains, and public art.',
    hours: allWeek('0600', '2300'),
  },
  {
    id: 'castle-island',
    name: 'Castle Island + Fort Independence',
    category: 'outdoor',
    address: 'Castle Island, South Boston, MA',
    isCurated: true,
    tagline: 'Walk the loop around the harbor, grab an ice cream at Sullivan\'s, and catch harbor views.',
    hours: allWeek('0800', '2000'),
  },
  {
    id: 'jamaica-pond',
    name: 'Jamaica Pond Loop',
    category: 'outdoor',
    address: 'Jamaica Pond, Jamaica Plain, MA',
    isCurated: true,
    tagline: 'Peaceful 1.5-mile loop around a spring-fed kettle pond — bring a coffee.',
    hours: allWeek('0600', '2100'),
  },
  {
    id: 'arnold-arboretum',
    name: 'Arnold Arboretum',
    category: 'outdoor',
    address: '125 Arborway, Jamaica Plain, MA',
    isCurated: true,
    tagline: 'Free 281-acre park — lilacs bloom right around graduation season.',
    hours: allWeek('0700', '2000'),
  },
  {
    id: 'harvard-square',
    name: 'Harvard Square',
    category: 'outdoor',
    address: 'Harvard Square, Cambridge, MA',
    isCurated: true,
    tagline: 'Browse bookstores, grab boba, and watch street performers.',
    hours: allWeek('0800', '2200'),
  },
  {
    id: 'newbury-street',
    name: 'Newbury Street Shopping',
    category: 'outdoor',
    address: 'Newbury St, Boston, MA',
    isCurated: true,
    tagline: 'Eight blocks of boutiques, cafes, and people-watching — Boston\'s best street.',
    hours: allWeek('1000', '2100'),
  },
  {
    id: 'north-end-walk',
    name: 'North End Gelato + Cannoli Run',
    category: 'outdoor',
    address: 'Hanover St, Boston, MA',
    isCurated: true,
    tagline: 'Hit Mike\'s vs. Modern Pastry, grab a gelato, and wander the oldest neighborhood in Boston.',
    hours: allWeek('1100', '2200'),
  },
  {
    id: 'boston-harborwalk',
    name: 'Boston Harborwalk (Seaport)',
    category: 'outdoor',
    address: 'Seaport Blvd, Boston, MA',
    isCurated: true,
    tagline: 'Walk along the waterfront, stop for a drink at a rooftop, and watch the boats.',
    hours: allWeek('0600', '2300'),
  },
  {
    id: 'community-boating',
    name: 'Community Boating (Kayaking)',
    category: 'fitness',
    address: '21 David Mugar Way, Boston, MA',
    isCurated: true,
    tagline: 'Rent a kayak or sailboat on the Charles River — no experience needed.',
    // Seasonal: April–October
    hours: [
      ...weekdays('0900', '1800'),
      ...weekends('0900', '1700'),
    ],
  },
  {
    id: 'blue-hills',
    name: 'Blue Hills Reservation',
    category: 'fitness',
    address: 'Blue Hills Reservation, Milton, MA',
    isCurated: true,
    tagline: '7,000 acres of trails 30 min from campus — best panoramic views near Boston.',
    hours: allWeek('0600', '2000'),
  },

  // ── MIT-Specific ───────────────────────────────────────────────────────────
  {
    id: 'mit-sailing',
    name: 'MIT Sailing Pavilion',
    category: 'fitness',
    address: 'MIT Sailing Pavilion, Memorial Dr, Cambridge, MA',
    isCurated: true,
    tagline: 'Free for MIT students — sail on the Charles River before you graduate and lose access.',
    // Seasonal: April–October, daytime
    hours: [
      ...weekdays('0900', '1800'),
      ...weekends('0900', '1700'),
    ],
  },
  {
    id: 'smoot-standard',
    name: 'Smoot\'s Tavern',
    category: 'social',
    address: 'Mass Ave, Cambridge, MA',
    isCurated: true,
    tagline: 'Named after the MIT legend himself — good drinks, good people, very on-brand.',
    hours: [
      ...weekdays('1600', '0000'),
      ...weekends('1200', '0000'),
    ],
  },
  {
    id: 'vester-cafe',
    name: 'Vester Café (MIT)',
    category: 'cafe',
    address: 'MIT Campus, Cambridge, MA',
    isCurated: true,
    tagline: 'Right on campus — quick coffee and pastries between classes or before an adventure.',
    hours: weekdays('0800', '1600'),
  },
  {
    id: 'muddy-charles',
    name: 'The Muddy Charles Pub',
    category: 'social',
    address: 'Walker Memorial Building, MIT, Cambridge, MA',
    isCurated: true,
    tagline: 'MIT\'s own campus pub — cheap drinks, darts, and the best low-key hangout before graduation.',
    hours: [
      { day: 0, start: '1700', end: '2300' }, // Mon
      { day: 1, start: '1700', end: '2300' }, // Tue
      { day: 2, start: '1700', end: '2300' }, // Wed
      { day: 3, start: '1700', end: '2300' }, // Thu
      { day: 4, start: '1700', end: '0000' }, // Fri
      { day: 5, start: '1700', end: '0000' }, // Sat
    ],
  },
  {
    id: 'mit-great-dome',
    name: 'MIT Great Dome + Killian Court',
    category: 'outdoor',
    address: 'Killian Court, MIT, Cambridge, MA',
    isCurated: true,
    tagline: 'Iconic MIT spot — graduation ceremonies happen right here. Great for a last photo.',
    hours: allWeek('0000', '2359'),
  },
  {
    id: 'mit-infinite-corridor',
    name: 'MIT Infinite Corridor',
    category: 'outdoor',
    address: '77 Massachusetts Ave, Cambridge, MA',
    isCurated: true,
    tagline: 'Twice a year the sunset perfectly aligns with the corridor — MIThenge. Just a cool walk any day.',
    hours: allWeek('0600', '2300'),
  },

  // ── Food + Brunch ──────────────────────────────────────────────────────────
  {
    id: 'time-out-market',
    name: 'Time Out Market (Seaport)',
    category: 'meal',
    address: '401 Park Dr, Boston, MA',
    rating: 4.4,
    isCurated: true,
    tagline: 'Boston\'s best chefs under one roof — go hungry and work your way around the stalls.',
    hours: [
      ...weekdays('1100', '2100'),
      ...weekends('1000', '2200'),
    ],
  },
  {
    id: 'tatte-bakery',
    name: 'Tatte Bakery & Café',
    category: 'cafe',
    address: 'Multiple locations, Boston, MA',
    rating: 4.6,
    isCurated: true,
    tagline: 'Israeli-inspired pastries and shakshuka — the quintessential Boston brunch spot.',
    hours: allWeek('0800', '1700'),
  },
  {
    id: 'flour-bakery',
    name: 'Flour Bakery + Cafe',
    category: 'cafe',
    address: '190 Massachusetts Ave, Cambridge, MA',
    rating: 4.7,
    isCurated: true,
    tagline: 'Famous sticky buns and sandwiches — the Mass Ave location is a 5-min walk from campus.',
    hours: allWeek('0700', '1700'),
  },
  {
    id: 'sowa-market',
    name: 'SoWa Open Market',
    category: 'social',
    address: '460 Harrison Ave, Boston, MA',
    rating: 4.5,
    isCurated: true,
    tagline: 'Weekend farmers market, food trucks, and local art vendors — total vibe.',
    // May–October, Sundays only 10am–4pm
    hours: [
      { day: 6, start: '1000', end: '1600' }, // Sun
    ],
  },
  {
    id: 'forge-baking',
    name: 'Forge Baking Company (Somerville)',
    category: 'cafe',
    address: '626 Somerville Ave, Somerville, MA',
    isCurated: true,
    tagline: 'Cozy bakery with incredible pastries and a great vibe for a slow morning.',
    hours: [
      ...weekdays('0700', '1500'),
      ...weekends('0800', '1500'),
    ],
  },

  // ── Culture ────────────────────────────────────────────────────────────────
  {
    id: 'mfa-boston',
    name: 'Museum of Fine Arts (MFA)',
    category: 'culture',
    address: '465 Huntington Ave, Boston, MA',
    rating: 4.7,
    isCurated: true,
    tagline: 'Free with MIT ID — world-class collection and they have a rooftop terrace.',
    hours: [
      { day: 0, start: '1000', end: '1700' },
      { day: 2, start: '1000', end: '1700' },
      { day: 3, start: '1000', end: '2200' },
      { day: 4, start: '1000', end: '2200' },
      { day: 5, start: '1000', end: '1700' },
      { day: 6, start: '1000', end: '1700' },
    ],
  },
  {
    id: 'gardner-museum',
    name: 'Isabella Stewart Gardner Museum',
    category: 'culture',
    address: '25 Evans Way, Boston, MA',
    rating: 4.7,
    isCurated: true,
    tagline: 'Built around an interior courtyard — feels like a secret garden with world-famous art.',
    hours: [
      { day: 0, start: '1100', end: '1700' },
      { day: 2, start: '1100', end: '1700' },
      { day: 3, start: '1100', end: '2100' },
      { day: 4, start: '1100', end: '1700' },
      { day: 5, start: '1100', end: '1700' },
      { day: 6, start: '1100', end: '1700' },
    ],
  },
  {
    id: 'ica-boston',
    name: 'ICA Boston',
    category: 'culture',
    address: '25 Harbor Shore Dr, Boston, MA',
    rating: 4.5,
    isCurated: true,
    tagline: 'Contemporary art with floor-to-ceiling harbor views from the Seaport.',
    hours: [
      { day: 2, start: '1000', end: '1700' },
      { day: 3, start: '1000', end: '2100' },
      { day: 4, start: '1000', end: '1700' },
      { day: 5, start: '1000', end: '1700' },
      { day: 6, start: '1000', end: '1700' },
    ],
  },
  {
    id: 'harvard-art-museums',
    name: 'Harvard Art Museums',
    category: 'culture',
    address: '32 Quincy St, Cambridge, MA',
    rating: 4.6,
    isCurated: true,
    tagline: 'Stunning Renzo Piano building — three museums in one, free with student ID.',
    hours: allWeek('1000', '1700'),
  },
  {
    id: 'museum-of-science',
    name: 'Museum of Science',
    category: 'culture',
    address: 'Science Park, Boston, MA',
    rating: 4.6,
    isCurated: true,
    tagline: 'Genuinely fun even as adults — catch a laser show or the lightning theater.',
    hours: allWeek('0900', '1700'),
  },
  {
    id: 'new-england-aquarium',
    name: 'New England Aquarium',
    category: 'culture',
    address: '1 Central Wharf, Boston, MA',
    rating: 4.5,
    isCurated: true,
    tagline: 'Giant ocean tank, penguins, and harbor seals — weirdly therapeutic.',
    hours: allWeek('0900', '1700'),
  },
  {
    id: 'duck-tours',
    name: 'Boston Duck Tours',
    category: 'outdoor',
    address: 'Various departure points, Boston, MA',
    rating: 4.8,
    isCurated: true,
    tagline: 'Cheesy but iconic — a WWII amphibious vehicle that drives into the Charles River.',
    hours: allWeek('0900', '1700'),
  },
  {
    id: 'brattle-cinema',
    name: 'Brattle Theatre',
    category: 'culture',
    address: '40 Brattle St, Cambridge, MA',
    rating: 4.7,
    isCurated: true,
    tagline: 'Harvard Square\'s beloved arthouse cinema — always showing something good.',
    hours: allWeek('1200', '2300'),
  },

  // ── Social / Entertainment ─────────────────────────────────────────────────
  {
    id: 'aeronaut-brewing',
    name: 'Aeronaut Brewing (Somerville)',
    category: 'social',
    address: '14 Tyler St, Somerville, MA',
    rating: 4.5,
    isCurated: true,
    tagline: 'Massive beer hall with live music, food trucks, and the best outdoor patio near campus.',
    hours: [
      { day: 0, start: '1600', end: '2200' },
      { day: 1, start: '1600', end: '2200' },
      { day: 2, start: '1600', end: '2200' },
      { day: 3, start: '1600', end: '2200' },
      { day: 4, start: '1600', end: '2300' },
      { day: 5, start: '1200', end: '2300' },
      { day: 6, start: '1200', end: '2100' },
    ],
  },
  {
    id: 'improv-asylum',
    name: 'Improv Asylum (North End)',
    category: 'social',
    address: '216 Hanover St, Boston, MA',
    rating: 4.6,
    isCurated: true,
    tagline: 'Boston\'s best improv comedy show — genuinely hilarious and totally unpredictable.',
    hours: [
      { day: 3, start: '1900', end: '2300' }, // Thu
      { day: 4, start: '1900', end: '2300' }, // Fri
      { day: 5, start: '1800', end: '2300' }, // Sat
      { day: 6, start: '1800', end: '2200' }, // Sun
    ],
  },
  {
    id: 'kings-boston',
    name: 'Kings Dining + Entertainment',
    category: 'social',
    address: '50 Dalton St, Boston, MA',
    rating: 4.3,
    isCurated: true,
    tagline: 'Bowling, karaoke, and arcade games — perfect for a big group night out.',
    hours: [
      { day: 0, start: '1200', end: '0000' },
      { day: 1, start: '1200', end: '0000' },
      { day: 2, start: '1200', end: '0000' },
      { day: 3, start: '1200', end: '0000' },
      { day: 4, start: '1200', end: '0200' },
      { day: 5, start: '1100', end: '0200' },
      { day: 6, start: '1100', end: '0000' },
    ],
  },
  {
    id: 'mission-escape',
    name: 'Mission Escape Games',
    category: 'social',
    address: '30 Dunbar Ave, Randolph, MA',
    rating: 4.6,
    isCurated: true,
    tagline: 'Top-rated escape rooms near Boston — great for groups of 4–8 people.',
    hours: [
      ...weekdays('1400', '2200'),
      ...weekends('1000', '2200'),
    ],
  },
  {
    id: 'pasta-making-class',
    name: 'Pasta-Making Class',
    category: 'social',
    address: 'Boston, MA (varies by provider)',
    isCurated: true,
    tagline: 'Learn to hand-roll fresh pasta together — every class ends with eating your creation.',
    hours: [
      ...weekdays('1800', '2100'),
      ...weekends('1100', '2100'),
    ],
  },

  // ── Study / Cafe ───────────────────────────────────────────────────────────
  {
    id: 'widener-library',
    name: 'Widener Library (Harvard)',
    category: 'study',
    address: 'Widener Library, Cambridge, MA',
    isCurated: true,
    tagline: 'Some of the most beautiful reading rooms in the world — free to browse.',
    hours: [
      ...weekdays('0800', '2200'),
      { day: 5, start: '1000', end: '1800' },
      { day: 6, start: '1200', end: '2200' },
    ],
  },
  {
    id: 'cabot-library',
    name: 'Cabot Science Library',
    category: 'study',
    address: 'One Oxford St, Cambridge, MA',
    isCurated: true,
    tagline: 'Quiet and reliable — good for a focused afternoon when campus is chaotic.',
    hours: [
      ...weekdays('0830', '2200'),
      { day: 5, start: '1000', end: '1800' },
      { day: 6, start: '1200', end: '2200' },
    ],
  },
]

// Categories suggested per slot type
export const SLOT_CATEGORY_MAP: Record<string, ActivityCategory[]> = {
  breakfast: ['cafe', 'outdoor', 'meal', 'dessert'],
  morning:   ['outdoor', 'cafe', 'culture', 'social', 'fitness', 'dessert'],
  lunch:     ['meal', 'outdoor', 'social', 'culture', 'cafe', 'dessert'],
  afternoon: ['outdoor', 'culture', 'social', 'fitness', 'cafe', 'dessert'],
  dinner:    ['meal', 'social', 'outdoor', 'dessert'],
  evening:   ['social', 'culture', 'nightlife', 'meal', 'dessert'],
  late_night:['nightlife', 'social', 'dessert'],
}
