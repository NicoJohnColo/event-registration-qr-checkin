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
    <div>
      <section className="bg-sky-header border-b border-brand-sky/80 py-10 sm:py-12">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-6 px-4 sm:px-6">
          <div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
            >
              <ArrowLeft className="h-4 w-4" />
              All Events
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
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
              <span className="font-code rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-brand-navy/75">
                Prefix: {event.codePrefix}
              </span>
            </div>

            <h1 className="mt-3 font-heading text-3xl font-black text-brand-navy sm:text-4xl">
              {event.title}
            </h1>
          </div>
          <FloatingCubeAccent />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {/* 3-Card Quick-Facts Strip */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
                <Calendar className="h-4 w-4" />
                <span>Date in Cebu</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-brand-navy">
                {formatCebuDate(event.startsAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
                <Clock className="h-4 w-4" />
                <span>Time (12h PHT)</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-brand-navy">
                {formatCebuTimeRange(event.startsAt, event.endsAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
                <MapPin className="h-4 w-4" />
                <span>Venue</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm font-bold text-brand-navy">
                {event.venue}
              </p>
            </div>
          </div>

          {/* About */}
          <div className="rounded-[20px] border border-border bg-surface p-6 shadow-card">
            <h2 className="font-heading text-lg font-bold text-brand-navy">About this event</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-brand-navy/80 sm:text-base">
              {event.description}
            </p>
          </div>

          {/* What to expect at the door */}
          <div className="rounded-[20px] border border-border bg-surface p-6 shadow-card">
            <h2 className="font-heading text-lg font-bold text-brand-navy">
              What to expect at the door
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-brand-navy/80">
              <li className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-brand-primary">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-brand-navy">Mobile QR Ticket</p>
                  <p className="text-xs text-brand-navy/70">
                    Show your ticket QR code or monospace ticket code ({event.codePrefix}-XXXXXX) on
                    your phone screen at check-in.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-brand-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-brand-navy">Event-Day Verification</p>
                  <p className="text-xs text-brand-navy/70">
                    Door check-in opens on {formatCebuDate(event.startsAt)} (Asia/Manila time).
                    Each ticket checks in once.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Sticky Boarding-Pass Booking Card */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 overflow-hidden rounded-[22px] border border-border bg-surface shadow-dock">
            <div className="bg-brand-navy px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-cyan">
                  Event Registration Pass
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
                  Free Admission
                </span>
              </div>
              <p className="mt-1 font-heading text-base font-bold text-white/95 line-clamp-1">
                {event.title}
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-2xl bg-page p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-brand-navy/75">
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

              <div className="mt-5 border-t border-border/70 pt-4 text-center">
                <Link
                  to="/lookup"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover hover:underline"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Already registered for this event? Find my ticket →</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
