'use client'

import { useEffect, useState } from 'react'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

interface CountdownProps {
  graduationDate: string
  groupName: string
}

export default function Countdown({ graduationDate, groupName }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(graduationDate))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(graduationDate)), 1000)
    return () => clearInterval(timer)
  }, [graduationDate])

  if (timeLeft.total <= 0) {
    return (
      <div className="text-center py-14">
        <h2 className="font-serif text-4xl text-bark">Congratulations, graduates.</h2>
      </div>
    )
  }

  return (
    <div className="text-center py-10 px-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted font-medium mb-1">{groupName}</p>
      <h2 className="font-serif text-2xl text-bark mb-8">until graduation</h2>
      <div className="flex justify-center gap-4">
        {[
          { label: 'days', value: timeLeft.days },
          { label: 'hours', value: timeLeft.hours },
          { label: 'min', value: timeLeft.minutes },
          { label: 'sec', value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 bg-white rounded-2xl border border-sand shadow-sm flex items-center justify-center">
              <span className="font-serif text-3xl text-bark tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getTimeLeft(graduationDate: string) {
  const target = new Date(graduationDate)
  const now = new Date()
  const total = target.getTime() - now.getTime()
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    total,
    days: differenceInDays(target, now),
    hours: differenceInHours(target, now) % 24,
    minutes: differenceInMinutes(target, now) % 60,
    seconds: differenceInSeconds(target, now) % 60,
  }
}
