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
      <section className="relative overflow-hidden border-b border-border py-9 sm:py-11 lg:py-14">
        <AmbientBackdrop />
        <div className="page-container relative z-10 grid grid-cols-1 items-center gap-6 md:grid-cols-12 lg:gap-8">
          <div className="animate-rise flex min-w-0 flex-col items-center text-center md:col-span-7 md:block md:text-left lg:col-span-6">
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/85 bg-white/90 px-3 py-1 text-[11px] font-bold text-brand-navy shadow-xs backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span className="truncate">Cebu Tech Events · Asia/Manila (UTC+8)</span>
            </div>

            <h1 className="font-heading mt-3.5 text-[1.625rem] font-extrabold leading-[1.14] tracking-[-0.02em] text-brand-navy sm:text-[2rem] lg:text-[2.25rem]">
              Register in seconds.
              <br />
              <span className="bg-gradient-to-r from-brand-primary to-[#5B8EFF] bg-clip-text text-transparent">
                Check in at the door.
              </span>
            </h1>

            <p className="section-subtitle mx-auto mt-3 max-w-[336px] sm:max-w-xl md:mx-0">
              Reserve your free seat at Cebu developer meetups, workshops, and startup nights with
              an instant QR boarding pass ready for entrance check-in.
            </p>

            {/* Symmetrical CTAs: centered stacked grid on mobile, inline row on tablet/desktop */}
            <div className="mt-5 flex w-full max-w-[340px] flex-col gap-2.5 sm:mt-6 md:max-w-none md:flex-row md:flex-wrap md:items-center md:gap-2">
              <a href="#events" className="block md:w-auto">
                <Button
                  size="lg"
                  fullWidth
                  className="min-h-[42px] text-[13px] font-bold md:min-h-0 md:h-[var(--control-h)] md:w-auto md:px-4 md:text-sm"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              </a>
              <div className="grid grid-cols-2 gap-2 md:contents">
                <Link to="/lookup" className="block">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    className="min-h-[38px] bg-white/95 text-xs md:min-h-0 md:h-[var(--control-h)] md:w-auto md:px-4"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                    <span>Find My Ticket</span>
                  </Button>
                </Link>
                <Link to="/how-it-works" className="block">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    className="min-h-[38px] bg-white/85 text-xs md:min-h-0 md:h-[var(--control-h)] md:w-auto md:px-3.5"
                  >
                    <PlayCircle className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                    <span className="md:hidden">How It Works</span>
                    <span className="hidden md:inline">Interactive Tutorial</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Live Quick-Metrics: clean balanced strip on phones, 3 cards on >=sm */}
            <dl className="mx-auto mt-6 grid w-full max-w-[340px] grid-cols-3 divide-x divide-border/75 rounded-[var(--radius-card)] border border-white/90 bg-white/90 shadow-card backdrop-blur-md sm:mt-6 sm:max-w-md sm:gap-2.5 sm:divide-x-0 sm:border-0 sm:bg-transparent sm:shadow-none sm:backdrop-blur-none md:mx-0">
              <div className="px-2 py-3 text-center sm:rounded-[var(--radius-card)] sm:border sm:border-white/90 sm:bg-white/90 sm:p-3 sm:text-left sm:shadow-card sm:backdrop-blur-md">
                <div className="flex items-center justify-center gap-1 sm:justify-between">
                  <dd className="font-heading text-base font-extrabold leading-none tabular-nums text-brand-navy">
                    {isLoading ? '—' : upcomingCount}
                  </dd>
                  <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-50 text-brand-primary sm:flex">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </span>
                </div>
                <dt className="mt-1 text-[11px] font-bold text-brand-navy/75 sm:mt-1.5">
                  Upcoming
                </dt>
              </div>

              <div className="bg-sky-50/75 px-2 py-3 text-center sm:rounded-[var(--radius-card)] sm:border sm:border-brand-sky sm:bg-sky-50/95 sm:p-3 sm:text-left sm:shadow-card sm:backdrop-blur-md">
                <div className="flex items-center justify-center gap-1 sm:justify-between">
                  <dd className="font-heading text-base font-extrabold leading-none tabular-nums text-brand-primary">
                    {isLoading ? '—' : totalOpenSeats}
                  </dd>
                  <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-brand-primary shadow-2xs sm:flex">
                    <Users className="h-3.5 w-3.5" />
                  </span>
                </div>
                <dt className="mt-1 text-[11px] font-bold text-brand-primary sm:mt-1.5">
                  Open Seats
                </dt>
              </div>

              <div className="px-2 py-3 text-center sm:rounded-[var(--radius-card)] sm:border sm:border-white/90 sm:bg-white/90 sm:p-3 sm:text-left sm:shadow-card sm:backdrop-blur-md">
                <div className="flex items-center justify-center gap-1 sm:justify-between">
                  <dd className="font-heading text-base font-extrabold leading-none text-brand-navy">
                    Free
                  </dd>
                  <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-50 text-brand-primary sm:flex">
                    <Gift className="h-3.5 w-3.5" />
                  </span>
                </div>
                <dt className="mt-1 text-[11px] font-bold text-brand-navy/75 sm:mt-1.5">
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
          <div className="mb-3 text-center md:text-left">
            <p className="section-eyebrow">Live Directory</p>
            <div className="mt-0.5 md:flex md:items-baseline md:justify-between md:gap-2">
              <h2 className="heading-section font-heading font-extrabold text-brand-navy">
                Events in Cebu
              </h2>
              <Link
                to="/events"
                className="hidden h-7 shrink-0 items-center gap-1 text-xs font-bold text-brand-primary transition-colors hover:text-brand-primary-hover md:inline-flex"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="section-subtitle mt-0.5">
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
            flatMobile
            className="mb-3"
          />

          <EventList
            events={filteredEvents}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
            onResetFilters={search || tab !== 'all' ? resetFilters : undefined}
          />

          <div className="mt-2.5 flex justify-center md:hidden">
            <Link
              to="/events"
              className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-white px-3.5 text-xs font-bold text-brand-primary shadow-2xs transition-colors hover:border-brand-primary/40"
            >
              <span>View all events</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Interactive Animated Tutorial Studio (Attendee + Door Staff) */}
      <InteractiveTutorial />

      {/* 6. Dual Action Banner (matching light-sky cards across mobile & desktop) */}
      <section className="bg-page py-4 sm:py-8">
        <div className="page-container grid grid-cols-2 gap-2 sm:gap-4">
          <div className="flex flex-col justify-between gap-2 rounded-[var(--radius-card)] border border-brand-sky bg-sky-50/80 p-2.5 shadow-card sm:p-4 md:flex-row md:items-center">
            <div className="min-w-0">
              <p className="section-eyebrow">For Attendees</p>
              <h3 className="heading-card mt-0.5 font-heading font-extrabold text-brand-navy">
                Already registered?
              </h3>
              <p className="mt-0.5 text-[11px] leading-snug text-brand-navy/75 sm:text-xs sm:leading-relaxed md:text-sm">
                Open your pass with code &amp; email.
              </p>
            </div>
            <Link to="/lookup" className="w-full shrink-0 md:w-auto">
              <Button variant="outline" size="sm" fullWidth className="bg-white md:w-auto">
                <Search className="h-3 w-3 text-brand-primary sm:h-3.5 sm:w-3.5" />
                <span className="md:hidden">Find Ticket</span>
                <span className="hidden md:inline">Find My Ticket</span>
              </Button>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-2 rounded-[var(--radius-card)] border border-brand-sky bg-sky-50/80 p-2.5 shadow-card sm:p-4 md:flex-row md:items-center">
            <div className="min-w-0">
              <p className="section-eyebrow">For Door Staff</p>
              <h3 className="heading-card mt-0.5 font-heading font-extrabold text-brand-navy">
                Managing check-in?
              </h3>
              <p className="mt-0.5 text-[11px] leading-snug text-brand-navy/75 sm:text-xs sm:leading-relaxed md:text-sm">
                Sign in to scan passes at the door.
              </p>
            </div>
            <Link to="/staff/login" className="w-full shrink-0 md:w-auto">
              <Button variant="outline" size="sm" fullWidth className="bg-white md:w-auto">
                <ShieldCheck className="h-3 w-3 text-brand-primary sm:h-3.5 sm:w-3.5" />
                <span className="md:hidden">Sign In</span>
                <span className="hidden md:inline">Staff Sign In</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
