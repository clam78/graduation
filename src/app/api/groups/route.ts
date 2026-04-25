import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, displayName } = await req.json()
  const admin = createAdminSupabaseClient()

  const { data: group, error } = await admin
    .from('groups')
    .insert({ name, graduation_date: '2026-05-29T10:00:00', created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    display_name: displayName,
  })

  return NextResponse.json({ group })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inviteCode, displayName } = await req.json()
  const admin = createAdminSupabaseClient()

  const { data: group } = await admin
    .from('groups')
    .select('id, name')
    .eq('invite_code', inviteCode)
    .single()

  if (!group) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })

  const { error } = await admin.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    display_name: displayName,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ group })
}
