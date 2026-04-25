import { google } from 'googleapis'
import { FreeSlot, SlotType } from '@/types'
import { addDays, format, isWeekend, startOfDay, endOfDay } from 'date-fns'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${appUrl}/api/auth/callback/google`
)

export function getAuthUrl(groupId: string) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.freebusy'],
    prompt: 'consent',
    state: groupId,
  })
}

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

interface BusyBlock {
  start: string
  end: string
}

// Returns busy blocks for a single user over the next `daysAhead` days.
// Never returns event titles — only time ranges.
export async function getUserBusyBlocks(
  accessToken: string,
  refreshToken: string,
  daysAhead = 14
): Promise<BusyBlock[]> {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  const timeMin = new Date().toISOString()
  const timeMax = addDays(new Date(), daysAhead).toISOString()

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: 'primary' }],
    },
  })

  return (res.data.calendars?.primary?.busy ?? []) as BusyBlock[]
}

// Given busy blocks from multiple users, find overlapping free windows
// that are at least `minMinutes` long.
export function findGroupFreeSlots(
  allBusyBlocks: { userId: string; busy: BusyBlock[] }[],
  daysAhead = 14,
  minMinutes = 60
): FreeSlot[] {
  const slots: FreeSlot[] = []
  const now = new Date()

  for (let d = 0; d < daysAhead; d++) {
    const day = addDays(now, d)
    const dayStart = new Date(startOfDay(day).getTime())
    dayStart.setHours(7, 0, 0, 0)
    const dayEnd = new Date(endOfDay(day).getTime())
    dayEnd.setHours(23, 0, 0, 0)

    // Collect all busy intervals for this day across all users
    const intervals: { start: number; end: number }[] = []
    for (const { busy } of allBusyBlocks) {
      for (const block of busy) {
        const s = new Date(block.start)
        const e = new Date(block.end)
        if (
          s.toDateString() === day.toDateString() ||
          e.toDateString() === day.toDateString()
        ) {
          intervals.push({
            start: Math.max(s.getTime(), dayStart.getTime()),
            end: Math.min(e.getTime(), dayEnd.getTime()),
          })
        }
      }
    }

    // Merge overlapping intervals
    intervals.sort((a, b) => a.start - b.start)
    const merged: { start: number; end: number }[] = []
    for (const interval of intervals) {
      if (merged.length === 0 || merged[merged.length - 1].end < interval.start) {
        merged.push({ ...interval })
      } else {
        merged[merged.length - 1].end = Math.max(
          merged[merged.length - 1].end,
          interval.end
        )
      }
    }

    // Gaps between busy blocks = free slots
    let cursor = dayStart.getTime()
    const boundaries = [
      ...merged,
      { start: dayEnd.getTime(), end: dayEnd.getTime() },
    ]

    for (const block of boundaries) {
      const freeStart = cursor
      const freeEnd = block.start
      const durationMs = freeEnd - freeStart
      const durationMinutes = durationMs / 60000

      if (durationMinutes >= minMinutes) {
        const start = new Date(freeStart)
        const end = new Date(freeEnd)
        slots.push({
          start,
          end,
          durationMinutes,
          slotType: classifySlot(start),
          dayOfWeek: start.getDay(),
          isWeekend: isWeekend(start),
        })
      }
      cursor = block.end
    }
  }

  return slots
}

function classifySlot(time: Date): SlotType {
  const hour = time.getHours()
  if (hour >= 6 && hour < 10) return 'breakfast'
  if (hour >= 10 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 20) return 'dinner'
  if (hour >= 20 && hour < 23) return 'evening'
  return 'late_night'
}

export function formatSlotLabel(slot: FreeSlot): string {
  const day = format(slot.start, 'EEEE MMM d')
  const startTime = format(slot.start, 'h:mm a')
  const endTime = format(slot.end, 'h:mm a')
  return `${day}, ${startTime} – ${endTime}`
}
