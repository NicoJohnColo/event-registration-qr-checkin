import {
  ArrowRight,
  Clock,
  Globe,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Trash2,
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
  onDeleteEvent: (event: StaffEventItem) => void
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
  onDeleteEvent,
  isMutating = false,
  animationDelayClass = '',
}: StaffEventCardProps) {
  const [pendingAction, setPendingAction] = useState<'close' | 'delete' | null>(null)
  const dateParts = getCebuDateParts(event.startsAt)
  const statusMeta = getStatusMeta(event.status)

  const registeredTotal = event.confirmedCount + event.checkedInCount
  const totalPassCount =
    event.confirmedCount + event.checkedInCount + event.waitlistCount + event.cancelledCount
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

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        {/* Top Row: Date Box + Prefix + Status + Delete Shortcut */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-[7px] border text-center sm:h-9 sm:w-9 sm:rounded-[9px] ${
                event.ended || event.status === 'CLOSED'
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
                {event.ended && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-600 sm:px-2 sm:text-[10.5px]">
                    Ended
                  </span>
                )}
              </div>
            </div>
          </div>

          {event.status !== 'CLOSED' && (
            <button
              type="button"
              onClick={() => setPendingAction('delete')}
              disabled={isMutating}
              aria-label={`Delete ${event.title}`}
              title="Delete event"
              className="inline-flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-[6px] border border-border/80 bg-white text-brand-navy/60 transition-colors hover:border-status-red/50 hover:bg-red-50 hover:text-status-red focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-status-red/20 disabled:opacity-45 sm:h-7 sm:w-7 sm:rounded-[8px]"
            >
              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          )}
        </div>

        {/* Title & Description */}
        <h2
          title={event.title}
          className="heading-card font-heading mt-1.5 truncate font-extrabold leading-snug text-brand-navy sm:mt-2"
        >
          {event.title}
        </h2>
        {event.description && (
          <p className="mt-0.5 truncate text-[10.5px] leading-snug text-brand-navy/70 sm:text-xs">
            {event.description}
          </p>
        )}

        {/* Schedule & Venue */}
        <dl className="mt-1.5 space-y-0.5 text-[10.5px] text-brand-navy/80 sm:text-xs">
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

        {/* Registration Capacity Progress */}
        <div className="mt-2 border-t border-border/60 pt-1.5 sm:pt-2">
          <div className="flex items-center justify-between gap-1 text-[10.5px] sm:text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-brand-navy">
              <Users className="h-3 w-3 text-brand-primary sm:h-3.5 sm:w-3.5" />
              <span>Registered</span>
            </span>
            <span className="font-code font-extrabold tabular-nums text-brand-navy">
              {registeredTotal}/{event.capacity}{' '}
              <span className="font-bold text-brand-navy/65">({fillPct}%)</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-brand-navy/65 sm:text-[11px]">
            <span>{event.checkedInCount} checked in</span>
            {event.waitlistCount > 0 ? (
              <span className="font-bold text-status-amber">{event.waitlistCount} waitlisted</span>
            ) : (
              <span>{Math.max(0, event.capacity - registeredTotal)} left</span>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="mt-auto border-t border-border/70 pt-2">
          {pendingAction ? (
            <div className="rounded-[var(--radius-control)] border border-status-red/30 bg-red-50/90 p-2">
              <p className="text-center text-[10.5px] font-bold text-status-red sm:text-xs">
                {pendingAction === 'delete'
                  ? `Permanently delete event${totalPassCount > 0 ? ` & ${totalPassCount} pass(es)` : ''}?`
                  : 'Close event & stop registrations?'}
              </p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingAction(null)}
                  disabled={isMutating}
                  className="h-7 bg-white sm:h-8"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const action = pendingAction
                    setPendingAction(null)
                    if (action === 'delete') {
                      onDeleteEvent(event)
                    } else {
                      onCloseEvent(event)
                    }
                  }}
                  disabled={isMutating}
                  className="h-7 !bg-status-red !text-white hover:!bg-red-700 sm:h-8"
                >
                  {isMutating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : pendingAction === 'delete' ? (
                    'Confirm Delete'
                  ) : (
                    'Confirm Close'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(event)}
                disabled={isMutating}
                className="h-7 gap-1 px-1 text-[10.5px] sm:h-8 sm:gap-1.5 sm:px-2 sm:text-xs"
              >
                <Pencil className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                <span>Edit</span>
              </Button>

              {event.status === 'DRAFT' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPublish(event)}
                  disabled={isMutating}
                  className="h-7 gap-1 border-emerald-200 bg-emerald-50 px-1 text-[10.5px] text-status-green hover:bg-emerald-100 sm:h-8 sm:gap-1.5 sm:px-2 sm:text-xs"
                >
                  <Globe className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span>Publish</span>
                </Button>
              ) : event.status === 'PUBLISHED' ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingAction('close')}
                  disabled={isMutating}
                  className="h-7 gap-1 px-1 text-[10.5px] sm:h-8 sm:gap-1.5 sm:px-2 sm:text-xs"
                >
                  <Lock className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span>Close</span>
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPendingAction('delete')}
                  disabled={isMutating}
                  className="h-7 gap-1 px-1 text-[10.5px] sm:h-8 sm:gap-1.5 sm:px-2 sm:text-xs"
                >
                  <Trash2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span>Delete</span>
                </Button>
              )}

              <Link to={`/staff/events/${event.id}/attendees`} className="block">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="group/btn h-7 gap-1 px-1 text-[10.5px] sm:h-8 sm:gap-1.5 sm:px-2 sm:text-xs"
                >
                  <span>Roster</span>
                  <ArrowRight className="h-3 w-3 shrink-0 transition-transform duration-150 group-hover/btn:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
