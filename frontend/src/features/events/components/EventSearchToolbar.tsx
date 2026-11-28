import { CalendarClock, CheckCircle2, Clock, Layers, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Input } from '../../../components/ui/Input'
import { SegmentedTabs } from '../../../components/ui/SegmentedTabs'

export type EventFilterTab = 'all' | 'upcoming' | 'open' | 'ended'

interface EventSearchToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filter: EventFilterTab
  onFilterChange: (tab: EventFilterTab) => void
  counts: {
    all: number
    upcoming: number
    open: number
    ended: number
  }
  totalMatching: number
  onReset: () => void
  placeholder?: string
  rightAccessory?: ReactNode
  className?: string
  flatMobile?: boolean
}

export function EventSearchToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts,
  totalMatching,
  onReset,
  placeholder = 'Search events…',
  rightAccessory,
  className = '',
  flatMobile = false,
}: EventSearchToolbarProps) {
  const hasActiveFilters = search.trim().length > 0 || filter !== 'all'

  return (
    <div
      className={`${
        flatMobile
          ? 'sm:rounded-[var(--radius-card)] sm:border sm:border-border/80 sm:bg-surface sm:p-3 sm:shadow-card'
          : 'rounded-[var(--radius-card)] border border-border/80 bg-surface p-2.5 shadow-card sm:p-3'
      } ${className}`}
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onClear={() => onSearchChange('')}
              placeholder={placeholder}
              aria-label="Search events"
              className={
                flatMobile
                  ? '!bg-white !border-border/80 shadow-2xs sm:!bg-[#F3F5F9] sm:!border-transparent sm:shadow-none'
                  : ''
              }
              leftIcon={<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            />
          </div>
          {rightAccessory && <div className="shrink-0 lg:hidden">{rightAccessory}</div>}
        </div>

        <div className="min-w-0 lg:shrink-0">
          <SegmentedTabs
            value={filter}
            onChange={onFilterChange}
            ariaLabel="Filter events"
            fitMobile
            className={flatMobile ? 'bg-white shadow-2xs sm:bg-page sm:shadow-none' : 'bg-page'}
            options={[
              {
                id: 'all',
                icon: <Layers className="hidden h-3.5 w-3.5 shrink-0 sm:block" />,
                label: `All (${counts.all})`,
              },
              {
                id: 'upcoming',
                icon: <CalendarClock className="hidden h-3.5 w-3.5 shrink-0 sm:block" />,
                label: `Upcoming (${counts.upcoming})`,
              },
              {
                id: 'open',
                icon: <CheckCircle2 className="hidden h-3.5 w-3.5 shrink-0 sm:block" />,
                label: (
                  <>
                    <span className="sm:hidden">Open ({counts.open})</span>
                    <span className="hidden sm:inline">Open Spots ({counts.open})</span>
                  </>
                ),
              },
              {
                id: 'ended',
                icon: <Clock className="hidden h-3.5 w-3.5 shrink-0 sm:block" />,
                label: `Ended (${counts.ended})`,
              },
            ]}
          />
        </div>

        {rightAccessory && <div className="hidden shrink-0 lg:block">{rightAccessory}</div>}
      </div>

      {hasActiveFilters && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-xs">
          <span className="min-w-0 truncate text-brand-navy/75">
            Showing <strong className="text-brand-navy">{totalMatching}</strong>{' '}
            {totalMatching === 1 ? 'event' : 'events'}
            {search.trim() ? ` for "${search.trim()}"` : ''}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 min-h-[40px] shrink-0 items-center font-bold text-brand-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
