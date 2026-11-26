import { BarChart3, RefreshCw, ScanLine } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  DashboardAnalyticsRow,
  DashboardEventList,
  DashboardSummaryStrip,
  DashboardToolbar,
  downloadRosterCsv,
  useDashboardMetrics,
  type DashboardStatusFilter,
  type DashboardViewMode,
  type EventMetrics,
} from '../../features/dashboard'

const MOBILE_BREAKPOINT = 768

export function StaffDashboardPage() {
  const { data: metrics = [], isLoading, isError, refetch, isRefetching } = useDashboardMetrics()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>('all')
  const [viewMode, setViewMode] = useState<DashboardViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT ? 'carousel' : 'grid',
  )
  const userToggledViewRef = useRef(false)

  const [exportingId, setExportingId] = useState<number | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (userToggledViewRef.current) return
      setViewMode(window.innerWidth < MOBILE_BREAKPOINT ? 'carousel' : 'grid')
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleViewModeChange = (mode: DashboardViewMode) => {
    userToggledViewRef.current = true
    setViewMode(mode)
  }

  const counts = useMemo(
    () => ({
      all: metrics.length,
      published: metrics.filter((e) => e.status === 'PUBLISHED').length,
      draft: metrics.filter((e) => e.status === 'DRAFT').length,
      closed: metrics.filter((e) => e.status === 'CLOSED').length,
    }),
    [metrics],
  )

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = metrics.filter((event) => {
      if (statusFilter === 'published' && event.status !== 'PUBLISHED') return false
      if (statusFilter === 'draft' && event.status !== 'DRAFT') return false
      if (statusFilter === 'closed' && event.status !== 'CLOSED') return false
      if (!q) return true
      return (
        event.title.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        event.codePrefix.toLowerCase().includes(q)
      )
    })

    // Show active/upcoming events first, ended/closed events after
    return [...filtered].sort((a, b) => {
      const aDone = a.isEnded || a.status === 'CLOSED'
      const bDone = b.isEnded || b.status === 'CLOSED'
      if (aDone !== bDone) return aDone ? 1 : -1
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    })
  }, [metrics, search, statusFilter])

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
  }

  const handleExportCsv = async (event: EventMetrics) => {
    try {
      setExportError(null)
      setExportingId(event.eventId)
      await downloadRosterCsv(event.eventId, event.title)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export CSV.')
    } finally {
      setExportingId(null)
    }
  }

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== 'all'

  return (
    <div className="page-container animate-rise space-y-3 py-3 sm:space-y-4 sm:py-5">
      {/* Formal Page Title & Quick Action Row */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone="blue" icon={<BarChart3 className="h-3.5 w-3.5" />}>
              Operations Dashboard
            </StatusBadge>
            {!isLoading && (
              <span className="rounded-full border border-border bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-brand-navy/75">
                {metrics.length} {metrics.length === 1 ? 'event' : 'events'} synced
              </span>
            )}
          </div>
          <h1 className="heading-hero font-heading mt-1.5 font-extrabold text-brand-navy">
            Operations Dashboard
          </h1>
          <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/75 sm:text-sm">
            Live seat capacity, attendance breakdown, waitlists, and Excel CSV reporting.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => refetch()}
            disabled={isRefetching}
            className="bg-white/90 sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 shrink-0 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Syncing…' : 'Sync'}</span>
          </Button>

          <Link to="/staff/check-in" className="block sm:flex-none">
            <Button variant="primary" size="md" fullWidth className="sm:w-auto">
              <ScanLine className="h-4 w-4 shrink-0" />
              <span>Door Check-In</span>
            </Button>
          </Link>
        </div>
      </div>

      {exportError && (
        <Alert tone="error" title="CSV Export Failed">
          {exportError}
        </Alert>
      )}

      {/* Block 1: 4-Card Formal KPI Summary Row */}
      <DashboardSummaryStrip events={metrics} isLoading={isLoading} />

      {/* Block 2: Capacity Fill Levels + Registration Status Donut */}
      {!isError && <DashboardAnalyticsRow events={metrics} isLoading={isLoading} />}

      {/* Block 3: Event Directory Search + Filter + Mobile Carousel / Desktop Grid */}
      <section className="space-y-3" aria-label="Event reports">
        <DashboardToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          counts={counts}
          totalMatching={filteredEvents.length}
          onReset={resetFilters}
        />

        <DashboardEventList
          events={filteredEvents}
          viewMode={viewMode}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onExportCsv={handleExportCsv}
          exportingId={exportingId}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      </section>
    </div>
  )
}
