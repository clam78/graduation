'use client'

import { useState } from 'react'
import { format, isPast, isToday, isFuture } from 'date-fns'

// Month is 0-indexed to avoid UTC midnight ≠ local midnight issues
const KEY_DATES = [
  { date: new Date(2026,  1,  2), label: 'First day of classes'        },
  { date: new Date(2026,  1, 16), label: "Presidents' Day"             },
  { date: new Date(2026,  2, 23), label: 'Spring break begins'         },
  { date: new Date(2026,  2, 27), label: 'Spring break ends'           },
  { date: new Date(2026,  3, 20), label: "Patriots' Day"               },
  { date: new Date(2026,  3, 29), label: 'Senior week preferences due' },
  { date: new Date(2026,  4, 12), label: 'Last day of classes'         },
  { date: new Date(2026,  4, 15), label: 'Finals begin'                },
  { date: new Date(2026,  4, 20), label: 'Finals end'                  },
  { date: new Date(2026,  4, 24), label: 'Senior ball'                 },
  { date: new Date(2026,  4, 25), label: 'Class movie night'           },
  { date: new Date(2026,  4, 27), label: 'Commencement begins'         },
  { date: new Date(2026,  4, 29), label: 'Graduation'                  },
]

export default function KeyDatesSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-bark/10 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-68 h-full bg-white/95 backdrop-blur-sm border-r border-sand shadow-xl flex flex-col">
          <div className="px-5 py-4 border-b border-sand flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="font-serif text-lg text-bark">Key Dates</h2>
              <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wide">Spring 2026</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-sand flex items-center justify-center text-muted hover:bg-sand-deep transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {KEY_DATES.map(({ date, label }, i) => {
              const past    = isPast(date) && !isToday(date)
              const today   = isToday(date)
              const upcoming = isFuture(date)
              const daysAway = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-5 py-3 border-b border-sand/40 last:border-0 ${
                    past ? 'opacity-35' : ''
                  } ${today ? 'bg-petal/50' : ''}`}
                >
                  {/* Date column */}
                  <div className="flex-shrink-0 w-10 text-center">
                    <p className={`text-[9px] uppercase tracking-wider font-medium ${today ? 'text-blush-deep' : 'text-muted'}`}>
                      {format(date, 'MMM')}
                    </p>
                    <p className={`text-lg font-serif leading-tight tabular-nums ${today ? 'text-blush-deep' : 'text-bark'}`}>
                      {format(date, 'd')}
                    </p>
                  </div>

                  {/* Label */}
                  <div className="flex-1 pt-0.5 min-w-0">
                    <p className={`text-xs leading-snug ${today ? 'font-semibold text-bark' : past ? 'text-muted' : 'text-bark'}`}>
                      {label}
                      {label === 'Graduation' && ' 🎓'}
                    </p>
                    {upcoming && daysAway <= 14 && (
                      <p className="text-[9px] text-blush-deep mt-0.5">
                        {daysAway === 1 ? 'tomorrow' : `in ${daysAway} days`}
                      </p>
                    )}
                    {today && (
                      <p className="text-[9px] text-blush-deep mt-0.5">today</p>
                    )}
                  </div>

                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* Toggle tab */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{ writingMode: open ? undefined : 'vertical-rl' }}
        className={`fixed top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ease-in-out bg-white border border-sand shadow-md hover:bg-petal hover:border-blush/50 transition-colors flex items-center gap-1.5 text-muted hover:text-bark ${
          open
            ? 'left-[272px] rounded-r-xl px-2 py-3 flex-col'
            : 'left-0 rounded-r-xl px-2 py-4 flex-row'
        }`}
      >
        <span className="text-sm">📅</span>
        <span className={`font-medium text-[10px] uppercase tracking-wider ${open ? '' : 'mt-1'}`}>
          {open ? '←' : 'dates'}
        </span>
      </button>
    </>
  )
}
