import { BarChart3, RefreshCw, ScanLine } from 'lucide-react'
import { useMemo, useState } from 'react'
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

export function StaffDashboardPage() {
  const { data: metrics = [], isLoading, isError, refetch, isRefetching } = useDashboardMetrics()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>('all')
  const [viewMode, setViewMode] = useState<DashboardViewMode>('carousel')

  const [exportingId, setExportingId] = useState<number | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

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
    <div className="page-container animate-rise space-y-1.5 py-2 sm:space-y-4 sm:py-5">
      {/* Formal Page Title & Quick Action Row */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-2.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone="blue" icon={<BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}>
              Operations Dashboard
            </StatusBadge>
            {!isLoading && (
              <span className="rounded-full border border-border bg-white/90 px-2.5 py-0.5 text-xs font-bold text-brand-navy/75">
                {metrics.length} {metrics.length === 1 ? 'event' : 'events'}
              </span>
            )}
          </div>
          <h1 className="heading-hero font-heading mt-1.5 font-extrabold text-brand-navy">
            Operations Dashboard
          </h1>
          <p className="section-subtitle mt-0.5 hidden sm:block">
            Live seat capacity, attendance breakdown, waitlists, and Excel CSV reporting.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:flex sm:shrink-0 sm:items-center sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => refetch()}
            disabled={isRefetching}
            className="bg-white/90 sm:h-[var(--control-h)] sm:w-auto sm:px-3.5 sm:text-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Syncing…' : 'Sync'}</span>
          </Button>

          <Link to="/staff/check-in" className="block sm:flex-none">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              className="sm:h-[var(--control-h)] sm:w-auto sm:px-3.5 sm:text-sm"
            >
              <ScanLine className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="sm:hidden">Check-In</span>
              <span className="hidden sm:inline">Door Check-In</span>
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
      <section className="space-y-2 sm:space-y-3" aria-label="Event reports">
        <DashboardToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
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
