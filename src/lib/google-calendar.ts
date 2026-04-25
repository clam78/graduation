import { google } from 'googleapis'
import { FreeSlot, SlotType } from '@/types'
import { addDays, format } from 'date-fns'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function makeOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${appUrl}/api/auth/callback/google`
  )
}

export function getAuthUrl(groupId: string) {
  return makeOAuthClient().generateAuthUrl({
    access_type: 'offline',
    // calendar.readonly lets us list all calendars + run freebusy queries
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    prompt: 'consent',
    state: groupId,
  })
}

export async function exchangeCodeForTokens(code: string) {
  const client = makeOAuthClient()
  const { tokens } = await client.getToken(code)
  return tokens
}

interface BusyBlock {
  start: string
  end: string
}

// Returns merged busy blocks for a single user across ALL their calendars.
export async function getUserBusyBlocks(
  accessToken: string,
  refreshToken: string,
  daysAhead = 14
): Promise<BusyBlock[]> {
  const client = makeOAuthClient()
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })

  const calendar = google.calendar({ version: 'v3', auth: client })
  const timeMin = new Date().toISOString()
  const timeMax = addDays(new Date(), daysAhead).toISOString()

  // Try to get all calendar IDs; fall back to primary-only if scope is insufficient
  let calendarIds: string[] = ['primary']
  try {
    const listRes = await calendar.calendarList.list({ minAccessRole: 'reader' })
    const ids = (listRes.data.items ?? [])
      .filter(c => !c.hidden && c.id)
      .map(c => c.id!)
    if (ids.length > 0) calendarIds = ids
  } catch {
    // Old token with freebusy-only scope — primary only
  }

  const res = await calendar.freebusy.query({
    requestBody: { timeMin, timeMax, items: calendarIds.map(id => ({ id })) },
  })

  // Collect busy blocks from every calendar in the response
  const allBusy: BusyBlock[] = []
  for (const calData of Object.values(res.data.calendars ?? {})) {
    for (const block of calData.busy ?? []) {
      if (block.start && block.end) allBusy.push({ start: block.start, end: block.end })
    }
  }

  allBusy.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  return allBusy
}

// tzOffset = client's Date.getTimezoneOffset() — positive for west of UTC (e.g. 240 for EDT/UTC-4).
// All day boundaries are computed in the user's local timezone to avoid the UTC-shifts-hours bug.
export function findGroupFreeSlots(
  allBusyBlocks: { userId: string; busy: BusyBlock[] }[],
  daysAhead = 14,
  minMinutes = 60,
  tzOffset = 0
): FreeSlot[] {
  const slots: FreeSlot[] = []

  // Represent "now" in the user's local timezone so day iteration is correct.
  // getTimezoneOffset() = 240 for EDT means local = UTC − 4h, so localMs = UTC − offset.
  const localNowMs = Date.now() - tzOffset * 60 * 1000

  for (let d = 0; d < daysAhead; d++) {
    const localDay = addDays(new Date(localNowMs), d)

    // UTC milliseconds that equal local midnight of this day.
    // Because local = UTC − offset, local midnight = UTC midnight + offset.
    const localMidnightUTC =
      Date.UTC(localDay.getUTCFullYear(), localDay.getUTCMonth(), localDay.getUTCDate()) +
      tzOffset * 60 * 1000

    const dayStartMs    = localMidnightUTC + 8  * 60 * 60 * 1000  // local 8 am
    const dayEndMs      = localMidnightUTC + 22 * 60 * 60 * 1000  // local 10 pm
    const nextMidnightMs = localMidnightUTC + 24 * 60 * 60 * 1000

    // Collect every busy block that overlaps this local day, clamped to 8 am–10 pm.
    const intervals: { start: number; end: number }[] = []
    for (const { busy } of allBusyBlocks) {
      for (const block of busy) {
        const s = new Date(block.start).getTime()
        const e = new Date(block.end).getTime()
        if (s < nextMidnightMs && e > localMidnightUTC) {
          const cs = Math.max(s, dayStartMs)
          const ce = Math.min(e, dayEndMs)
          if (ce > cs) intervals.push({ start: cs, end: ce })
        }
      }
    }

    // Merge overlapping intervals
    intervals.sort((a, b) => a.start - b.start)
    const merged: { start: number; end: number }[] = []
    for (const iv of intervals) {
      if (!merged.length || merged[merged.length - 1].end < iv.start) {
        merged.push({ ...iv })
      } else {
        merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, iv.end)
      }
    }

    // Walk the gaps
    let cursor = dayStartMs
    for (const block of [...merged, { start: dayEndMs, end: dayEndMs }]) {
      const freeStart = cursor
      const freeEnd   = block.start
      const durationMinutes = (freeEnd - freeStart) / 60000

      if (durationMinutes >= minMinutes) {
        // day-of-week in local time: shift back by offset to get "local UTC representation"
        const localDow = new Date(freeStart - tzOffset * 60 * 1000).getUTCDay()
        slots.push({
          start: new Date(freeStart),
          end:   new Date(freeEnd),
          durationMinutes,
          slotType: classifySlot(freeStart, tzOffset),
          dayOfWeek: localDow,
          isWeekend: localDow === 0 || localDow === 6,
        })
      }

      cursor = Math.max(block.end, dayStartMs)
    }
  }

  return slots
}

// Classify by the user's local hour (not the server's UTC hour).
function classifySlot(utcMs: number, tzOffset: number): SlotType {
  const utcHour = new Date(utcMs).getUTCHours()
  const localHour = ((utcHour - tzOffset / 60) % 24 + 24) % 24
  if (localHour >= 6  && localHour < 10) return 'breakfast'
  if (localHour >= 10 && localHour < 12) return 'morning'
  if (localHour >= 12 && localHour < 14) return 'lunch'
  if (localHour >= 14 && localHour < 17) return 'afternoon'
  if (localHour >= 17 && localHour < 20) return 'dinner'
  if (localHour >= 20 && localHour < 23) return 'evening'
  return 'late_night'
}

export function formatSlotLabel(slot: FreeSlot): string {
  const day = format(slot.start, 'EEEE MMM d')
  const startTime = format(slot.start, 'h:mm a')
  const endTime   = format(slot.end,   'h:mm a')
  return `${day}, ${startTime} – ${endTime}`
}
