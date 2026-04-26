'use client'

import { useEffect, useState } from 'react'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

interface CountdownProps {
  graduationDate: string
  variant?: 'sidebar' | 'inline'
}

export default function Countdown({ graduationDate, variant = 'inline' }: CountdownProps) {
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

  if (variant === 'sidebar') {
    return (
      <div className="bg-petal rounded-3xl border border-blush/30 px-6 py-8 flex flex-col items-center justify-center gap-5 h-full min-h-[280px]">
        <p className="text-[10px] uppercase tracking-[0.25em] text-blush-deep font-medium">until graduation</p>

        <div className="flex flex-col items-center gap-0.5">
          <span className="font-serif text-[5.5rem] leading-none text-bark tabular-nums">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted uppercase tracking-widest">days</span>
        </div>

        <div className="flex gap-5">
          {[
            { label: 'hr',  value: timeLeft.hours },
            { label: 'min', value: timeLeft.minutes },
            { label: 'sec', value: timeLeft.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="font-serif text-2xl text-bark tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-[9px] text-muted uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-light tracking-wide">May 29, 2026</p>
      </div>
    )
  }

  return (
    <div className="text-center py-10 px-4">
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
