import { CheckCircle2, Clock, Users } from 'lucide-react'

interface TotalsBarProps {
  registeredCount: number
  checkedInCount: number
  capacity: number
}

export function TotalsBar({ registeredCount, checkedInCount, capacity }: TotalsBarProps) {
  const notCheckedIn = Math.max(0, registeredCount - checkedInCount)

  return (
    <div className="grid grid-cols-3 divide-x divide-border/75 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-2xs sm:gap-3 sm:divide-x-0 sm:overflow-visible sm:border-0 sm:bg-transparent sm:shadow-none">
      <div className="flex min-w-0 items-center justify-between bg-sky-50/75 px-2 py-2 sm:rounded-[var(--radius-card)] sm:border sm:border-brand-sky sm:bg-sky-50/80 sm:p-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold leading-tight tracking-[0.03em] text-brand-primary sm:text-xs">
            Registered
          </p>
          <p className="font-code mt-0.5 text-sm font-extrabold leading-none tabular-nums text-brand-navy sm:text-[1.25rem]">
            {registeredCount}
            <span className="ml-0.5 text-[10px] font-semibold text-brand-navy/65 sm:text-xs">
              /{capacity}
            </span>
          </p>
        </div>
        <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-brand-primary shadow-xs sm:flex">
          <Users className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-between bg-emerald-50/75 px-2 py-2 sm:rounded-[var(--radius-card)] sm:border sm:border-emerald-200 sm:bg-emerald-50/80 sm:p-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold leading-tight tracking-[0.03em] text-status-green sm:text-xs">
            Checked in
          </p>
          <p className="font-code mt-0.5 text-sm font-extrabold leading-none tabular-nums text-brand-navy sm:text-[1.25rem]">
            {checkedInCount}
            <span className="ml-0.5 text-[10px] font-semibold text-brand-navy/65 sm:text-xs">
              /{registeredCount}
            </span>
          </p>
        </div>
        <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-status-green shadow-xs sm:flex">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-between bg-surface px-2 py-2 sm:rounded-[var(--radius-card)] sm:border sm:border-border sm:p-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold leading-tight tracking-[0.03em] text-brand-navy/75 sm:text-xs">
            Pending
          </p>
          <p className="font-code mt-0.5 text-sm font-extrabold leading-none tabular-nums text-brand-navy sm:text-[1.25rem]">
            {notCheckedIn}
          </p>
        </div>
        <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-page text-brand-navy/70 sm:flex">
          <Clock className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  )
}
