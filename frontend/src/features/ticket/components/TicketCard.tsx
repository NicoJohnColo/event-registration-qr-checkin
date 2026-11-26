import { Calendar, CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { StatusBadge, type BadgeTone } from '../../../components/ui/StatusBadge'
import { formatCebuDate, formatCebuDateTime, formatCebuTimeRange } from '../../../lib/formatDate'
import type { TicketData } from '../types'
import { TicketCancelControl } from './TicketCancelControl'
import { TicketQR } from './TicketQR'

interface TicketCardProps {
  ticket: TicketData
  onTicketUpdated?: (updated: TicketData) => void
}

function getTicketBadgeConfig(ticket: TicketData): {
  tone: BadgeTone
  label: string
  icon: typeof CheckCircle2
} {
  switch (ticket.status) {
    case 'CHECKED_IN':
      return { tone: 'blue', label: 'Checked In', icon: CheckCircle2 }
    case 'WAITLISTED':
      return {
        tone: 'amber',
        label: ticket.waitlistPosition ? `Waitlist #${ticket.waitlistPosition}` : 'Waitlisted',
        icon: Clock,
      }
    case 'CANCELLED':
      return { tone: 'red', label: 'Cancelled', icon: XCircle }
    case 'CONFIRMED':
    default:
      return { tone: 'green', label: 'Confirmed', icon: CheckCircle2 }
  }
}

export function TicketCard({ ticket, onTicketUpdated }: TicketCardProps) {
  const badge = getTicketBadgeConfig(ticket)
  const BadgeIcon = badge.icon
  const isWaitlisted = ticket.status === 'WAITLISTED'
  const isCancelled = ticket.status === 'CANCELLED'
  const canSelfCancel = ticket.status === 'CONFIRMED' || ticket.status === 'WAITLISTED'

  const qrCaption = isCancelled
    ? 'Cancelled pass — no longer valid for door entry'
    : isWaitlisted
      ? 'Waitlist pass — requires organizer promotion before door entry'
      : 'Show this QR code at the venue entrance'

  return (
    <article className="animate-modal-in overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-dock">
      <div className="bg-brand-navy px-4 py-3 text-white sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-cyan">
            EventRegister · Digital Pass
          </span>
          <StatusBadge tone={badge.tone} icon={<BadgeIcon className="h-3.5 w-3.5" />}>
            {badge.label}
          </StatusBadge>
        </div>
        <h1 className="heading-card mt-1 font-heading font-extrabold text-white">
          {ticket.eventTitle}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="flex min-w-0 flex-col justify-between gap-3.5 p-4 sm:p-5 md:col-span-7">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-navy/70">
              Attendee
            </p>
            <p className="heading-card mt-0.5 font-heading font-extrabold text-brand-navy">
              {ticket.attendeeName}
            </p>
            <p className="mt-0.5 break-words text-xs text-brand-navy/75">
              {ticket.email} · {ticket.mobile}
            </p>
          </div>

          {isWaitlisted && (
            <Alert tone="warning" title={`#${ticket.waitlistPosition ?? '?'} on the waitlist`}>
              You are queued in first-come order. Waitlisted passes cannot be checked in until
              promoted by an organizer.
            </Alert>
          )}

          {isCancelled && (
            <Alert tone="error" title="Registration Cancelled">
              {ticket.cancelledAt
                ? `Cancelled on ${formatCebuDateTime(ticket.cancelledAt)} (Cebu time). `
                : ''}
              This pass is no longer valid for entry.
            </Alert>
          )}

          <dl className="space-y-1.5 rounded-[10px] bg-page p-3 text-xs text-brand-navy/85">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span className="font-semibold">{formatCebuDate(ticket.eventStartsAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span>{formatCebuTimeRange(ticket.eventStartsAt, ticket.eventEndsAt)} (Cebu time)</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span className="min-w-0 break-words">{ticket.eventVenue}</span>
            </div>
          </dl>

          {ticket.status === 'CONFIRMED' && (
            <p className="hidden text-xs text-brand-navy/70 md:block">
              Present this QR code or ticket code at the venue entrance. Each ticket checks in once.
            </p>
          )}

          {ticket.status === 'CHECKED_IN' && (
            <p className="text-xs font-semibold text-brand-navy/70">
              Checked in at the venue — already used passes cannot be cancelled.
            </p>
          )}

          {canSelfCancel && (
            <TicketCancelControl
              ticketCode={ticket.ticketCode}
              email={ticket.email}
              isWaitlisted={isWaitlisted}
              onCancelled={(updated) => onTicketUpdated?.(updated)}
            />
          )}
        </div>

        <div
          className={`flex items-center justify-center border-t border-dashed border-border bg-page/55 p-4 sm:p-5 md:col-span-5 md:border-t-0 md:border-l ${
            isCancelled ? 'opacity-65 grayscale' : ''
          }`}
        >
          <TicketQR ticketCode={ticket.ticketCode} qrPayload={ticket.qrPayload} caption={qrCaption} />
        </div>
      </div>
    </article>
  )
}
