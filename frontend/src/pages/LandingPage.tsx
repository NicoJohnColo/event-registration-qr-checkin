import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Layers,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SegmentedTabs } from '../components/ui/SegmentedTabs'
import { StatusBadge } from '../components/ui/StatusBadge'
import {
  EventList,
  HeroCubeScene,
  InteractiveTutorial,
  useEvents,
  type HeroPassPreview,
} from '../features/events'
import { formatCebuDate, formatCebuTimeRange, isTodayInManila } from '../lib/formatDate'

type FilterTab = 'all' | 'upcoming' | 'open' | 'ended'

export function LandingPage() {
  const { data: events = [], isLoading, isError, error, refetch } = useEvents()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')

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

  const todayEvent = useMemo(
    () => events.find((e) => !e.ended && isTodayInManila(e.startsAt, e.endsAt)),
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
      <section className="relative overflow-hidden bg-hero-blue pb-20 pt-12 text-white sm:pb-24 sm:pt-16 lg:pt-20">
        <div className="bg-hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12">
          <div className="animate-rise lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-sky backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
              <span>Cebu Tech &amp; Community Events · Asia/Manila (UTC+8)</span>
            </div>

            <h1 className="mt-5 font-heading text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[52px]">
              Register in seconds.
              <br />
              <span className="bg-gradient-to-r from-brand-sky to-brand-cyan bg-clip-text text-transparent">
                Check in at the door.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Reserve your free seat at Cebu developer meetups, workshops, and startup nights. Get
              an instant QR boarding pass ready for fast venue entry.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href="#events">
                <Button
                  size="lg"
                  className="w-full !bg-white !bg-none !text-brand-navy hover:!bg-brand-sky !shadow-xl sm:w-auto"
                >
                  <span>Explore Cebu Events</span>
                  <ArrowRight className="h-4 w-4 text-brand-primary" />
                </Button>
              </a>
              <Link to="/lookup">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full !border !border-white/30 !bg-white/10 !text-white hover:!bg-white/20 backdrop-blur-md sm:w-auto"
                >
                  <Search className="h-4 w-4" />
                  <span>Find My Ticket</span>
                </Button>
              </Link>
              <a
                href="#tutorial"
                className="inline-flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-semibold text-brand-sky transition-colors hover:text-white"
              >
                <PlayCircle className="h-4 w-4 text-brand-cyan" />
                <span>Interactive Tutorial</span>
              </a>
            </div>

            {/* Live Quick-Metrics Strip */}
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div>
                <dt className="text-xs font-medium text-white/70">Upcoming</dt>
                <dd className="font-heading mt-0.5 text-2xl font-bold text-white">
                  {isLoading ? '—' : upcomingCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-white/70">Open Seats</dt>
                <dd className="font-heading mt-0.5 text-2xl font-bold text-brand-cyan">
                  {isLoading ? '—' : totalOpenSeats}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-white/70">Admission</dt>
                <dd className="font-heading mt-0.5 text-2xl font-bold text-white">100% Free</dd>
              </div>
            </dl>
          </div>

          {/* 3D Isometric Translucent Cube Stage + Live Featured Pass */}
          <div className="animate-rise delay-150 lg:col-span-6">
            <HeroCubeScene preview={heroPreview} />
          </div>
        </div>
      </section>

      {/* 2. Floating Search & Filter Dock */}
      <section className="relative z-20 mx-auto -mt-9 max-w-6xl px-4 sm:px-6">
        <div className="glass-card rounded-[20px] p-3.5 shadow-dock sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                placeholder="Search Cebu events by title, topic, or venue..."
                aria-label="Search events"
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <SegmentedTabs
              value={tab}
              onChange={setTab}
              ariaLabel="Filter events"
              options={[
                { id: 'all', icon: <Layers className="h-3.5 w-3.5 shrink-0" />, label: `All (${events.length})` },
                { id: 'upcoming', icon: <CalendarClock className="h-3.5 w-3.5 shrink-0" />, label: `Upcoming (${upcomingCount})` },
                { id: 'open', icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />, label: `Open Spots (${openCount})` },
                { id: 'ended', icon: <Clock className="h-3.5 w-3.5 shrink-0" />, label: `Ended (${endedCount})` },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 3. Today's Event Spotlight Banner */}
      {todayEvent && (
        <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <div className="animate-rise flex flex-col justify-between gap-5 rounded-[20px] border border-brand-sky bg-gradient-to-r from-white via-sky-50/70 to-brand-sky/30 p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge tone="blue" pulse icon={<CalendarCheck2 className="h-3.5 w-3.5" />}>
                  Happening Today in Cebu
                </StatusBadge>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy/70">
                  <Users className="h-3.5 w-3.5 text-brand-primary" />
                  {todayEvent.full
                    ? 'Full'
                    : `${todayEvent.spotsLeft} of ${todayEvent.capacity} spots left`}
                </span>
              </div>
              <h2 className="font-heading text-xl font-extrabold text-brand-navy sm:text-2xl">
                {todayEvent.title}
              </h2>
              <p className="text-xs font-medium text-brand-navy/75 sm:text-sm">
                {formatCebuTimeRange(todayEvent.startsAt, todayEvent.endsAt)} · {todayEvent.venue}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <Link to={`/events/${todayEvent.id}`}>
                <Button variant="outline" size="md">
                  View Details
                </Button>
              </Link>
              {todayEvent.full ? (
                <Button variant="primary" size="md" disabled>
                  Full
                </Button>
              ) : (
                <Link to={`/events/${todayEvent.id}/register`}>
                  <Button variant="primary" size="md">
                    <span>Register Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. Events Grid */}
      <section id="events" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <StatusBadge tone="blue">Live Schedule · Asia/Manila</StatusBadge>
            <h2 className="mt-2.5 font-heading text-2xl font-black text-brand-navy sm:text-3xl">
              Events in Cebu
            </h2>
            <p className="mt-1 text-sm text-brand-navy/70">
              All times in Cebu local time (12-hour AM/PM). Seat counts update live from the server.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
          >
            <span>View full directory</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <EventList
          events={filteredEvents}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          onResetFilters={search || tab !== 'all' ? resetFilters : undefined}
        />
      </section>

      {/* 5. Interactive Animated Tutorial Studio (Attendee + Door Staff) */}
      <InteractiveTutorial />

      {/* 6. Dual Action Banner */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col justify-between gap-4 rounded-[20px] border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                For Attendees
              </p>
              <h3 className="mt-1 font-heading text-lg font-bold text-brand-navy">
                Already registered?
              </h3>
              <p className="mt-1 text-sm text-brand-navy/70">
                Retrieve your QR pass anytime using your ticket code and email.
              </p>
            </div>
            <Link to="/lookup" className="shrink-0">
              <Button variant="secondary" size="md">
                <Search className="h-4 w-4 text-brand-primary" />
                Find My Ticket
              </Button>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-[20px] border border-brand-navy/10 bg-brand-navy p-6 text-white shadow-card sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
                For Door Staff
              </p>
              <h3 className="mt-1 font-heading text-lg font-bold text-white">
                Managing check-in?
              </h3>
              <p className="mt-1 text-sm text-white/75">
                Sign in to scan ticket codes and view live attendee counts.
              </p>
            </div>
            <Link to="/staff/login" className="shrink-0">
              <Button
                size="md"
                className="!bg-white !bg-none !text-brand-navy hover:!bg-brand-sky"
              >
                <ShieldCheck className="h-4 w-4 text-brand-primary" />
                Staff Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
