import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const groupId = new URL(req.url).searchParams.get('groupId')
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: items } = await admin
    .from('bucket_list_items')
    .select('id')
    .eq('group_id', groupId)

  const itemIds = (items ?? []).map((i: { id: string }) => i.id)
  if (!itemIds.length) return NextResponse.json({ proposedTimes: [] })

  const { data: proposed } = await admin
    .from('proposed_times')
    .select('*, proposed_time_rsvps(user_id, response)')
    .in('item_id', itemIds)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true })

  const { data: members } = await admin
    .from('group_members')
    .select('user_id, display_name')
    .eq('group_id', groupId)

  const nameMap: Record<string, string> = {}
  for (const m of members ?? []) nameMap[m.user_id] = m.display_name

  const result = (proposed ?? []).map((pt: Record<string, unknown> & { proposed_time_rsvps: { user_id: string; response: string }[] }) => ({
    id: pt.id,
    itemId: pt.item_id,
    proposedBy: pt.proposed_by,
    proposedByName: nameMap[pt.proposed_by as string] ?? 'Someone',
    startTime: pt.start_time,
    endTime: pt.end_time,
    status: pt.status,
    createdAt: pt.created_at,
    rsvps: (pt.proposed_time_rsvps ?? []).map((r) => ({
      userId: r.user_id,
      displayName: nameMap[r.user_id] ?? '?',
      response: r.response,
    })),
    myRsvp: (pt.proposed_time_rsvps ?? []).find((r) => r.user_id === user.id)?.response ?? null,
  }))

  return NextResponse.json({ proposedTimes: result })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId, startTime, endTime } = await req.json()
  const admin = createAdminSupabaseClient()

  const { data, error } = await admin
    .from('proposed_times')
    .insert({ item_id: itemId, proposed_by: user.id, start_time: startTime, end_time: endTime })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ proposedTime: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, rsvp, status } = await req.json()
  const admin = createAdminSupabaseClient()

  if (rsvp) {
    await admin.from('proposed_time_rsvps').upsert(
      { proposed_time_id: id, user_id: user.id, response: rsvp },
      { onConflict: 'proposed_time_id,user_id' }
    )
  }

  if (status) {
    await admin.from('proposed_times').update({ status }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
