'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Countdown from '@/components/Countdown'
import BucketList from '@/components/BucketList'
import WeekCalendar from '@/components/WeekCalendar'
import ProposeTimeModal from '@/components/ProposeTimeModal'
import { BucketListItem, FreeSlot, Group, Suggestion } from '@/types'
import { createClient } from '@/lib/supabase'

function SignOutButton() {
  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }
  return (
    <button onClick={signOut} className="text-xs text-muted hover:text-bark transition-colors">
      sign out
    </button>
  )
}

export default function GroupPage() {
  const { id: groupId } = useParams<{ id: string }>()
  const [group, setGroup] = useState<Group | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null)
  const [items, setItems] = useState<BucketListItem[]>([])
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null)
  const [proposeItem, setProposeItem] = useState<BucketListItem | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [tab, setTab] = useState<'list' | 'schedule'>('list')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
    fetch(`/api/calendar/status?groupId=${groupId}`)
      .then(r => r.json())
      .then(({ connected }) => setCalendarConnected(connected ?? false))
    fetchGroup()
    fetchBucketList()
    fetchFreeSlots()
  }, [groupId])

  async function fetchGroup() {
    const supabase = createClient()
    const { data } = await supabase
      .from('groups')
      .select('*, group_members(user_id, display_name, google_access_token, joined_at)')
      .eq('id', groupId)
      .single()
    if (data) {
      setGroup({
        id: data.id,
        name: data.name,
        graduationDate: data.graduation_date,
        inviteCode: data.invite_code,
        members: data.group_members.map((m: { user_id: string; display_name: string; google_access_token: string | null; joined_at: string }) => ({
          userId: m.user_id,
          displayName: m.display_name,
          hasCalendarConnected: !!m.google_access_token,
          joinedAt: m.joined_at,
        })),
        createdAt: data.created_at,
      })
    }
  }

  async function fetchBucketList() {
    const res = await fetch(`/api/bucket-list?groupId=${groupId}`)
    const { items: raw } = await res.json()
    if (raw) setItems(raw)
  }

  async function fetchFreeSlots() {
    const res = await fetch(`/api/calendar/freebusy?groupId=${groupId}`)
    const data = await res.json()
    if (data.freeSlots) {
      setFreeSlots(
        data.freeSlots.map((s: FreeSlot) => ({
          ...s,
          start: new Date(s.start),
          end: new Date(s.end),
        }))
      )
    }
  }

  async function loadSuggestions(slot: FreeSlot | null) {
    if (!slot) {
      setSelectedSlot(null)
      setSuggestions([])
      return
    }
    setSelectedSlot(slot)
    setLoadingSuggestions(true)
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot }),
    })
    const { suggestions: s } = await res.json()
    setSuggestions(s ?? [])
    setLoadingSuggestions(false)
  }

  async function addSuggestionToList(s: Suggestion) {
    const res = await fetch('/api/bucket-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        title: s.venue.name,
        category: s.venue.category,
        locationName: s.venue.name,
        address: s.venue.address,
        yelpId: s.venue.id,
        hours: s.venue.hours,
      }),
    })
    const { item } = await res.json()
    setItems((prev) => [item, ...prev])
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blush border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">

      <nav className="flex items-center justify-between py-4">
        <a href="/dashboard" className="text-xs text-muted hover:text-bark transition-colors flex items-center gap-1">
          ← all groups
        </a>
        <SignOutButton />
      </nav>

      <Countdown graduationDate={group.graduationDate} groupName={group.name} />

      {/* Invite + members strip */}
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-sand shadow-sm mb-6">
        <div>
          <p className="text-xs text-muted mb-0.5">Invite code</p>
          <p className="font-mono text-sm font-semibold text-bark tracking-widest">{group.inviteCode}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted hidden sm:block">
            {group.members.filter(m => m.hasCalendarConnected).length}/{group.members.length} calendars synced
          </p>
          <div className="flex -space-x-2">
            {group.members.map((m) => (
              <div
                key={m.userId}
                title={`${m.displayName}${m.hasCalendarConnected ? ' (calendar synced)' : ''}`}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white ${
                  m.hasCalendarConnected ? 'bg-sage-deep' : 'bg-sand-deep'
                }`}
              >
                {m.displayName[0].toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar sync banner — shown until the current user has connected */}
      {calendarConnected === false && (
        <div className="flex items-center justify-between px-4 py-3 bg-petal rounded-2xl border border-blush mb-6">
          <div>
            <p className="text-sm font-medium text-bark">Sync your calendar</p>
            <p className="text-xs text-muted-light mt-0.5">So the group can find times that work for everyone.</p>
          </div>
          <a
            href={`/api/auth/google-calendar?groupId=${groupId}`}
            className="px-4 py-2 bg-bark text-white text-xs font-medium rounded-full hover:bg-bark-light transition-colors flex-shrink-0"
          >
            Connect
          </a>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['list', 'schedule'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-bark text-white'
                : 'bg-white text-muted border border-sand hover:border-sand-deep'
            }`}
          >
            {t === 'list' ? 'Bucket List' : 'Find a Time'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <BucketList
          items={items}
          groupId={groupId}
          onItemAdded={(item) => setItems((prev) => [item, ...prev])}
          onItemUpdated={(id, changes) =>
            setItems((prev) =>
              prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
            )
          }
          onItemDeleted={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
        />
      )}

      {tab === 'schedule' && (
        <div className="flex flex-col gap-8">
          <WeekCalendar
            freeSlots={freeSlots}
            selectedSlot={selectedSlot}
            suggestions={suggestions}
            loadingSuggestions={loadingSuggestions}
            onSlotSelect={loadSuggestions}
            onAddToBucketList={addSuggestionToList}
          />

          {items.filter((i) => !i.completed).length > 0 && (
            <div>
              <h2 className="font-serif text-lg text-bark mb-3">Schedule something from your list</h2>
              <div className="flex flex-col gap-2">
                {items.filter((i) => !i.completed).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setProposeItem(item)}
                    className="text-left p-3.5 bg-white rounded-2xl border border-sand hover:border-sand-deep transition-all flex items-center justify-between shadow-sm"
                  >
                    <span className="text-sm text-bark">{item.title}</span>
                    <span className="text-xs text-blush font-medium">Propose time</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {proposeItem && (
        <ProposeTimeModal
          item={proposeItem}
          freeSlots={freeSlots}
          onClose={() => setProposeItem(null)}
          onProposed={() => setProposeItem(null)}
        />
      )}
    </div>
  )
}
