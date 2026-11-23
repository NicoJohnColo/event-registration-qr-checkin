import {
  CalendarDays,
  GalleryHorizontalEnd,
  LayoutGrid,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { StatusBadge } from '../components/ui/StatusBadge'
import {
  EventList,
  EventSearchToolbar,
  FloatingCubeAccent,
  useEvents,
  type EventFilterTab,
} from '../features/events'

type ViewMode = 'carousel' | 'grid'

export function EventsPage() {
  const { data: events = [], isLoading, isError, error, refetch } = useEvents()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<EventFilterTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('carousel')

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

  const viewModeToggle = (
    <div className="inline-flex rounded-xl border border-border/80 bg-page p-1">
      <button
        type="button"
        onClick={() => setViewMode('carousel')}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
          viewMode === 'carousel'
            ? 'bg-brand-primary text-white shadow-xs'
            : 'text-brand-navy/70 hover:text-brand-navy'
        }`}
      >
        <GalleryHorizontalEnd className="h-3.5 w-3.5" />
        <span>Carousel</span>
      </button>
      <button
        type="button"
        onClick={() => setViewMode('grid')}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
          viewMode === 'grid'
            ? 'bg-brand-primary text-white shadow-xs'
            : 'text-brand-navy/70 hover:text-brand-navy'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span>Grid</span>
      </button>
    </div>
  )

  return (
    <div>
      <section className="bg-sky-header border-b border-brand-sky/80 pt-5 pb-10 sm:pt-7 sm:pb-12">
        <div className="page-container">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="blue" icon={<CalendarDays className="h-3.5 w-3.5" />}>
                  Directory · Asia/Manila (UTC+8)
                </StatusBadge>
                {!isLoading && (
                  <span className="rounded-full bg-surface/90 px-2.5 py-0.5 text-[11px] font-semibold text-brand-navy/80">
                    {upcomingCount} upcoming · {openCount} with open seats
                  </span>
                )}
              </div>

              <h1 className="heading-hero mt-2.5 font-heading font-extrabold text-brand-navy">
                All Cebu Events
              </h1>
              <p className="mt-1 max-w-2xl break-words whitespace-normal text-xs leading-relaxed text-brand-navy/80 sm:text-sm">
                Every published event with 12-hour Cebu start and end times and live seat availability.
              </p>
            </div>
            <FloatingCubeAccent />
          </div>
        </div>
      </section>

      <section className="page-container relative z-10 -mt-5 pb-8 sm:pb-12">
        <EventSearchToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          counts={{
            all: events.length,
            upcoming: upcomingCount,
            open: openCount,
            ended: endedCount,
          }}
          totalMatching={filtered.length}
          onReset={resetFilters}
          placeholder="Search events…"
          rightAccessory={viewModeToggle}
          className="mb-4 shadow-dock"
        />

        <EventList
          events={filtered}
          layout={viewMode}
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
