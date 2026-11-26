import {
  ArrowRight,
  Clock,
  Download,
  Loader2,
  MapPin,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { StatusBadge, type BadgeTone } from '../../../components/ui/StatusBadge'
import { formatCebuDate, formatCebuTimeRange, getCebuDateParts } from '../../../lib/formatDate'
import type { EventMetrics } from '../api'

function getEventStatusMeta(status: EventMetrics['status']): { tone: BadgeTone; label: string } {
  switch (status) {
    case 'PUBLISHED':
      return { tone: 'green', label: 'Published' }
    case 'DRAFT':
      return { tone: 'amber', label: 'Draft' }
    case 'CLOSED':
      return { tone: 'neutral', label: 'Closed' }
  }
}

interface StatTileProps {
  label: string
  value: number | string
  toneClass: string
  bgClass: string
  title?: string
}

function StatTile({ label, value, toneClass, bgClass, title }: StatTileProps) {
  return (
    <div
      title={title}
      className={`flex min-w-0 flex-col justify-between rounded-[var(--radius-control)] border border-border/70 px-2 py-1.5 sm:px-2.5 sm:py-2 ${bgClass}`}
    >
      <span className="truncate text-[11px] font-bold text-brand-navy/70">{label}</span>
      <span className={`font-code mt-0.5 text-sm font-extrabold tabular-nums leading-tight sm:text-base ${toneClass}`}>
        {value}
      </span>
    </div>
  )
}

interface DashboardEventCardProps {
  event: EventMetrics
  onExportCsv: (event: EventMetrics) => void
  isExporting: boolean
  animationDelayClass?: string
}

export function DashboardEventCard({
  event,
  onExportCsv,
  isExporting,
  animationDelayClass = '',
}: DashboardEventCardProps) {
  const dateParts = getCebuDateParts(event.startsAt)
  const statusMeta = getEventStatusMeta(event.status)

  // Confirmed total matches attendee roster (CONFIRMED + CHECKED_IN)
  const totalConfirmed = event.confirmedCount + event.checkedInCount
  const percentCheckedIn =
    totalConfirmed > 0 ? Math.round((event.checkedInCount / totalConfirmed) * 100) : 0
  const percentSeatsFilled =
    event.capacity > 0 ? Math.min(100, Math.round((totalConfirmed / event.capacity) * 100)) : 0

  const topAccentClass =
    event.status === 'CLOSED' || event.isEnded
      ? 'bg-slate-300'
      : event.status === 'DRAFT'
        ? 'bg-amber-400'
        : 'bg-gradient-to-r from-brand-primary via-brand-blue to-brand-cyan'

  const timingChip = event.isEnded ? (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
      Ended
    </span>
  ) : event.isStarted ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-status-green ring-1 ring-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-status-green" aria-hidden="true" />
      Live
    </span>
  ) : (
    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-brand-primary ring-1 ring-brand-sky">
      Upcoming
    </span>
  )

  return (
    <article
      className={`staff-surface-card flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] transition-shadow duration-200 hover:shadow-card-hover animate-rise ${animationDelayClass}`}
    >
      <div className={`h-1 w-full shrink-0 ${topAccentClass}`} aria-hidden="true" />

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Header row: Date chip + Status badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] border text-center ${
                event.isEnded || event.status === 'CLOSED'
                  ? 'border-slate-200 bg-slate-50 text-slate-600'
                  : 'border-brand-sky bg-sky-50/80 text-brand-navy'
              }`}
            >
              <span className="text-[11px] font-bold uppercase leading-none text-brand-primary">
                {dateParts.month}
              </span>
              <span className="font-heading mt-0.5 text-sm font-extrabold leading-none">
                {dateParts.day}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-code rounded bg-page px-1.5 py-0.5 text-[11px] font-bold text-brand-navy/85 ring-1 ring-border">
                  {event.codePrefix}
                </span>
                <span className="truncate text-xs font-bold text-brand-navy/80">
                  {formatCebuDate(event.startsAt)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
                {timingChip}
              </div>
            </div>
          </div>
        </div>

        {/* Event Title */}
        <h2 className="heading-card font-heading mt-3 line-clamp-2 font-extrabold text-brand-navy">
          {event.title}
        </h2>

        {/* Time & Venue Info Box */}
        <dl className="mt-2.5 space-y-1 rounded-[var(--radius-control)] bg-page/80 px-2.5 py-2 text-xs text-brand-navy/80">
          <div className="flex items-start gap-1.5">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" />
            <span className="min-w-0 flex-1 break-words font-semibold">
              {formatCebuTimeRange(event.startsAt, event.endsAt)}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" />
            <span className="min-w-0 flex-1 break-words font-semibold">{event.venue}</span>
          </div>
        </dl>

        {/* Check-In Progress Bar */}
        <div className="mt-3 rounded-[var(--radius-control)] border border-border/70 bg-page/40 p-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-brand-navy">Door Check-In</span>
            <span className="font-code font-extrabold tabular-nums text-brand-primary">
              {event.checkedInCount} / {totalConfirmed}{' '}
              <span className="text-[11px] font-bold text-brand-navy/70">
                ({percentCheckedIn}%)
              </span>
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(percentCheckedIn, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 flex items-center justify-between text-[11px] text-brand-navy/65">
            <span>Seats Filled</span>
            <span className="font-code font-semibold tabular-nums">
              {totalConfirmed} / {event.capacity} ({percentSeatsFilled}%)
            </span>
          </p>
        </div>

        {/* Clean 3x2 Stat Grid: balanced on mobile & desktop */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2">
          <StatTile
            label="Capacity"
            value={event.capacity}
            toneClass="text-brand-navy"
            bgClass="bg-page/70"
          />
          <StatTile
            label="Confirmed"
            value={totalConfirmed}
            toneClass="text-brand-primary"
            bgClass="bg-sky-50/70"
            title={`${event.confirmedCount} pending check-in + ${event.checkedInCount} checked in`}
          />
          <StatTile
            label="Checked In"
            value={event.checkedInCount}
            toneClass="text-status-green"
            bgClass="bg-emerald-50/75"
          />
          <StatTile
            label="Waitlisted"
            value={event.waitlistCount}
            toneClass="text-status-amber"
            bgClass="bg-amber-50/75"
          />
          <StatTile
            label="Cancelled"
            value={event.cancelledCount}
            toneClass="text-slate-600"
            bgClass="bg-slate-50"
          />
          <StatTile
            label="No-Shows"
            value={event.noShowCount !== null ? event.noShowCount : '—'}
            toneClass={event.noShowCount !== null ? 'text-status-red' : 'text-slate-500'}
            bgClass={event.noShowCount !== null ? 'bg-red-50/70' : 'bg-page/55'}
            title={
              event.noShowCount === null
                ? 'Calculated automatically once the event starts'
                : 'Confirmed attendees who have not checked in'
            }
          />
        </div>

        {event.noShowCount === null && (
          <p className="mt-2 text-[11px] leading-snug text-brand-navy/60">
            No-shows appear automatically once the event starts.
          </p>
        )}

        {/* Footer Actions: uniform >=40px tap targets */}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => onExportCsv(event)}
            disabled={isExporting}
            className="min-h-[40px]"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Download className="h-4 w-4 shrink-0" />
            )}
            <span>{isExporting ? 'Saving…' : 'Export CSV'}</span>
          </Button>

          <Link to={`/staff/events/${event.eventId}/attendees`} className="block">
            <Button variant="primary" size="md" fullWidth className="group/btn min-h-[40px]">
              <span>Roster</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}

