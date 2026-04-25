import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAuthUrl } from '@/lib/google-calendar'

export async function GET(req: NextRequest) {
  const groupId = new URL(req.url).searchParams.get('groupId')
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 })

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/', req.url))

  const url = getAuthUrl(groupId)
  return NextResponse.redirect(url)
}
