import { BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export function StaffDashboardPage() {
  return (
    <div className="page-container py-3 sm:py-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight text-brand-navy sm:text-2xl">
            Staff Dashboard
          </h1>
          <p className="text-xs text-brand-navy/70">
            Real-time event metrics, capacity tracking, and CSV reporting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="h-8 text-xs">
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-white/70 p-8 text-center">
        <BarChart3 className="mx-auto mb-2 h-8 w-8 text-brand-primary/40" />
        <p className="text-xs font-bold text-brand-navy">Dashboard view connects to /api/staff/dashboard/metrics</p>
        <p className="text-[11px] text-brand-navy/60">Includes No-Shows calculation and CSV roster download.</p>
      </div>
    </div>
  )
}
