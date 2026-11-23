import { ArrowLeft, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import {
  LookupForm,
  TicketCard,
  readCachedTicket,
  saveCachedTicket,
  type TicketData,
} from '../features/ticket'

export function TicketPage() {
  const { code } = useParams()
  const location = useLocation()
  const stateTicket = (location.state as { ticket?: TicketData } | null)?.ticket ?? null

  const [ticket, setTicket] = useState<TicketData | null>(
    () => stateTicket ?? readCachedTicket(code),
  )

  useEffect(() => {
    const resolved = stateTicket ?? readCachedTicket(code)
    if (resolved) {
      saveCachedTicket(resolved)
    }
    setTicket(resolved)
  }, [code, stateTicket])

  return (
    <div
      className={`mx-auto px-4 py-6 sm:px-6 sm:py-8 ${ticket ? 'max-w-3xl' : 'max-w-lg'}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          All Events
        </Link>

        <Link
          to="/lookup"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy/70 transition-colors hover:text-brand-primary"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Find Another Ticket</span>
        </Link>
      </div>

      {ticket ? (
        <TicketCard ticket={ticket} />
      ) : (
        <div className="space-y-4">
          <Alert tone="info" title="Verify your email to view this pass">
            For privacy, passes opened directly by link require your registered email before
            displaying attendee details and the QR code.
          </Alert>
          <LookupForm
            initialCode={code}
            onFound={(found) => setTicket(found)}
            title="Unlock QR Ticket"
            subtitle="Confirm the ticket code and your registration email below."
          />
        </div>
      )}
    </div>
  )
}
