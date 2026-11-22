import { CalendarClock, CalendarDays, CheckCircle2, Clock, Layers, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Input } from '../components/ui/Input'
import { SegmentedTabs } from '../components/ui/SegmentedTabs'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EventList, FloatingCubeAccent, useEvents } from '../features/events'

type DirectoryFilter = 'all' | 'upcoming' | 'open' | 'ended'

export function EventsPage() {
  const { data: events = [], isLoading, isError, error, refetch } = useEvents()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<DirectoryFilter>('all')

  const upcomingCount = useMemo(() => events.filter((e) => !e.ended).length, [events])
  const openCount = useMemo(() => events.filter((e) => !e.ended && !e.full).length, [events])
  const endedCount = useMemo(() => events.filter((e) => e.ended).length, [events])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return events.filter((event) => {
      if (filter === 'upcoming' && event.ended) return false
      if (filter === 'open' && (event.ended || event.full)) return false
      if (filter === 'ended' && !event.ended) return false
      if (!q) return true
      return (
        event.title.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q)
      )
    })
  }, [events, search, filter])

  const resetFilters = () => {
    setSearch('')
    setFilter('all')
  }

  return (
    <div>
      <section className="bg-sky-header border-b border-brand-sky/80 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge tone="blue" icon={<CalendarDays className="h-3.5 w-3.5" />}>
                  Directory · Asia/Manila (UTC+8)
                </StatusBadge>
                {!isLoading && (
                  <span className="rounded-full bg-surface/85 px-3 py-1 text-xs font-semibold text-brand-navy/75">
                    {upcomingCount} upcoming · {openCount} with open seats
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-heading text-3xl font-black text-brand-navy sm:text-4xl">
                All Cebu Events
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-brand-navy/75 sm:text-base">
                Every published event with 12-hour Cebu start and end times and live seat availability.
              </p>
            </div>
            <FloatingCubeAccent />
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                placeholder="Search by title, topic, or venue..."
                aria-label="Search events"
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <SegmentedTabs
              value={filter}
              onChange={setFilter}
              ariaLabel="Filter events"
              className="bg-surface/90 shadow-sm"
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

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <EventList
          events={filtered}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          onResetFilters={search || filter !== 'all' ? resetFilters : undefined}
        />
      </section>
    </div>
  )
}
