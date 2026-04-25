'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function join() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/groups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: code.trim().toLowerCase(), displayName }),
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
        <div className="text-center flex flex-col gap-1">
          <h1 className="font-serif text-3xl text-bark">Join a group</h1>
          <p className="text-muted text-sm">Enter the invite code your friend shared.</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Invite code"
            className="px-4 py-3 rounded-2xl border border-sand bg-white text-sm text-bark placeholder:text-muted-light focus:outline-none focus:border-blush transition-colors font-mono tracking-wider"
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
          onClick={join}
          disabled={loading || !code || !displayName}
          className="py-3.5 bg-bark text-white rounded-full font-medium text-sm disabled:opacity-40 hover:bg-bark-light transition-colors shadow-sm"
        >
          {loading ? 'Joining...' : 'Join group'}
        </button>

        <a href="/group/new" className="text-center text-xs text-muted hover:text-bark transition-colors">
          Create a new group instead
        </a>
      </div>
    </main>
  )
}
