import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { StatusBadge, type BadgeTone } from '../../../components/ui/StatusBadge'
import { formatCebuDate, formatCebuTimeRange, getCebuDateParts } from '../../../lib/formatDate'
import type { EventStatus, StaffEventItem } from '../types'

interface StaffEventCardProps {
  event: StaffEventItem
  onEdit: (event: StaffEventItem) => void
  onPublish: (event: StaffEventItem) => void
  onCloseEvent: (event: StaffEventItem) => void
  isMutating?: boolean
  animationDelayClass?: string
}

function getStatusMeta(status: EventStatus): { tone: BadgeTone; label: string } {
  switch (status) {
    case 'PUBLISHED':
      return { tone: 'green', label: 'Published' }
    case 'DRAFT':
      return { tone: 'amber', label: 'Draft' }
    case 'CLOSED':
      return { tone: 'neutral', label: 'Closed' }
  }
}

export function StaffEventCard({
  event,
  onEdit,
  onPublish,
  onCloseEvent,
  isMutating = false,
  animationDelayClass = '',
}: StaffEventCardProps) {
  const [confirmingClose, setConfirmingClose] = useState(false)
  const dateParts = getCebuDateParts(event.startsAt)
  const statusMeta = getStatusMeta(event.status)

  const registeredTotal = event.confirmedCount + event.checkedInCount
  const fillPct =
    event.capacity > 0 ? Math.min(100, Math.round((registeredTotal / event.capacity) * 100)) : 0

  const topAccentClass =
    event.status === 'CLOSED' || event.ended
      ? 'bg-slate-300'
      : event.status === 'DRAFT'
        ? 'bg-amber-400'
        : 'bg-gradient-to-r from-brand-primary via-brand-blue to-brand-cyan'

  return (
    <article
      className={`staff-surface-card flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-card)] transition-shadow duration-200 hover:shadow-card-hover animate-rise ${animationDelayClass}`}
    >
      <div className={`h-1 w-full shrink-0 ${topAccentClass}`} aria-hidden="true" />

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Top Row: Date Box + Prefix + Status + Timing */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] border text-center ${
                event.ended || event.status === 'CLOSED'
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
                {event.ended && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    Ended
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="heading-card font-heading mt-2.5 line-clamp-2 font-extrabold text-brand-navy">
          {event.title}
        </h2>
        {event.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-navy/70">
            {event.description}
          </p>
        )}

        {/* Schedule & Venue */}
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

        {/* Registration Capacity Progress */}
        <div className="mt-3 rounded-[var(--radius-control)] border border-border/70 bg-page/40 p-2.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-brand-navy">
              <Users className="h-3.5 w-3.5 text-brand-primary" />
              <span>Registered</span>
            </span>
            <span className="font-code font-extrabold tabular-nums text-brand-navy">
              {registeredTotal} / {event.capacity}{' '}
              <span className="text-[11px] font-bold text-brand-navy/65">({fillPct}%)</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-brand-navy/65">
            <span>{event.checkedInCount} checked in</span>
            {event.waitlistCount > 0 ? (
              <span className="text-status-amber font-bold">{event.waitlistCount} waitlisted</span>
            ) : (
              <span>{Math.max(0, event.capacity - registeredTotal)} spots left</span>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="mt-auto border-t border-border/70 pt-3">
          {confirmingClose ? (
            <div className="rounded-[var(--radius-control)] border border-status-red/30 bg-red-50/90 p-2">
              <p className="text-center text-xs font-bold text-status-red">
                Close event &amp; stop registrations?
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmingClose(false)}
                  disabled={isMutating}
                  className="min-h-[36px] bg-white"
                >
                  Keep Open
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setConfirmingClose(false)
                    onCloseEvent(event)
                  }}
                  disabled={isMutating}
                  className="min-h-[36px] !bg-status-red !text-white hover:!bg-red-700"
                >
                  {isMutating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm Close'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => onEdit(event)}
                disabled={isMutating}
                className="px-2"
              >
                <Pencil className="h-3.5 w-3.5 shrink-0" />
                <span>Edit</span>
              </Button>

              {event.status === 'DRAFT' ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onPublish(event)}
                  disabled={isMutating}
                  className="border-emerald-200 bg-emerald-50 px-2 text-status-green hover:bg-emerald-100"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span>Publish</span>
                </Button>
              ) : event.status === 'PUBLISHED' ? (
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setConfirmingClose(true)}
                  disabled={isMutating}
                  className="px-2"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Close</span>
                </Button>
              ) : (
                <Button variant="outline" size="md" disabled className="px-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Closed</span>
                </Button>
              )}

              <Link to={`/staff/events/${event.id}/attendees`} className="block">
                <Button variant="primary" size="md" fullWidth className="group/btn px-2">
                  <span>Roster</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
