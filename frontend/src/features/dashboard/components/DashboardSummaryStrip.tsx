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
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" aria-label="Loading summary">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="staff-surface-card h-[86px] rounded-[var(--radius-card)] p-2.5 sm:h-[104px] sm:p-3.5"
          >
            <div className="h-6 w-6 rounded-[8px] skeleton-shimmer sm:h-8 sm:w-8" />
            <div className="mt-2 h-3 w-16 rounded skeleton-shimmer" />
            <div className="mt-1.5 h-5 w-12 rounded skeleton-shimmer" />
          </div>
        ))}
      </section>
    )
  }

  return (
    <section
      className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
      aria-label="Overall event KPI summary"
    >
      <div className="staff-surface-card flex min-w-0 flex-col justify-between rounded-[var(--radius-card)] p-2.5 sm:p-3.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-sky-100/90 text-brand-primary sm:h-8 sm:w-8 sm:rounded-[10px]">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-bold text-brand-navy/70">
            {events.length} events
          </span>
        </div>
        <div className="mt-2 min-w-0">
          <p className="truncate text-[11px] font-bold text-brand-navy/70 sm:text-xs">Total Capacity</p>
          <p className="font-code text-kpi mt-0.5 font-extrabold tabular-nums text-brand-navy">
            {totalCapacity}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-brand-primary">
            {activeEvents} active published
          </p>
        </div>
      </div>

      <div className="staff-surface-card flex min-w-0 flex-col justify-between rounded-[var(--radius-card)] p-2.5 sm:p-3.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200/70 sm:h-8 sm:w-8 sm:rounded-[10px]">
            <Ticket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="font-code rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-brand-primary">
            {seatFillPct}%
          </span>
        </div>
        <div className="mt-2 min-w-0">
          <p className="truncate text-[11px] font-bold text-brand-navy/70 sm:text-xs">Confirmed Seats</p>
          <p className="font-code text-kpi mt-0.5 font-extrabold tabular-nums text-brand-navy">
            {totalConfirmed}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-brand-navy/65">
            {Math.max(0, totalCapacity - totalConfirmed)} seats open
          </p>
        </div>
      </div>

      <div className="staff-surface-card flex min-w-0 flex-col justify-between rounded-[var(--radius-card)] p-2.5 sm:p-3.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-emerald-50 text-status-green ring-1 ring-emerald-200/70 sm:h-8 sm:w-8 sm:rounded-[10px]">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="font-code rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-status-green">
            {checkInPct}%
          </span>
        </div>
        <div className="mt-2 min-w-0">
          <p className="truncate text-[11px] font-bold text-brand-navy/70 sm:text-xs">Door Check-Ins</p>
          <p className="font-code text-kpi mt-0.5 font-extrabold tabular-nums text-brand-navy">
            {totalCheckedIn}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-status-green">
            of {totalConfirmed} arrived
          </p>
        </div>
      </div>

      <div className="staff-surface-card flex min-w-0 flex-col justify-between rounded-[var(--radius-card)] p-2.5 sm:p-3.5">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-amber-50 text-status-amber ring-1 ring-amber-200/70 sm:h-8 sm:w-8 sm:rounded-[10px]">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="font-code rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
            {totalCancelled} canc.
          </span>
        </div>
        <div className="mt-2 min-w-0">
          <p className="truncate text-[11px] font-bold text-brand-navy/70 sm:text-xs">Waitlist Queue</p>
          <p className="font-code text-kpi mt-0.5 font-extrabold tabular-nums text-brand-navy">
            {totalWaitlist}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-brand-navy/65">
            {totalWaitlist > 0 ? 'Ready to promote' : 'No pending queue'}
          </p>
        </div>
      </div>
    </section>
  )
}
