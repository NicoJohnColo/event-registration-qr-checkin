import { Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { formatCebuDate, formatCebuTimeRange } from '../../../lib/formatDate'
import type { TicketData } from '../types'
import { TicketQR } from './TicketQR'

interface TicketCardProps {
  ticket: TicketData
}

export function TicketCard({ ticket }: TicketCardProps) {
  const checkedIn = ticket.status === 'CHECKED_IN'

  return (
    <article className="animate-modal-in overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-dock">
      <div className="bg-brand-navy px-4 py-3 text-white sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-cyan">
            EventRegister · Digital Pass
          </span>
          <StatusBadge
            tone={checkedIn ? 'blue' : 'green'}
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          >
            {checkedIn ? 'Checked In' : 'Confirmed'}
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

          <p className="hidden text-xs text-brand-navy/70 md:block">
            Present this QR code or ticket code at the venue entrance. Each ticket checks in once.
          </p>
        </div>

        <div className="flex items-center justify-center border-t border-dashed border-border bg-page/55 p-4 sm:p-5 md:col-span-5 md:border-t-0 md:border-l">
          <TicketQR ticketCode={ticket.ticketCode} />
        </div>
      </div>
    </article>
  )
}
