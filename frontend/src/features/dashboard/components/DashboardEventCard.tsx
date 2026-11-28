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
      className={`flex min-w-0 items-center justify-between gap-1 rounded-[6px] border border-border/70 px-1.5 py-1 sm:rounded-[8px] sm:px-2 sm:py-1 ${bgClass}`}
    >
      <span className="truncate text-[9.5px] font-bold leading-none text-brand-navy/70 sm:text-[11px]">
        {label}
      </span>
      <span className={`font-code shrink-0 text-[11px] font-extrabold tabular-nums leading-none sm:text-xs ${toneClass}`}>
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

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        {/* Header row: Date chip + Status badges */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-[7px] border text-center sm:h-9 sm:w-9 sm:rounded-[9px] ${
                event.isEnded || event.status === 'CLOSED'
                  ? 'border-slate-200 bg-slate-50 text-slate-600'
                  : 'border-brand-sky bg-sky-50/80 text-brand-navy'
              }`}
            >
              <span className="text-[9px] font-bold uppercase leading-none text-brand-primary sm:text-[10px]">
                {dateParts.month}
              </span>
              <span className="font-heading mt-0.5 text-[11px] font-extrabold leading-none sm:text-xs">
                {dateParts.day}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-code shrink-0 rounded bg-page px-1 py-0.5 text-[9.5px] font-bold text-brand-navy/85 ring-1 ring-border sm:px-1.5 sm:text-[10.5px]">
                  {event.codePrefix}
                </span>
                <span className="truncate text-[10.5px] font-bold text-brand-navy/80 sm:text-xs">
                  {formatCebuDate(event.startsAt)}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1">
                <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
                {timingChip}
              </div>
            </div>
          </div>
        </div>

        {/* Event Title */}
        <h2
          title={event.title}
          className="heading-card font-heading mt-1.5 truncate font-extrabold leading-snug text-brand-navy sm:mt-2"
        >
          {event.title}
        </h2>

        {/* Time & Venue */}
        <dl className="mt-1 space-y-0.5 text-[10.5px] text-brand-navy/80 sm:mt-1.5 sm:text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0 text-brand-primary sm:h-3.5 sm:w-3.5" />
            <span className="min-w-0 flex-1 truncate font-semibold">
              {formatCebuTimeRange(event.startsAt, event.endsAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0 text-brand-primary sm:h-3.5 sm:w-3.5" />
            <span title={event.venue} className="min-w-0 flex-1 truncate font-semibold">
              {event.venue}
            </span>
          </div>
        </dl>

        {/* Check-In Progress Bar */}
        <div className="mt-2 border-t border-border/60 pt-1.5 sm:pt-2">
          <div className="flex items-center justify-between gap-1 text-[10.5px] sm:text-xs">
            <span className="font-bold text-brand-navy">
              <span className="sm:hidden">Check-In</span>
              <span className="hidden sm:inline">Door Check-In</span>
            </span>
            <span className="font-code font-extrabold tabular-nums text-brand-primary">
              {event.checkedInCount}/{totalConfirmed}{' '}
              <span className="font-bold text-brand-navy/70">({percentCheckedIn}%)</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(percentCheckedIn, 100)}%` }}
            />
          </div>
          <p className="mt-1 flex items-center justify-between text-[10px] text-brand-navy/65 sm:text-[11px]">
            <span>Filled</span>
            <span className="font-code font-semibold tabular-nums">
              {totalConfirmed}/{event.capacity} ({percentSeatsFilled}%)
            </span>
          </p>
        </div>

        {/* Compact 3x2 Stat Grid */}
        <div className="mt-2 grid grid-cols-3 gap-1 sm:gap-1.5">
          <StatTile
            label="Cap."
            value={event.capacity}
            toneClass="text-brand-navy"
            bgClass="bg-page/70"
            title="Total capacity"
          />
          <StatTile
            label="Conf."
            value={totalConfirmed}
            toneClass="text-brand-primary"
            bgClass="bg-sky-50/70"
            title={`${event.confirmedCount} pending check-in + ${event.checkedInCount} checked in`}
          />
          <StatTile
            label="In"
            value={event.checkedInCount}
            toneClass="text-status-green"
            bgClass="bg-emerald-50/75"
            title="Checked in"
          />
          <StatTile
            label="Wait"
            value={event.waitlistCount}
            toneClass="text-status-amber"
            bgClass="bg-amber-50/75"
            title="Waitlisted"
          />
          <StatTile
            label="Canc."
            value={event.cancelledCount}
            toneClass="text-slate-600"
            bgClass="bg-slate-50"
            title="Cancelled"
          />
          <StatTile
            label="No-Show"
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

        {/* Footer Actions */}
        <div className="mt-auto grid grid-cols-2 gap-1.5 border-t border-border/70 pt-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onExportCsv(event)}
            disabled={isExporting}
            className="h-7 px-2 text-[11px] sm:h-8 sm:text-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3 w-3 shrink-0 animate-spin sm:h-3.5 sm:w-3.5" />
            ) : (
              <Download className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            )}
            <span className="sm:hidden">{isExporting ? 'Saving…' : 'CSV'}</span>
            <span className="hidden sm:inline">{isExporting ? 'Saving…' : 'Export CSV'}</span>
          </Button>

          <Link to={`/staff/events/${event.eventId}/attendees`} className="block">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              className="group/btn h-7 px-2 text-[11px] sm:h-8 sm:text-xs"
            >
              <span>Roster</span>
              <ArrowRight className="h-3 w-3 shrink-0 transition-transform duration-150 group-hover/btn:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}

