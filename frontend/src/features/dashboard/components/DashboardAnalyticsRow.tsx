import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCebuDate } from '../../../lib/formatDate'
import type { EventMetrics } from '../api'

interface DashboardAnalyticsRowProps {
  events: EventMetrics[]
  isLoading: boolean
}

const DONUT_RADIUS = 44
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS

export function DashboardAnalyticsRow({ events, isLoading }: DashboardAnalyticsRowProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-12" aria-label="Loading analytics">
        <div className="staff-surface-card h-[146px] rounded-[var(--radius-card)] p-2.5 sm:h-[210px] sm:p-4 lg:col-span-7">
          <div className="h-3.5 w-36 rounded skeleton-shimmer sm:h-4 sm:w-40" />
          <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-3 sm:grid-cols-1 sm:gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full rounded skeleton-shimmer sm:h-7" />
            ))}
          </div>
        </div>
        <div className="staff-surface-card h-[112px] rounded-[var(--radius-card)] p-2.5 sm:h-[210px] sm:p-4 lg:col-span-5">
          <div className="h-3.5 w-28 rounded skeleton-shimmer sm:h-4 sm:w-32" />
          <div className="mt-2.5 flex items-center gap-3 sm:mt-4 sm:gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full skeleton-shimmer sm:h-24 sm:w-24" />
            <div className="grid flex-1 grid-cols-2 gap-1.5 sm:grid-cols-1 sm:gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-3.5 w-full rounded skeleton-shimmer" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) return null

  const topEvents = [...events]
    .sort((a, b) => {
      const aDone = a.isEnded || a.status === 'CLOSED'
      const bDone = b.isEnded || b.status === 'CLOSED'
      if (aDone !== bDone) return aDone ? 1 : -1
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    })
    .slice(0, 5)

  const checkedIn = events.reduce((sum, e) => sum + e.checkedInCount, 0)
  const pendingConfirmed = events.reduce((sum, e) => sum + e.confirmedCount, 0)
  const waitlisted = events.reduce((sum, e) => sum + e.waitlistCount, 0)
  const cancelled = events.reduce((sum, e) => sum + e.cancelledCount, 0)
  const totalPasses = checkedIn + pendingConfirmed + waitlisted + cancelled

  const rawSegments = [
    {
      key: 'checked_in',
      label: 'Checked In',
      count: checkedIn,
      color: '#1951FC',
      dotClass: 'bg-[#1951FC]',
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      count: pendingConfirmed,
      color: '#38BDF8',
      dotClass: 'bg-sky-400',
    },
    {
      key: 'waitlist',
      label: 'Waitlisted',
      count: waitlisted,
      color: '#F59E0B',
      dotClass: 'bg-amber-500',
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      count: cancelled,
      color: '#94A3B8',
      dotClass: 'bg-slate-400',
    },
  ]

  let cumulativeLength = 0
  const segments = rawSegments.map((seg) => {
    const pct = totalPasses > 0 ? Math.round((seg.count / totalPasses) * 100) : 0
    const len = totalPasses > 0 ? (seg.count / totalPasses) * DONUT_CIRCUMFERENCE : 0
    const offset = -cumulativeLength
    cumulativeLength += len
    return { ...seg, pct, len, offset }
  })

  return (
    <section
      className="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-12"
      aria-label="Event capacity levels and attendance distribution"
    >
      {/* Left: Event Seat & Check-In Levels (2-column compact grid on mobile, spacious rows on desktop) */}
      <div className="staff-surface-card flex flex-col rounded-[var(--radius-card)] p-2.5 sm:p-4 lg:col-span-7">
        <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2.5">
          <div className="min-w-0">
            <h2 className="heading-card font-heading truncate font-extrabold text-brand-navy">
              <span className="sm:hidden">Seat &amp; Check-In Levels</span>
              <span className="hidden sm:inline">Event Seat &amp; Check-In Levels</span>
            </h2>
            <p className="hidden text-xs text-brand-navy/65 sm:block">
              Capacity fill and real-time door arrivals
            </p>
          </div>

          <Link
            to="/staff/events"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline sm:text-xs"
          >
            <span>Manage</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:block sm:divide-y sm:divide-border/70">
          {topEvents.map((ev) => {
            const confirmedTotal = ev.confirmedCount + ev.checkedInCount
            const fillPct =
              ev.capacity > 0 ? Math.min(100, Math.round((confirmedTotal / ev.capacity) * 100)) : 0
            const checkedPctOfCap =
              ev.capacity > 0 ? Math.min(100, Math.round((ev.checkedInCount / ev.capacity) * 100)) : 0
            const pendingPctOfCap = Math.max(0, fillPct - checkedPctOfCap)

            return (
              <Link
                key={ev.eventId}
                to={`/staff/events/${ev.eventId}/attendees`}
                className="group flex flex-col justify-between rounded-[var(--radius-control)] border border-border/70 bg-page/55 p-1.5 transition-colors hover:bg-page sm:grid sm:grid-cols-12 sm:items-center sm:gap-2 sm:border-0 sm:bg-transparent sm:px-2 sm:py-2"
              >
                <div className="flex items-center justify-between gap-1 sm:col-span-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 sm:justify-start sm:gap-1.5">
                      <span className="font-code shrink-0 rounded bg-white px-1 py-0.5 text-[9.5px] font-bold text-brand-navy/85 ring-1 ring-border sm:bg-page sm:px-1.5 sm:text-[11px]">
                        {ev.codePrefix}
                      </span>
                      <span className="font-code shrink-0 text-[10px] font-extrabold tabular-nums text-brand-navy sm:hidden">
                        {confirmedTotal}
                        <span className="font-semibold text-brand-navy/55">/{ev.capacity}</span>
                      </span>
                      <span className="hidden truncate text-xs font-extrabold text-brand-navy group-hover:text-brand-primary sm:inline">
                        {ev.title}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10.5px] font-bold text-brand-navy group-hover:text-brand-primary sm:hidden">
                      {ev.title}
                    </p>
                    <p className="mt-0.5 hidden truncate text-[11px] text-brand-navy/60 sm:block">
                      {formatCebuDate(ev.startsAt)} · {ev.checkedInCount} in
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-1 flex items-center gap-1.5 sm:col-span-5 sm:mt-0 sm:gap-2">
                  <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80 sm:h-2.5 sm:bg-slate-100">
                    <div
                      className="h-full bg-brand-primary transition-all duration-500"
                      style={{ width: `${checkedPctOfCap}%` }}
                      title={`Checked In: ${ev.checkedInCount}`}
                    />
                    <div
                      className="h-full bg-sky-300 transition-all duration-500"
                      style={{ width: `${pendingPctOfCap}%` }}
                      title={`Confirmed Pending: ${ev.confirmedCount}`}
                    />
                  </div>
                  <span className="font-code shrink-0 text-right text-[9.5px] font-bold tabular-nums text-brand-navy/75 sm:w-8 sm:text-[11px]">
                    {fillPct}%
                  </span>
                </div>

                {/* Desktop Ratio Column */}
                <div className="hidden text-right sm:col-span-2 sm:block">
                  <span className="font-code text-xs font-extrabold tabular-nums text-brand-navy">
                    {confirmedTotal}
                    <span className="text-[11px] font-semibold text-brand-navy/55">
                      /{ev.capacity}
                    </span>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right: Compact Registration Status Donut */}
      <div className="staff-surface-card flex flex-col rounded-[var(--radius-card)] p-2.5 sm:p-4 lg:col-span-5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="heading-card font-heading truncate font-extrabold text-brand-navy">
              Registration Status
            </h2>
            <p className="hidden text-xs text-brand-navy/65 sm:block">
              Live pass breakdown across events
            </p>
          </div>
          <span className="font-code shrink-0 rounded-full bg-page px-2 py-0.5 text-[10px] font-bold text-brand-navy/70 sm:hidden">
            {totalPasses} passes
          </span>
        </div>

        <div className="mt-2 flex flex-1 items-center justify-between gap-2.5 sm:mt-4 sm:gap-4">
          <div className="relative h-16 w-16 shrink-0 sm:h-28 sm:w-28">
            <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Registration status donut chart">
              <circle
                cx="60"
                cy="60"
                r={DONUT_RADIUS}
                fill="none"
                stroke="#E8EEF8"
                strokeWidth="15"
              />
              {totalPasses > 0 &&
                segments.map(
                  (seg) =>
                    seg.len > 0 && (
                      <circle
                        key={seg.key}
                        cx="60"
                        cy="60"
                        r={DONUT_RADIUS}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="15"
                        strokeDasharray={`${seg.len} ${DONUT_CIRCUMFERENCE}`}
                        strokeDashoffset={seg.offset}
                        transform="rotate(-90 60 60)"
                        className="transition-all duration-500"
                      />
                    ),
                )}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-code text-xs font-extrabold tabular-nums leading-none text-brand-navy sm:text-lg">
                {totalPasses}
              </span>
              <span className="mt-0.5 hidden text-[11px] font-bold text-brand-navy/60 sm:block">Passes</span>
            </div>
          </div>

          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-2 gap-y-1 sm:block sm:space-y-2">
            {segments.map((seg) => (
              <div key={seg.key} className="flex items-center justify-between gap-1 text-[10.5px] sm:gap-2 sm:text-xs">
                <dt className="flex min-w-0 items-center gap-1 font-semibold text-brand-navy/85 sm:gap-1.5">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${seg.dotClass}`} />
                  <span className="truncate">{seg.label}</span>
                </dt>
                <dd className="font-code shrink-0 font-bold tabular-nums text-brand-navy">
                  {seg.count}
                  <span className="hidden font-semibold text-brand-navy/55 sm:inline"> ({seg.pct}%)</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
