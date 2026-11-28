import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/StatusBadge'
import { FloatingCubeAccent, SpotsLeft, useEvent } from '../features/events'
import {
  formatCebuDate,
  formatCebuTimeRange,
  isTodayInManila,
} from '../lib/formatDate'

export function EventDetailsPage() {
  const { id } = useParams()
  const { data: event, isLoading, isError, error } = useEvent(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Spinner label="Loading event details..." />
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
          {error instanceof Error ? error.message : 'This event could not be loaded.'}
        </Alert>
      </div>
    )
  }

  const happeningToday = !event.ended && isTodayInManila(event.startsAt, event.endsAt)

  return (
    <div className="page-container py-3.5 sm:py-8">
      <div className="mb-2 sm:mb-3">
        <Link
          to="/events"
          className="inline-flex h-8 items-center gap-1.5 text-xs font-bold text-brand-primary transition-colors hover:text-brand-primary-hover sm:h-10 sm:text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>All Events</span>
        </Link>
      </div>

      {/* Unified Master Event Card */}
      <article className="animate-rise overflow-hidden rounded-[var(--radius-card)] border border-brand-sky/80 bg-surface shadow-dock">
        {/* Card Banner Header */}
        <header className="relative overflow-hidden bg-hero-blue px-3 py-3 text-white sm:px-6 sm:py-6">
          <div className="bg-hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="relative flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {event.ended ? (
                  <StatusBadge tone="neutral" icon={<Clock className="h-3.5 w-3.5" />}>
                    Ended
                  </StatusBadge>
                ) : event.full ? (
                  <StatusBadge tone="amber" icon={<Clock className="h-3.5 w-3.5" />}>
                    Waitlist Open
                  </StatusBadge>
                ) : happeningToday ? (
                  <StatusBadge tone="blue" pulse icon={<CalendarCheck2 className="h-3.5 w-3.5" />}>
                    Happening Today
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="green" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                    Registration Open
                  </StatusBadge>
                )}

                <span className="font-code rounded-full border border-white/25 bg-white/12 px-2.5 py-0.5 text-[11px] font-semibold text-brand-sky backdrop-blur-sm">
                  Prefix: {event.codePrefix}
                </span>

                <span className="rounded-full border border-white/25 bg-white/12 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  Free Admission
                </span>
              </div>

              <h1 className="heading-hero mt-2.5 font-heading font-extrabold text-white">
                {event.title}
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs font-medium text-brand-sky/95">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
                  <span>{formatCebuDate(event.startsAt)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
                  <span>{formatCebuTimeRange(event.startsAt, event.endsAt)} (Cebu time)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
                  <span>{event.venue}</span>
                </span>
              </div>
            </div>

            <FloatingCubeAccent />
          </div>
        </header>

        {/* Split Card Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Wing: Schedule Strip (shown on >=sm to avoid duplicating header strip on mobile) + About + Door Check-In */}
          <div className="space-y-3 p-3 sm:space-y-4 sm:p-6 lg:col-span-7">
            <div className="hidden grid-cols-1 divide-y divide-border/80 rounded-[var(--radius-card)] border border-border/80 bg-page sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-primary">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Date in Cebu</span>
                </div>
                <p className="mt-0.5 text-xs font-bold text-brand-navy">
                  {formatCebuDate(event.startsAt)}
                </p>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-primary">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Time (12h PHT)</span>
                </div>
                <p className="mt-0.5 text-xs font-bold text-brand-navy">
                  {formatCebuTimeRange(event.startsAt, event.endsAt)}
                </p>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-primary">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>Venue</span>
                </div>
                <p className="mt-0.5 text-xs font-bold text-brand-navy">{event.venue}</p>
              </div>
            </div>

            <div>
              <h2 className="heading-card font-heading font-bold text-brand-navy">
                About this event
              </h2>
              <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-brand-navy/80 sm:text-sm">
                {event.description}
              </p>
            </div>

            <div className="border-t border-border/80 pt-4">
              <h2 className="font-heading text-sm font-bold text-brand-navy">
                What to expect at the door
              </h2>
              <ul className="mt-2.5 space-y-2.5 text-xs text-brand-navy/80">
                <li className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-brand-primary">
                    <QrCode className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy">Mobile QR Ticket</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/70">
                      Show your QR code or ticket code ({event.codePrefix}-XXXXXX) on your phone
                      screen at check-in.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-brand-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy">Event-Day Verification</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/70">
                      Door check-in opens on {formatCebuDate(event.startsAt)} (Asia/Manila time).
                      Each ticket checks in once.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Wing: Integrated Registration Stub */}
          <aside className="flex flex-col justify-between gap-3 border-t border-dashed border-border bg-page/75 p-3 sm:gap-4 sm:p-6 lg:col-span-5 lg:border-l lg:border-t-0">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-primary sm:text-[11px]">
                  Registration Pass
                </span>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10.5px] font-bold text-brand-navy sm:px-2.5 sm:text-[11px]">
                  Free
                </span>
              </div>

              <div className="mt-2.5 rounded-[var(--radius-card)] border border-border/80 bg-surface p-2.5 shadow-xs sm:mt-3 sm:p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand-navy/75 sm:mb-2 sm:text-xs">
                  <Users className="h-3.5 w-3.5 text-brand-primary" />
                  <span>
                    {event.registeredCount} registered · {event.capacity} max capacity
                  </span>
                </div>
                <SpotsLeft event={event} compact />
              </div>

              <div className="ticket-notch-light my-3 sm:my-4" />

              <div className="space-y-2 sm:space-y-2.5">
                {event.ended ? (
                  <Alert tone="info" title="This event has ended">
                    Registration is closed for past events.
                  </Alert>
                ) : event.full ? (
                  <>
                    <Alert tone="warning" title="Event is Full — Join Waitlist">
                      All {event.capacity} spots are claimed. Join the waitlist to be queued in
                      order if a spot opens up.
                    </Alert>
                    <Link to={`/events/${event.id}/register`} className="block">
                      <Button variant="primary" size="md" fullWidth>
                        <span>Join Waitlist</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link to={`/events/${event.id}/register`} className="block">
                    <Button variant="primary" size="md" fullWidth>
                      <span>Register for Free</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="border-t border-border/80 pt-3 text-center sm:pt-4">
              <Link
                to="/lookup"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary transition-colors hover:text-brand-primary-hover hover:underline"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Already registered? Find my ticket →</span>
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </div>
  )
}
