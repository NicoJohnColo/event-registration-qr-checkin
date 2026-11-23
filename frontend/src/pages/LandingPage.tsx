import {
  ArrowRight,
  CalendarDays,
  Gift,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AmbientBackdrop } from '../components/ui/AmbientBackdrop'
import { Button } from '../components/ui/Button'
import {
  EventList,
  EventSearchToolbar,
  HeroCubeScene,
  InteractiveTutorial,
  useEvents,
  type EventFilterTab,
  type HeroPassPreview,
} from '../features/events'
import { formatCebuDate, formatCebuTimeRange } from '../lib/formatDate'

export function LandingPage() {
  const { data: events = [], isLoading, isError, error, refetch } = useEvents()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<EventFilterTab>('all')

  const upcomingCount = useMemo(() => events.filter((e) => !e.ended).length, [events])
  const openCount = useMemo(() => events.filter((e) => !e.ended && !e.full).length, [events])
  const endedCount = useMemo(() => events.filter((e) => e.ended).length, [events])
  const totalOpenSeats = useMemo(
    () => events.filter((e) => !e.ended).reduce((sum, e) => sum + e.spotsLeft, 0),
    [events],
  )

  const featuredEvent = useMemo(
    () => events.find((e) => !e.ended && !e.full) ?? events.find((e) => !e.ended) ?? events[0],
    [events],
  )

  const heroPreview: HeroPassPreview = useMemo(
    () =>
      featuredEvent
        ? {
            eventId: featuredEvent.id,
            title: featuredEvent.title,
            scheduleLabel: `${formatCebuDate(featuredEvent.startsAt)} · ${formatCebuTimeRange(featuredEvent.startsAt, featuredEvent.endsAt)}`,
            venue: featuredEvent.venue,
            codeSample: `${featuredEvent.codePrefix}-7K3P9Q`,
            spotsLabel: featuredEvent.full
              ? `Full · 0 of ${featuredEvent.capacity} spots left`
              : `${featuredEvent.spotsLeft} of ${featuredEvent.capacity} spots left`,
          }
        : {
            title: 'Cebu Dev Meetup 2026',
            scheduleLabel: 'Today · 8:00 AM – 10:00 PM',
            venue: 'Ayala Center Cebu, Function Room 2',
            codeSample: 'CDM-7K3P9Q',
            spotsLabel: '27 of 30 spots left',
          },
    [featuredEvent],
  )

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase()
    return events.filter((event) => {
      if (tab === 'upcoming' && event.ended) return false
      if (tab === 'open' && (event.ended || event.full)) return false
      if (tab === 'ended' && !event.ended) return false
      if (!q) return true
      return (
        event.title.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q)
      )
    })
  }, [events, search, tab])

  const resetFilters = () => {
    setSearch('')
    setTab('all')
  }

  return (
    <div>
      {/* 1. Hero Banner with 3D Isometric Cube Stage */}
      <section className="relative overflow-hidden border-b border-border py-5 sm:py-8 lg:py-10">
        <AmbientBackdrop />
        <div className="page-container relative z-10 grid grid-cols-1 items-center gap-6 md:grid-cols-12 lg:gap-8">
          <div className="animate-rise min-w-0 md:col-span-7 lg:col-span-6">
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/85 bg-white/85 px-2.5 py-0.5 text-[10.5px] font-bold text-brand-navy shadow-xs backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3 w-3 shrink-0 text-brand-primary" />
              <span className="truncate">Cebu Tech Events · Asia/Manila (UTC+8)</span>
            </div>

            <h1 className="heading-hero mt-2.5 font-heading font-black text-brand-navy sm:mt-3">
              Register in seconds.
              <br />
              <span className="bg-gradient-to-r from-brand-primary to-[#5B8EFF] bg-clip-text text-transparent">
                Check in at the door.
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-relaxed text-brand-navy/80 sm:text-sm">
              Reserve your free seat at Cebu developer meetups, workshops, and startup nights. Get
              an instant QR boarding pass ready for fast venue entry.
            </p>

            {/* Mobile: sleek 2-column primary/secondary CTAs + compact tutorial pill below */}
            <div className="mt-3.5 space-y-2 sm:mt-4 sm:flex sm:flex-wrap sm:items-center sm:gap-2 sm:space-y-0">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <a href="#events" className="block">
                  <Button size="sm" className="w-full sm:h-[var(--control-h)] sm:px-4">
                    <span>Explore Events</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </Button>
                </a>
                <Link to="/lookup" className="block">
                  <Button variant="outline" size="sm" className="w-full bg-white/95 sm:h-[var(--control-h)] sm:px-4">
                    <Search className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                    <span>Find My Ticket</span>
                  </Button>
                </Link>
              </div>
              <Link
                to="/how-it-works"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/85 bg-white/75 px-3 text-[11px] font-bold text-brand-navy backdrop-blur-sm transition-colors hover:bg-white hover:text-brand-primary sm:h-[var(--control-h)] sm:px-3.5 sm:text-xs"
              >
                <PlayCircle className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                <span>Interactive Tutorial</span>
              </Link>
            </div>

            {/* Live Quick-Metrics Cards: always a compact 3-column horizontal strip */}
            <dl className="mt-4 grid max-w-md grid-cols-3 gap-2 sm:mt-5 sm:gap-2.5">
              <div className="rounded-[var(--radius-card)] border border-white/90 bg-white/90 p-2.5 shadow-card backdrop-blur-md sm:p-3">
                <div className="flex items-center justify-between gap-1">
                  <dd className="font-heading text-sm font-extrabold leading-none tabular-nums text-brand-navy sm:text-base">
                    {isLoading ? '—' : upcomingCount}
                  </dd>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-50 text-brand-primary">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </span>
                </div>
                <dt className="mt-1.5 text-[11px] font-bold text-brand-navy/75">
                  Upcoming
                </dt>
              </div>

              <div className="rounded-[var(--radius-card)] border border-brand-sky bg-sky-50/95 p-2.5 shadow-card backdrop-blur-md sm:p-3">
                <div className="flex items-center justify-between gap-1">
                  <dd className="font-heading text-sm font-extrabold leading-none tabular-nums text-brand-primary sm:text-base">
                    {isLoading ? '—' : totalOpenSeats}
                  </dd>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-brand-primary shadow-2xs">
                    <Users className="h-3.5 w-3.5" />
                  </span>
                </div>
                <dt className="mt-1.5 text-[11px] font-bold text-brand-primary">
                  Open Seats
                </dt>
              </div>

              <div className="rounded-[var(--radius-card)] border border-white/90 bg-white/90 p-2.5 shadow-card backdrop-blur-md sm:p-3">
                <div className="flex items-center justify-between gap-1">
                  <dd className="font-heading text-sm font-extrabold leading-none text-brand-navy sm:text-base">
                    Free
                  </dd>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-50 text-brand-primary">
                    <Gift className="h-3.5 w-3.5" />
                  </span>
                </div>
                <dt className="mt-1.5 text-[11px] font-bold text-brand-navy/75">
                  Admission
                </dt>
              </div>
            </dl>
          </div>

          {/* 3D Isometric Translucent Cube Stage + Live Featured Pass (Tablet/Desktop ≥768px) */}
          <div className="animate-rise delay-150 hidden min-w-0 md:col-span-5 md:block lg:col-span-6">
            <HeroCubeScene preview={heroPreview} />
          </div>
        </div>
      </section>

      {/* 2. Unified Events Directory & Search */}
      <section id="events" className="scroll-mt-14 bg-page py-5 sm:py-8">
        <div className="page-container">
          <div className="mb-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="heading-section font-heading font-extrabold text-brand-navy">
                Events in Cebu
              </h2>
              <Link
                to="/events"
                className="inline-flex h-7 shrink-0 items-center gap-1 text-xs font-bold text-brand-primary transition-colors hover:text-brand-primary-hover"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="mt-0.5 break-words whitespace-normal text-[11px] leading-relaxed text-brand-navy/75 sm:text-xs">
              Cebu local time (UTC+8, 12-hour) · Live seat availability
            </p>
          </div>

          <EventSearchToolbar
            search={search}
            onSearchChange={setSearch}
            filter={tab}
            onFilterChange={setTab}
            counts={{
              all: events.length,
              upcoming: upcomingCount,
              open: openCount,
              ended: endedCount,
            }}
            totalMatching={filteredEvents.length}
            onReset={resetFilters}
            className="mb-3.5"
          />

          <EventList
            events={filteredEvents}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
            onResetFilters={search || tab !== 'all' ? resetFilters : undefined}
          />
        </div>
      </section>

      {/* 5. Interactive Animated Tutorial Studio (Attendee + Door Staff) */}
      <InteractiveTutorial />

      {/* 6. Dual Action Banner */}
      <section className="bg-page py-5 sm:py-8">
        <div className="page-container grid grid-cols-1 gap-2.5 sm:gap-4 md:grid-cols-2">
          <div className="flex flex-col justify-between gap-2.5 rounded-[var(--radius-card)] border border-border bg-surface p-3.5 shadow-card sm:flex-row sm:items-center sm:p-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                For Attendees
              </p>
              <h3 className="heading-card mt-0.5 font-heading font-extrabold text-brand-navy">
                Already registered?
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/75">
                Retrieve your QR pass anytime using your ticket code and email.
              </p>
            </div>
            <Link to="/lookup" className="w-full shrink-0 sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                <Search className="h-3.5 w-3.5 text-brand-primary" />
                <span>Find My Ticket</span>
              </Button>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-2.5 rounded-[var(--radius-card)] border border-brand-navy/10 bg-brand-navy p-3.5 text-white shadow-card sm:flex-row sm:items-center sm:p-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                For Door Staff
              </p>
              <h3 className="heading-card mt-0.5 font-heading font-extrabold text-white">
                Managing check-in?
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-white/80">
                Sign in to scan ticket codes and view live attendee counts.
              </p>
            </div>
            <Link to="/staff/login" className="w-full shrink-0 sm:w-auto">
              <Button
                size="sm"
                className="w-full !bg-white !bg-none !text-brand-navy hover:!bg-brand-sky sm:w-auto"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
                <span>Staff Sign In</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
