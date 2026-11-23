import { ArrowLeft, Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { FloatingCubeAccent, SpotsLeft, useEvent } from '../features/events'
import { RegistrationForm } from '../features/registration'
import { saveCachedTicket } from '../features/ticket'
import { formatCebuDate, formatCebuTimeRange } from '../lib/formatDate'

export function RegisterPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: event, isLoading, isError, error } = useEvent(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Spinner label="Loading registration form..." />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          to="/events"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <Alert tone="error" title="Event not found">
          {error instanceof Error ? error.message : 'Could not load this event.'}
        </Alert>
      </div>
    )
  }

  const closed = event.ended || event.full

  return (
    <div>
      <section className="bg-sky-header border-b border-brand-sky/80 py-8 sm:py-10">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-6 px-4 sm:px-6">
          <div>
            <Link
              to={`/events/${event.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to event details
            </Link>
            <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">
              Free Event Registration
            </p>
            <h1 className="mt-1 font-heading text-2xl font-black text-brand-navy sm:text-3xl">
              {event.title}
            </h1>
          </div>
          <FloatingCubeAccent />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="animate-rise rounded-[22px] border border-border bg-surface p-6 shadow-card sm:p-8">
            <h2 className="font-heading text-xl font-extrabold text-brand-navy">
              Attendee Details
            </h2>
            <p className="mt-1 text-sm text-brand-navy/70">
              One registration per email for this event. Your ticket code is generated immediately.
            </p>

            <div className="mt-6">
              {event.ended ? (
                <div className="space-y-4">
                  <Alert tone="info" title="Event has ended">
                    Registration is closed because this event has already ended.
                  </Alert>
                  <Link to="/events" className="block">
                    <Button variant="outline" size="md" fullWidth>
                      Browse upcoming events
                    </Button>
                  </Link>
                </div>
              ) : event.full ? (
                <div className="space-y-4">
                  <Alert tone="error" title="Event is Full">
                    All {event.capacity} spots have been claimed.
                  </Alert>
                  <Button variant="primary" size="lg" fullWidth disabled>
                    Full — Registration Closed
                  </Button>
                </div>
              ) : (
                <RegistrationForm
                  eventId={event.id}
                  onSuccess={(ticket) => {
                    saveCachedTicket(ticket)
                    navigate(`/ticket/${encodeURIComponent(ticket.ticketCode)}`, {
                      state: { ticket },
                    })
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-[22px] border border-border bg-surface p-6 shadow-card">
            <h3 className="font-heading text-base font-extrabold text-brand-navy">
              Event Summary
            </h3>

            <dl className="mt-4 space-y-3 text-sm text-brand-navy/80">
              <div className="flex items-start gap-2.5">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <span className="font-semibold">{formatCebuDate(event.startsAt)}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <span>{formatCebuTimeRange(event.startsAt, event.endsAt)} (Cebu time)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <span>{event.venue}</span>
              </div>
            </dl>

            <div className="mt-5 rounded-2xl bg-page p-4">
              <SpotsLeft event={event} />
            </div>

            {!closed && (
              <p className="mt-4 flex items-center gap-2 text-xs text-brand-navy/65">
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-primary" />
                <span>Capacity is locked and re-verified on the server when you submit.</span>
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
