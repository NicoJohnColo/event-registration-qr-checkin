import {
  CheckCircle2,
  FileEdit,
  GalleryHorizontalEnd,
  Layers,
  LayoutGrid,
  Lock,
  Search,
} from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs'

export type DashboardStatusFilter = 'all' | 'published' | 'draft' | 'closed'
export type DashboardViewMode = 'carousel' | 'grid'

interface DashboardToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: DashboardStatusFilter
  onStatusFilterChange: (tab: DashboardStatusFilter) => void
  viewMode: DashboardViewMode
  onViewModeChange: (mode: DashboardViewMode) => void
  counts: {
    all: number
    published: number
    draft: number
    closed: number
  }
  totalMatching: number
  onReset: () => void
}

export function DashboardToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  counts,
  totalMatching,
  onReset,
}: DashboardToolbarProps) {
  const hasActiveFilters = search.trim().length > 0 || statusFilter !== 'all'

  return (
    <div className="staff-surface-card rounded-[var(--radius-card)] p-2 sm:p-3.5">
      <div className="flex flex-col gap-2 sm:gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        {/* Search Bar + Carousel/Grid View Toggle */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <div className="min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onClear={() => onSearchChange('')}
              placeholder="Search event, venue, or code…"
              aria-label="Search dashboard events"
              leftIcon={<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            />
          </div>

          <div
            className="inline-flex shrink-0 rounded-[var(--radius-control)] border border-border/80 bg-page p-0.5 sm:p-1"
            role="group"
            aria-label="Layout view mode"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('carousel')}
              aria-pressed={viewMode === 'carousel'}
              aria-label="Carousel view"
              className={`inline-flex h-[var(--control-h-sm)] items-center gap-1 rounded-[6px] px-2 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:rounded-[8px] sm:px-2.5 sm:text-xs ${
                viewMode === 'carousel'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-brand-navy/75 hover:bg-white/70 hover:text-brand-navy'
              }`}
            >
              <GalleryHorizontalEnd className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Carousel</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Grid view"
              className={`inline-flex h-[var(--control-h-sm)] items-center gap-1 rounded-[6px] px-2 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:rounded-[8px] sm:px-2.5 sm:text-xs ${
                viewMode === 'grid'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-brand-navy/75 hover:bg-white/70 hover:text-brand-navy'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="min-w-0 xl:shrink-0">
          <SegmentedTabs
            fitMobile
            value={statusFilter}
            onChange={onStatusFilterChange}
            ariaLabel="Filter events by status"
            options={[
              {
                id: 'all',
                icon: <Layers className="h-3.5 w-3.5 shrink-0" />,
                label: `All (${counts.all})`,
              },
              {
                id: 'published',
                icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />,
                label: `Published (${counts.published})`,
              },
              {
                id: 'draft',
                icon: <FileEdit className="h-3.5 w-3.5 shrink-0" />,
                label: `Draft (${counts.draft})`,
              },
              {
                id: 'closed',
                icon: <Lock className="h-3.5 w-3.5 shrink-0" />,
                label: `Closed (${counts.closed})`,
              },
            ]}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2 text-xs">
          <span className="min-w-0 truncate text-brand-navy/75">
            Showing <strong className="text-brand-navy">{totalMatching}</strong>{' '}
            {totalMatching === 1 ? 'event' : 'events'}
            {search.trim() ? ` matching "${search.trim()}"` : ''}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-7 shrink-0 items-center font-bold text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:h-8"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
