import type { ReactNode } from 'react'

export type BadgeTone = 'green' | 'amber' | 'red' | 'blue' | 'neutral'

interface StatusBadgeProps {
  tone: BadgeTone
  icon?: ReactNode
  pulse?: boolean
  children: ReactNode
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-status-green border-emerald-200',
  amber: 'bg-amber-50 text-status-amber border-amber-200',
  red: 'bg-red-50 text-status-red border-red-200',
  blue: 'bg-sky-50 text-brand-primary border-brand-sky',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
}

const dotClasses: Record<BadgeTone, string> = {
  green: 'bg-status-green',
  amber: 'bg-status-amber',
  red: 'bg-status-red',
  blue: 'bg-brand-primary',
  neutral: 'bg-slate-500',
}

/** Pill status badge pairing color with text (and optional icon/pulse) for accessibility. */
export function StatusBadge({
  tone,
  icon,
  pulse = false,
  children,
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`animate-pop inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotClasses[tone]}`}
          />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dotClasses[tone]}`} />
        </span>
      )}
      {icon}
      <span>{children}</span>
    </span>
  )
}
