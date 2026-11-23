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
    <article className="animate-modal-in overflow-hidden rounded-[24px] border border-border bg-surface shadow-dock">
      <div className="bg-brand-navy px-5 py-4 text-white sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-cyan">
            EventRegister · Digital Pass
          </span>
          <StatusBadge
            tone={checkedIn ? 'blue' : 'green'}
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          >
            {checkedIn ? 'Checked In' : 'Confirmed'}
          </StatusBadge>
        </div>
        <h1 className="mt-1.5 font-heading text-lg font-black text-white sm:text-2xl">
          {ticket.eventTitle}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="flex flex-col justify-between gap-4 p-4 sm:p-6 md:col-span-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/55">
              Attendee
            </p>
            <p className="mt-0.5 font-heading text-lg font-extrabold text-brand-navy sm:text-xl">
              {ticket.attendeeName}
            </p>
            <p className="break-words text-xs text-brand-navy/65 sm:text-sm">
              {ticket.email} · {ticket.mobile}
            </p>
          </div>

          <dl className="space-y-2 rounded-2xl bg-page p-3.5 text-sm text-brand-navy/85 sm:p-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="font-semibold">{formatCebuDate(ticket.eventStartsAt)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-brand-primary" />
              <span>{formatCebuTimeRange(ticket.eventStartsAt, ticket.eventEndsAt)} (Cebu time)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <span className="break-words">{ticket.eventVenue}</span>
            </div>
          </dl>

          <p className="hidden text-xs text-brand-navy/60 md:block">
            Present this QR code or ticket code at the venue entrance. Each ticket checks in once.
          </p>
        </div>

        <div className="flex items-center justify-center border-t border-dashed border-border bg-page/55 p-4 sm:p-6 md:col-span-5 md:border-t-0 md:border-l">
          <TicketQR ticketCode={ticket.ticketCode} />
        </div>
      </div>
    </article>
  )
}
