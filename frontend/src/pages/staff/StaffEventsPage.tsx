import { ArrowLeft, Calendar, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function StaffEventsPage() {
  return (
    <div className="page-container py-3 sm:py-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/staff/dashboard"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white text-brand-navy/70 hover:text-brand-primary sm:hidden"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <h1 className="text-lg font-black tracking-tight text-brand-navy sm:text-2xl">
              Manage Events
            </h1>
          </div>
          <p className="text-xs text-brand-navy/70">
            Create, edit schedules, and close events.
          </p>
        </div>

        <Button variant="primary" size="sm" className="self-start sm:self-auto">
          <Plus className="h-3.5 w-3.5" />
          <span>New Event</span>
        </Button>
      </div>

      <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-white/70 p-8 text-center">
        <Calendar className="mx-auto mb-2 h-8 w-8 text-brand-primary/40" />
        <p className="text-xs font-bold text-brand-navy">Events Management view coming up next</p>
        <p className="text-[11px] text-brand-navy/60">Connects to backend CRUD endpoints.</p>
      </div>
    </div>
  )
}
