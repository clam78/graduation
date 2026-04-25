import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const groupId = new URL(req.url).searchParams.get('groupId')
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()
  const { data: member } = await admin
    .from('group_members')
    .select('google_access_token')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ connected: !!member?.google_access_token })
}
