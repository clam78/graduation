'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function create() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, displayName }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }
    router.push(`/group/${data.group.id}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full flex flex-col gap-6">
        <a href="/dashboard" className="text-xs text-muted hover:text-bark transition-colors self-start">
          ← dashboard
        </a>
        <div className="text-center flex flex-col gap-1">
          <h1 className="font-serif text-3xl text-bark">Create your group</h1>
          <p className="text-muted text-sm">Your friends will join with an invite code.</p>
          <p className="text-muted-light text-xs mt-1">Counting down to May 29, 2026</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            className="px-4 py-3 rounded-2xl border border-sand bg-white text-sm text-bark placeholder:text-muted-light focus:outline-none focus:border-blush transition-colors"
          />
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="px-4 py-3 rounded-2xl border border-sand bg-white text-sm text-bark placeholder:text-muted-light focus:outline-none focus:border-blush transition-colors"
          />
        </div>

        {error && <p className="text-xs text-red-400 text-center">{error}</p>}

        <button
          onClick={create}
          disabled={loading || !name || !displayName}
          className="py-3.5 bg-bark text-white rounded-full font-medium text-sm disabled:opacity-40 hover:bg-bark-light transition-colors shadow-sm"
        >
          {loading ? 'Creating...' : 'Create group'}
        </button>

        <a href="/join" className="text-center text-xs text-muted hover:text-bark transition-colors">
          Join an existing group instead
        </a>
      </div>
    </main>
  )
}
