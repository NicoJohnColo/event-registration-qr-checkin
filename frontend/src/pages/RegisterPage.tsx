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

  const closed = event.ended

  return (
    <div>
      <section className="bg-sky-header border-b border-brand-sky/80 py-3.5 sm:py-6">
        <div className="page-container flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to={`/events/${event.id}`}
              className="inline-flex h-8 min-h-[32px] items-center gap-1.5 text-xs font-bold text-brand-primary transition-colors hover:text-brand-primary-hover sm:h-10 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to event details</span>
            </Link>
            <p className="section-eyebrow mt-1">
              {event.full && !event.ended ? 'Waitlist Registration' : 'Free Event Registration'}
            </p>
            <h1 className="heading-hero mt-0.5 font-heading font-extrabold text-brand-navy">
              {event.title}
            </h1>
          </div>
          <FloatingCubeAccent />
        </div>
      </section>

      <section className="page-container grid grid-cols-1 gap-3 py-3.5 sm:gap-6 sm:py-8 lg:grid-cols-12">
        {/* Mobile Compact Event Context Strip (above the form so guests never scroll past submit to verify event details) */}
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-2.5 shadow-card lg:hidden">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] font-semibold text-brand-navy/85">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0 text-brand-primary" />
              <span>{formatCebuDate(event.startsAt)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0 text-brand-primary" />
              <span>{formatCebuTimeRange(event.startsAt, event.endsAt)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-brand-primary" />
              <span>{event.venue}</span>
            </span>
          </div>
          <div className="mt-2 border-t border-border/70 pt-1.5">
            <SpotsLeft event={event} compact />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="animate-rise rounded-[var(--radius-card)] border border-border bg-surface p-3 shadow-card sm:p-5">
            <h2 className="heading-card font-heading font-extrabold text-brand-navy">
              Attendee Details
            </h2>
            <p className="section-subtitle mt-0.5">
              One registration per email for this event. Your ticket code is generated immediately.
            </p>

            <div className="mt-4">
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
              ) : (
                <div className="space-y-4">
                  {event.full && (
                    <Alert tone="warning" title="Event is full — joining waitlist">
                      All {event.capacity} spots are filled. Submitting places you on the waitlist
                      in order; you can enter once promoted by an organizer.
                    </Alert>
                  )}
                  <RegistrationForm
                    eventId={event.id}
                    isWaitlist={event.full}
                    onSuccess={(ticket) => {
                      saveCachedTicket(ticket)
                      navigate(`/ticket/${encodeURIComponent(ticket.ticketCode)}`, {
                        state: { ticket },
                      })
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-20 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-card sm:p-5">
            <h3 className="heading-card font-heading font-extrabold text-brand-navy">
              Event Summary
            </h3>

            <dl className="mt-3 space-y-2 text-xs text-brand-navy/80 sm:text-sm">
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
