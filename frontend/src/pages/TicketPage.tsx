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
    <div className="page-container py-2.5 sm:py-8">
      <div className={`mx-auto ${ticket ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
          <Link
            to="/events"
            className="inline-flex h-8 items-center gap-1 text-xs font-bold text-brand-primary hover:underline sm:min-h-[44px] sm:gap-1.5 sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>All Events</span>
          </Link>

          <Link
            to="/lookup"
            className="inline-flex h-8 items-center gap-1 text-xs font-bold text-brand-navy/75 transition-colors hover:text-brand-primary sm:min-h-[44px] sm:gap-1.5 sm:text-sm"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Find Another Ticket</span>
          </Link>
        </div>

        {ticket ? (
          <TicketCard ticket={ticket} onTicketUpdated={setTicket} />
        ) : (
          <div className="space-y-2.5 sm:space-y-4">
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
    </div>
  )
}
