import { CheckCircle2, Clock, Users } from 'lucide-react'

interface TotalsBarProps {
  registeredCount: number
  checkedInCount: number
  capacity: number
}

export function TotalsBar({ registeredCount, checkedInCount, capacity }: TotalsBarProps) {
  const notCheckedIn = Math.max(0, registeredCount - checkedInCount)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex items-center justify-between rounded-2xl border border-brand-sky bg-sky-50/75 px-4 py-3.5">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-primary">
            Registered
          </p>
          <p className="font-code mt-0.5 text-xl font-extrabold text-brand-navy">
            {registeredCount} / {capacity}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-primary shadow-xs">
          <Users className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/75 px-4 py-3.5">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-status-green">
            Checked In
          </p>
          <p className="font-code mt-0.5 text-xl font-extrabold text-brand-navy">
            {checkedInCount} / {registeredCount}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-status-green shadow-xs">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-navy/60">
            Awaiting Check-In
          </p>
          <p className="font-code mt-0.5 text-xl font-extrabold text-brand-navy">
            {notCheckedIn}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-page text-brand-navy/60">
          <Clock className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
