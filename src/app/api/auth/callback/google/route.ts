import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/google-calendar'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const groupId = searchParams.get('state') // passed through OAuth state param

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=no_code', req.url))
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/?error=not_signed_in', req.url))
  }

  const tokens = await exchangeCodeForTokens(code)

  // Store tokens on the user's group_members row
  await supabase
    .from('group_members')
    .update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
      google_token_expiry: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
    })
    .eq('user_id', user.id)
    .eq('group_id', groupId)

  return NextResponse.redirect(
    new URL(`/group/${groupId}?calendar=connected`, req.url)
  )
}
