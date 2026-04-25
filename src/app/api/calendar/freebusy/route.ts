import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { getUserBusyBlocks, findGroupFreeSlots } from '@/lib/google-calendar'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get('groupId')
  const daysAhead = Number(searchParams.get('days') ?? 14)

  if (!groupId) {
    return NextResponse.json({ error: 'groupId required' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  // Fetch all members in the group who have calendar tokens
  const { data: members } = await admin
    .from('group_members')
    .select('user_id, display_name, google_access_token, google_refresh_token')
    .eq('group_id', groupId)
    .not('google_access_token', 'is', null)

  if (!members || members.length === 0) {
    return NextResponse.json({ freeSlots: [], busyBlocks: [] })
  }

  // Fetch busy blocks for each member in parallel
  const busyResults = await Promise.allSettled(
    members.map(async (m) => ({
      userId: m.user_id,
      busy: await getUserBusyBlocks(
        m.google_access_token!,
        m.google_refresh_token!,
        daysAhead
      ),
    }))
  )

  const allBusyBlocks = busyResults
    .filter((r): r is PromiseFulfilledResult<{ userId: string; busy: { start: string; end: string }[] }> => r.status === 'fulfilled')
    .map((r) => r.value)

  const freeSlots = findGroupFreeSlots(allBusyBlocks, daysAhead)

  // Return busy blocks without any event details — time ranges only
  const sanitizedBusy = allBusyBlocks.map(({ userId, busy }) => ({
    userId,
    blocks: busy.map(({ start, end }) => ({ start, end })),
  }))

  return NextResponse.json({ freeSlots, busyBlocks: sanitizedBusy })
}
