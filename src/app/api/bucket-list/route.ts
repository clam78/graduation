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
    .select('*, bucket_list_upvotes(user_id)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  const transformed = (items ?? []).map((item: Record<string, unknown> & { bucket_list_upvotes: { user_id: string }[] }) => {
    const upvotes: { user_id: string }[] = item.bucket_list_upvotes ?? []
    return {
      ...item,
      upvoteCount: upvotes.length,
      hasUpvoted: upvotes.some((v) => v.user_id === user.id),
      bucket_list_upvotes: undefined,
    }
  })

  return NextResponse.json({ items: transformed })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { groupId, title, description, category, locationName, address, yelpId, hours } = body
  const admin = createAdminSupabaseClient()

  const { data: item, error } = await admin
    .from('bucket_list_items')
    .insert({
      group_id: groupId,
      title,
      description,
      category,
      location_name: locationName,
      address,
      yelp_id: yelpId,
      hours,
      added_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, completed, upvote } = await req.json()
  const admin = createAdminSupabaseClient()

  if (upvote !== undefined) {
    if (upvote) {
      await admin.from('bucket_list_upvotes').insert({ item_id: id, user_id: user.id })
    } else {
      await admin.from('bucket_list_upvotes').delete().eq('item_id', id).eq('user_id', user.id)
    }
    return NextResponse.json({ ok: true })
  }

  if (completed !== undefined) {
    await admin
      .from('bucket_list_items')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', id)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const admin = createAdminSupabaseClient()
  await admin.from('bucket_list_items').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
