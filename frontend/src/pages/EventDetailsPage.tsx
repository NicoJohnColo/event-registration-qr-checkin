import {
  ArrowLeft,
  ArrowRight,
  Ban,
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
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-5">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary transition-colors hover:text-brand-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>All Events</span>
        </Link>
      </div>

      {/* Unified Master Event Card */}
      <article className="animate-rise overflow-hidden rounded-[26px] border border-brand-sky/80 bg-surface shadow-dock">
        {/* Card Banner Header */}
        <header className="relative overflow-hidden bg-hero-blue px-5 py-6 text-white sm:px-8 sm:py-8">
          <div className="bg-hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="relative flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {event.ended ? (
                  <StatusBadge tone="neutral" icon={<Clock className="h-3.5 w-3.5" />}>
                    Ended
                  </StatusBadge>
                ) : event.full ? (
                  <StatusBadge tone="red" icon={<Ban className="h-3.5 w-3.5" />}>
                    Full
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

                <span className="font-code rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold text-brand-sky backdrop-blur-sm">
                  Prefix: {event.codePrefix}
                </span>

                <span className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  Free Admission
                </span>
              </div>

              <h1 className="mt-4 font-heading text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                {event.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-brand-sky/95 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0 text-brand-cyan" />
                  <span>{formatCebuDate(event.startsAt)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0 text-brand-cyan" />
                  <span>{formatCebuTimeRange(event.startsAt, event.endsAt)} (Cebu time)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-brand-cyan" />
                  <span>{event.venue}</span>
                </span>
              </div>
            </div>

            <FloatingCubeAccent />
          </div>
        </header>

        {/* Split Card Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Wing: Schedule Strip + About + Door Check-In */}
          <div className="space-y-6 p-5 sm:p-8 lg:col-span-7">
            <div className="grid grid-cols-1 divide-y divide-border/80 rounded-2xl border border-border/80 bg-page sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Date in Cebu</span>
                </div>
                <p className="mt-1 text-sm font-extrabold text-brand-navy">
                  {formatCebuDate(event.startsAt)}
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Time (12h PHT)</span>
                </div>
                <p className="mt-1 text-sm font-extrabold text-brand-navy">
                  {formatCebuTimeRange(event.startsAt, event.endsAt)}
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>Venue</span>
                </div>
                <p className="mt-1 text-sm font-extrabold text-brand-navy">{event.venue}</p>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-lg font-extrabold text-brand-navy">
                About this event
              </h2>
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-brand-navy/80 sm:text-base">
                {event.description}
              </p>
            </div>

            <div className="border-t border-border/80 pt-6">
              <h2 className="font-heading text-base font-extrabold text-brand-navy">
                What to expect at the door
              </h2>
              <ul className="mt-3.5 space-y-3 text-sm text-brand-navy/80">
                <li className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-brand-primary">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy">Mobile QR Ticket</p>
                    <p className="text-xs text-brand-navy/70">
                      Show your QR code or ticket code ({event.codePrefix}-XXXXXX) on your phone
                      screen at check-in.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-brand-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy">Event-Day Verification</p>
                    <p className="text-xs text-brand-navy/70">
                      Door check-in opens on {formatCebuDate(event.startsAt)} (Asia/Manila time).
                      Each ticket checks in once.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Wing: Integrated Registration Stub */}
          <aside className="flex flex-col justify-between gap-6 border-t border-dashed border-border bg-page/75 p-5 sm:p-8 lg:col-span-5 lg:border-l lg:border-t-0">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-primary">
                  Registration Pass
                </span>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-brand-navy">
                  Free
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-border/80 bg-surface p-4 shadow-xs">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-brand-navy/75">
                  <Users className="h-4 w-4 text-brand-primary" />
                  <span>
                    {event.registeredCount} registered · {event.capacity} max capacity
                  </span>
                </div>
                <SpotsLeft event={event} />
              </div>

              <div className="ticket-notch-light my-6" />

              <div className="space-y-3">
                {event.ended ? (
                  <Alert tone="info" title="This event has ended">
                    Registration is closed for past events.
                  </Alert>
                ) : event.full ? (
                  <>
                    <Alert tone="error" title="Event is Full">
                      All {event.capacity} spots have been claimed.
                    </Alert>
                    <Button variant="primary" size="lg" fullWidth disabled>
                      Full — Registration Closed
                    </Button>
                  </>
                ) : (
                  <Link to={`/events/${event.id}/register`} className="block">
                    <Button variant="primary" size="lg" fullWidth>
                      <span>Register for Free</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="border-t border-border/80 pt-4 text-center">
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
