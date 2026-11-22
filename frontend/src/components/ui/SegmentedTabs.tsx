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
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = 'bg-page',
}: SegmentedTabsProps<T>) {
  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 rounded-xl p-1 ${className}`}
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
            className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-extrabold leading-none transition-all duration-150 ${
              active
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-brand-navy/70 hover:bg-white/70 hover:text-brand-navy'
            }`}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
