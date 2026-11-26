import { CheckCircle2, Clock, Users } from 'lucide-react'

interface TotalsBarProps {
  registeredCount: number
  checkedInCount: number
  capacity: number
}

export function TotalsBar({ registeredCount, checkedInCount, capacity }: TotalsBarProps) {
  const notCheckedIn = Math.max(0, registeredCount - checkedInCount)

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="flex min-w-0 items-center justify-between rounded-[var(--radius-card)] border border-brand-sky bg-sky-50/80 p-2.5 sm:p-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold leading-tight tracking-[0.03em] text-brand-primary sm:text-xs">
            Registered
          </p>
          <p className="font-code text-kpi mt-0.5 font-extrabold tabular-nums text-brand-navy">
            {registeredCount}{' '}
            <span className="text-[11px] font-semibold text-brand-navy/65 sm:text-xs">/ {capacity}</span>
          </p>
        </div>
        <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-brand-primary shadow-xs sm:flex">
          <Users className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-between rounded-[var(--radius-card)] border border-emerald-200 bg-emerald-50/80 p-2.5 sm:p-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold leading-tight tracking-[0.03em] text-status-green sm:text-xs">
            Checked in
          </p>
          <p className="font-code text-kpi mt-0.5 font-extrabold tabular-nums text-brand-navy">
            {checkedInCount}{' '}
            <span className="text-[11px] font-semibold text-brand-navy/65 sm:text-xs">/ {registeredCount}</span>
          </p>
        </div>
        <div className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-status-green shadow-xs sm:flex">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-between rounded-[var(--radius-card)] border border-border bg-surface p-2.5 sm:p-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold leading-tight tracking-[0.03em] text-brand-navy/75 sm:text-xs">
            Pending
          </p>
          <p className="font-code text-kpi mt-0.5 font-extrabold tabular-nums text-brand-navy">
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
