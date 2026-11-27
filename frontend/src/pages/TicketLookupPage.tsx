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
      <div className="page-container py-4 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
            <Link
              to="/events"
              className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline sm:min-h-[44px] sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Events</span>
            </Link>

            <Button variant="outline" size="sm" onClick={() => setTicket(null)}>
              <Search className="h-3.5 w-3.5 text-brand-primary" />
              <span>Look up another ticket</span>
            </Button>
          </div>

          <TicketCard ticket={ticket} onTicketUpdated={setTicket} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="bg-sky-header border-b border-brand-sky/80 py-3 sm:py-6">
        <div className="page-container text-center">
          <div className="mx-auto max-w-lg">
            <StatusBadge tone="blue" icon={<Ticket className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}>
              Public Ticket Retrieval
            </StatusBadge>
            <h1 className="heading-hero mt-1.5 text-balance font-heading font-extrabold text-brand-navy sm:mt-2">
              Find My Ticket
            </h1>
            <p className="section-subtitle mt-0.5 text-balance sm:mt-1">
              Enter your ticket code and registered email to open your QR pass anytime.
            </p>
          </div>
        </div>
      </section>

      <section className="page-container py-3.5 sm:py-7">
        <div className="mx-auto max-w-md">
          <LookupForm onFound={setTicket} />
        </div>
      </section>
    </div>
  )
}
