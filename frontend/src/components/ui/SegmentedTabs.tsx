import type { ReactNode } from 'react'

export interface SegmentedTabOption<T extends string> {
  id: T
  label: string
  icon?: ReactNode
}

interface SegmentedTabsProps<T extends string> {
  options: readonly SegmentedTabOption<T>[]
  value: T
  onChange: (id: T) => void
  ariaLabel?: string
  className?: string
  equalWidth?: boolean
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = 'bg-page',
  equalWidth = false,
}: SegmentedTabsProps<T>) {
  return (
    <div className={equalWidth ? '' : 'scroll-fade-right'}>
      <div
        className={`no-scrollbar rounded-[var(--radius-control)] border border-border/80 p-1 ${
          equalWidth
            ? 'grid grid-cols-3 gap-1'
            : 'flex items-center gap-1 overflow-x-auto pr-5 sm:pr-1 [scroll-snap-type:x_proximity] [-webkit-overflow-scrolling:touch] [touch-action:pan-x]'
        } ${className}`}
        role="tablist"
        aria-label={ariaLabel}
      >
        {options.map((option) => {
          const active = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option.id)}
              className={`inline-flex h-[var(--control-h-sm)] items-center justify-center gap-1 whitespace-nowrap rounded-[8px] px-2.5 text-[11px] font-bold leading-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:text-xs ${
                equalWidth ? 'min-w-0 flex-1 px-1.5 text-center' : 'shrink-0 snap-start'
              } ${
                active
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-brand-navy/80 hover:bg-white/80 hover:text-brand-navy'
              }`}
            >
              {option.icon}
              <span className={equalWidth ? 'truncate' : ''}>{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
