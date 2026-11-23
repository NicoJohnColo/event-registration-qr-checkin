import { ArrowRight, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { InteractiveTutorial } from '../features/events'

export function HowItWorksPage() {
  return (
    <div>
      <InteractiveTutorial />

      <section className="bg-page py-6 sm:py-8">
        <div className="page-container">
          <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                Ready to try it?
              </p>
              <h2 className="heading-card mt-0.5 font-heading font-extrabold text-brand-navy">
                Explore live Cebu events or open your pass
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-brand-navy/75 sm:text-sm">
                Reserve a free seat in seconds, retrieve an existing QR pass, or sign in as door
                staff.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:shrink-0">
              <Link to="/events" className="block">
                <Button variant="primary" size="sm" fullWidth>
                  <span>Browse Events</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link to="/lookup" className="block">
                <Button variant="outline" size="sm" fullWidth>
                  <Search className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Find My Ticket</span>
                </Button>
              </Link>
              <Link to="/staff/login" className="block">
                <Button variant="outline" size="sm" fullWidth>
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Staff Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
