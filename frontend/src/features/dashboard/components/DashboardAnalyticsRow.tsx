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
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-12" aria-label="Loading analytics">
        <div className="staff-surface-card h-[210px] rounded-[var(--radius-card)] p-3 sm:p-4 lg:col-span-7">
          <div className="h-4 w-40 rounded skeleton-shimmer" />
          <div className="mt-3 space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-7 w-full rounded skeleton-shimmer" />
            ))}
          </div>
        </div>
        <div className="staff-surface-card h-[180px] rounded-[var(--radius-card)] p-3 sm:h-[210px] sm:p-4 lg:col-span-5">
          <div className="h-4 w-32 rounded skeleton-shimmer" />
          <div className="mt-4 flex items-center gap-4">
            <div className="h-24 w-24 shrink-0 rounded-full skeleton-shimmer" />
            <div className="flex-1 space-y-2">
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
      className="grid grid-cols-1 gap-3 lg:grid-cols-12"
      aria-label="Event capacity levels and attendance distribution"
    >
      {/* Left: Event Seat & Check-In Levels */}
      <div className="staff-surface-card flex flex-col rounded-[var(--radius-card)] p-3 sm:p-4 lg:col-span-7">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="heading-card font-heading truncate font-extrabold text-brand-navy">
              Event Seat &amp; Check-In Levels
            </h2>
            <p className="text-[11px] text-brand-navy/65 sm:text-xs">
              Capacity fill and real-time door arrivals
            </p>
          </div>

          <Link
            to="/staff/events"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
          >
            <span>Manage</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border/70">
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
                className="group block py-2 transition-colors hover:bg-page/60 sm:grid sm:grid-cols-12 sm:items-center sm:gap-2 sm:rounded-[var(--radius-control)] sm:px-2"
              >
                <div className="flex items-center justify-between gap-2 sm:col-span-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-code shrink-0 rounded bg-page px-1.5 py-0.5 text-[11px] font-bold text-brand-navy/85 ring-1 ring-border">
                        {ev.codePrefix}
                      </span>
                      <span className="truncate text-xs font-extrabold text-brand-navy group-hover:text-brand-primary">
                        {ev.title}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-brand-navy/60">
                      {formatCebuDate(ev.startsAt)} · {ev.checkedInCount} in
                    </p>
                  </div>

                  {/* Mobile Compact Ratio */}
                  <span className="font-code shrink-0 text-xs font-extrabold tabular-nums text-brand-navy sm:hidden">
                    {confirmedTotal}
                    <span className="text-[11px] font-semibold text-brand-navy/55">
                      /{ev.capacity}
                    </span>
                  </span>
                </div>

                {/* Progress Bar (Compact full-width bar below on mobile, column on tablet+) */}
                <div className="mt-1.5 flex items-center gap-2 sm:col-span-5 sm:mt-0">
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-100 sm:h-2.5">
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
                  <span className="font-code w-8 shrink-0 text-right text-[11px] font-bold tabular-nums text-brand-navy/80">
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
      <div className="staff-surface-card flex flex-col rounded-[var(--radius-card)] p-3 sm:p-4 lg:col-span-5">
        <div>
          <h2 className="heading-card font-heading font-extrabold text-brand-navy">
            Registration Status
          </h2>
          <p className="text-[11px] text-brand-navy/65 sm:text-xs">
            Live pass breakdown across events
          </p>
        </div>

        <div className="mt-3 flex flex-1 items-center justify-between gap-3 sm:mt-4 sm:gap-4">
          <div className="relative h-24 w-24 shrink-0 sm:h-30 sm:w-30">
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
              <span className="font-code text-base font-extrabold tabular-nums leading-none text-brand-navy sm:text-lg">
                {totalPasses}
              </span>
              <span className="mt-0.5 text-[11px] font-bold text-brand-navy/60">Passes</span>
            </div>
          </div>

          <dl className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
            {segments.map((seg) => (
              <div key={seg.key} className="flex items-center justify-between gap-2 text-xs">
                <dt className="flex min-w-0 items-center gap-1.5 font-semibold text-brand-navy/85">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${seg.dotClass}`} />
                  <span className="truncate text-[11px] sm:text-xs">{seg.label}</span>
                </dt>
                <dd className="font-code shrink-0 text-[11px] font-bold tabular-nums text-brand-navy sm:text-xs">
                  {seg.count}{' '}
                  <span className="font-semibold text-brand-navy/55">({seg.pct}%)</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
