import { ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, Ticket } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import type { TicketData } from '../features/registration'
import { formatCebuDate, formatCebuTimeRange } from '../lib/formatDate'

function readStoredTicket(code: string | undefined): TicketData | null {
  if (!code) return null
  try {
    const raw = sessionStorage.getItem(`ticket:${code.trim().toUpperCase()}`)
    return raw ? (JSON.parse(raw) as TicketData) : null
  } catch {
    return null
  }
}

export function TicketPage() {
  const { code } = useParams()
  const location = useLocation()
  const stateTicket = (location.state as { ticket?: TicketData } | null)?.ticket ?? null
  const ticket = stateTicket ?? readStoredTicket(code)

  if (!ticket) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <Alert tone="info" title="Ticket preview not cached in this tab">
          Your ticket code is <span className="font-code font-bold">{code}</span>. Full ticket
          lookup by ticket code + email will arrive in Phase 4.
        </Alert>
        <div className="mt-4">
          <Link to="/events">
            <Button variant="outline" size="md">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="mb-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          All Events
        </Link>
      </div>

      <article className="animate-modal-in overflow-hidden rounded-[24px] border border-border bg-surface shadow-dock">
        <div className="bg-brand-navy px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-cyan">
              EventRegister · Digital Pass
            </span>
            <StatusBadge tone="green" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
              {ticket.status === 'CHECKED_IN' ? 'Checked In' : 'Confirmed'}
            </StatusBadge>
          </div>
          <h1 className="mt-2 font-heading text-xl font-black text-white sm:text-2xl">
            {ticket.eventTitle}
          </h1>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/55">
              Attendee
            </p>
            <p className="mt-0.5 font-heading text-lg font-extrabold text-brand-navy">
              {ticket.attendeeName}
            </p>
            <p className="text-xs text-brand-navy/65">
              {ticket.email} · {ticket.mobile}
            </p>
          </div>

          <dl className="space-y-2.5 rounded-2xl bg-page p-4 text-sm text-brand-navy/85">
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
              <span>{ticket.eventVenue}</span>
            </div>
          </dl>

          <div className="ticket-notch-light pt-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-navy/55">
              Ticket Code
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-brand-sky bg-sky-50/70 px-5 py-3">
              <Ticket className="h-5 w-5 text-brand-primary" />
              <span className="font-code text-2xl font-bold tracking-widest text-brand-navy">
                {ticket.ticketCode}
              </span>
            </div>
            <p className="mt-3 text-xs text-brand-navy/60">
              Scannable QR code &amp; email lookup card will appear here in Phase 4.
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}
