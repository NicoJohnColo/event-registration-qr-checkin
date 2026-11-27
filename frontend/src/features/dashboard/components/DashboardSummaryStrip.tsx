import { CheckCircle2, Clock, Ticket, Users } from 'lucide-react'
import type { EventMetrics } from '../api'

interface DashboardSummaryStripProps {
  events: EventMetrics[]
  isLoading: boolean
}

export function DashboardSummaryStrip({ events, isLoading }: DashboardSummaryStripProps) {
  const activeEvents = events.filter((e) => !e.isEnded && e.status === 'PUBLISHED').length
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0)
  const totalConfirmed = events.reduce((sum, e) => sum + e.confirmedCount + e.checkedInCount, 0)
  const totalCheckedIn = events.reduce((sum, e) => sum + e.checkedInCount, 0)
  const totalWaitlist = events.reduce((sum, e) => sum + e.waitlistCount, 0)
  const totalCancelled = events.reduce((sum, e) => sum + e.cancelledCount, 0)

  const seatFillPct = totalCapacity > 0 ? Math.round((totalConfirmed / totalCapacity) * 100) : 0
  const checkInPct = totalConfirmed > 0 ? Math.round((totalCheckedIn / totalConfirmed) * 100) : 0

  if (isLoading) {
    return (
      <section className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-3" aria-label="Loading summary">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="staff-surface-card h-[62px] rounded-[var(--radius-card)] p-2 sm:h-[104px] sm:p-3.5"
          >
            <div className="h-5 w-5 rounded-[6px] skeleton-shimmer sm:h-8 sm:w-8 sm:rounded-[8px]" />
            <div className="mt-1.5 h-3 w-14 rounded skeleton-shimmer" />
            <div className="mt-1 h-4 w-10 rounded skeleton-shimmer" />
          </div>
        ))}
      </section>
    )
  }

  return (
    <section
      className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-3"
      aria-label="Overall event KPI summary"
    >
      <div className="staff-surface-card flex min-w-0 flex-col justify-between rounded-[var(--radius-card)] p-2 sm:p-3.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-sky-100/90 text-brand-primary sm:h-8 sm:w-8 sm:rounded-[10px]">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <p className="truncate text-[10.5px] font-bold text-brand-navy/75 sm:hidden">Capacity</p>
          </div>
          <span className="rounded-full bg-page px-1.5 py-0.5 text-[10px] font-bold text-brand-navy/70 sm:px-2 sm:text-[11px]">
            {events.length} ev
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-1.5 sm:mt-2 sm:block">
          <p className="hidden truncate text-xs font-bold text-brand-navy/70 sm:block">Total Capacity</p>
          <p className="font-code text-kpi font-extrabold tabular-nums text-brand-navy sm:mt-0.5">
            {totalCapacity}
          </p>
          <p className="truncate text-[10px] font-semibold text-brand-primary sm:mt-0.5 sm:text-[11px]">
            {activeEvents} active
          </p>
        </div>
      </div>

      <div className="staff-surface-card flex min-w-0 flex-col justify-between rounded-[var(--radius-card)] p-2 sm:p-3.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200/70 sm:h-8 sm:w-8 sm:rounded-[10px]">
              <Ticket className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <p className="truncate text-[10.5px] font-bold text-brand-navy/75 sm:hidden">Confirmed</p>
          </div>
          <span className="font-code rounded-full bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-primary sm:px-2 sm:text-[11px]">
            {seatFillPct}%
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-1.5 sm:mt-2 sm:block">
          <p className="hidden truncate text-xs font-bold text-brand-navy/70 sm:block">Confirmed Seats</p>
          <p className="font-code text-kpi font-extrabold tabular-nums text-brand-navy sm:mt-0.5">
            {totalConfirmed}
          </p>
          <p className="truncate text-[10px] font-semibold text-brand-navy/65 sm:mt-0.5 sm:text-[11px]">
            {Math.max(0, totalCapacity - totalConfirmed)} open
          </p>
        </div>
      </div>

      <div className="staff-surface-card flex min-w-0 flex-col justify-between rounded-[var(--radius-card)] p-2 sm:p-3.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-emerald-50 text-status-green ring-1 ring-emerald-200/70 sm:h-8 sm:w-8 sm:rounded-[10px]">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <p className="truncate text-[10.5px] font-bold text-brand-navy/75 sm:hidden">Checked In</p>
          </div>
          <span className="font-code rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-status-green sm:px-2 sm:text-[11px]">
            {checkInPct}%
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-1.5 sm:mt-2 sm:block">
          <p className="hidden truncate text-xs font-bold text-brand-navy/70 sm:block">Door Check-Ins</p>
          <p className="font-code text-kpi font-extrabold tabular-nums text-brand-navy sm:mt-0.5">
            {totalCheckedIn}
          </p>
          <p className="truncate text-[10px] font-semibold text-status-green sm:mt-0.5 sm:text-[11px]">
            of {totalConfirmed} in
          </p>
        </div>
      </div>

      <div className="staff-surface-card flex min-w-0 flex-col justify-between rounded-[var(--radius-card)] p-2 sm:p-3.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-amber-50 text-status-amber ring-1 ring-amber-200/70 sm:h-8 sm:w-8 sm:rounded-[10px]">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <p className="truncate text-[10.5px] font-bold text-brand-navy/75 sm:hidden">Waitlist</p>
          </div>
          <span className="font-code rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 sm:px-2 sm:text-[11px]">
            {totalCancelled} canc.
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-1.5 sm:mt-2 sm:block">
          <p className="hidden truncate text-xs font-bold text-brand-navy/70 sm:block">Waitlist Queue</p>
          <p className="font-code text-kpi font-extrabold tabular-nums text-brand-navy sm:mt-0.5">
            {totalWaitlist}
          </p>
          <p className="truncate text-[10px] font-semibold text-brand-navy/65 sm:mt-0.5 sm:text-[11px]">
            {totalWaitlist > 0 ? 'Pending promo' : 'No queue'}
          </p>
        </div>
      </div>
    </section>
  )
}
