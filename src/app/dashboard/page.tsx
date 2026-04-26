import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import Countdown from '@/components/Countdown'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const admin = createAdminSupabaseClient()
  const { data: memberships } = await admin
    .from('group_members')
    .select('group_id, groups(id, name, invite_code)')
    .eq('user_id', user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups = (memberships ?? []).map((m: any) => (Array.isArray(m.groups) ? m.groups[0] : m.groups)).filter(Boolean)

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8 items-start">

          {/* Left: groups */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h1 className="font-serif text-3xl text-bark">Your groups</h1>
              <p className="text-muted text-sm">Pick a group or start a new one.</p>
            </div>

            {groups.length > 0 && (
              <div className="flex flex-col gap-2">
                {groups.map((g) => (
                  <a
                    key={g!.id}
                    href={`/group/${g!.id}`}
                    className="flex items-center justify-between p-4 bg-white border border-sand rounded-2xl hover:border-blush transition-colors shadow-sm"
                  >
                    <span className="font-medium text-sm text-bark">{g!.name}</span>
                    <span className="font-mono text-xs text-muted">{g!.invite_code}</span>
                  </a>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <a
                href="/group/new"
                className="flex flex-col items-center gap-2 p-5 bg-white border border-sand rounded-2xl hover:border-blush transition-colors shadow-sm text-center"
              >
                <div className="w-9 h-9 rounded-full bg-petal flex items-center justify-center text-bark-light font-serif text-lg">+</div>
                <span className="font-medium text-sm text-bark">New group</span>
              </a>
              <a
                href="/join"
                className="flex flex-col items-center gap-2 p-5 bg-white border border-sand rounded-2xl hover:border-blush transition-colors shadow-sm text-center"
              >
                <div className="w-9 h-9 rounded-full bg-lavender flex items-center justify-center text-bark-light font-serif text-lg">→</div>
                <span className="font-medium text-sm text-bark">Join group</span>
              </a>
            </div>
          </div>

          {/* Right: countdown */}
          <div className="md:sticky md:top-8">
            <Countdown graduationDate="2026-05-29" variant="sidebar" />
          </div>

        </div>
      </div>
    </main>
  )
}
