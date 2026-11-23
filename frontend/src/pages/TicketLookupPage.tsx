import { ArrowLeft, Search, Ticket } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { LookupForm, TicketCard, type TicketData } from '../features/ticket'

export function TicketLookupPage() {
  const [ticket, setTicket] = useState<TicketData | null>(null)

  if (ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Events</span>
          </Link>

          <Button variant="outline" size="sm" onClick={() => setTicket(null)}>
            <Search className="h-3.5 w-3.5 text-brand-primary" />
            <span>Look up another ticket</span>
          </Button>
        </div>

        <TicketCard ticket={ticket} />
      </div>
    )
  }

  return (
    <div>
      <section className="bg-sky-header border-b border-brand-sky/80 py-6 sm:py-7">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <StatusBadge tone="blue" icon={<Ticket className="h-3.5 w-3.5" />}>
            Public Ticket Retrieval
          </StatusBadge>
          <h1 className="mt-2.5 font-heading text-2xl font-black text-brand-navy sm:text-3xl">
            Find My Ticket
          </h1>
          <p className="mt-1 text-sm text-brand-navy/75">
            Enter your ticket code and registered email to open your QR pass anytime.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-8">
        <LookupForm onFound={setTicket} />
      </section>
    </div>
  )
}
