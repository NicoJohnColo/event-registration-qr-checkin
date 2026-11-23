import { ArrowRight, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { InteractiveTutorial } from '../features/events'

export function HowItWorksPage() {
  return (
    <div>
      <InteractiveTutorial />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-5 rounded-[20px] border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Ready to try it?
            </p>
            <h2 className="mt-1 font-heading text-lg font-extrabold text-brand-navy sm:text-xl">
              Explore live Cebu events or open your pass
            </h2>
            <p className="mt-1 text-sm text-brand-navy/70">
              Reserve a free seat in seconds, retrieve an existing QR pass, or sign in as door staff.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/events">
              <Button variant="primary" size="md">
                <span>Browse Cebu Events</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/lookup">
              <Button variant="secondary" size="md">
                <Search className="h-4 w-4 text-brand-primary" />
                <span>Find My Ticket</span>
              </Button>
            </Link>
            <Link to="/staff/login">
              <Button variant="outline" size="md">
                <ShieldCheck className="h-4 w-4 text-brand-primary" />
                <span>Staff Sign In</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
