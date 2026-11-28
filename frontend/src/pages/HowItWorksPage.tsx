import { ArrowRight, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { InteractiveTutorial } from '../features/events'

export function HowItWorksPage() {
  return (
    <div>
      <InteractiveTutorial />

      <section className="bg-page py-3 sm:py-8">
        <div className="page-container">
          <div className="flex flex-col gap-2.5 rounded-[var(--radius-card)] border border-border bg-white p-2.5 shadow-card sm:gap-4 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 max-w-xl">
              <p className="section-eyebrow">Ready to try it?</p>
              <h2 className="heading-section mt-0.5 font-heading font-extrabold text-brand-navy">
                Explore live Cebu events or open your pass
              </h2>
              <p className="section-subtitle mt-0.5 sm:mt-1">
                Reserve a free seat, retrieve an existing QR pass, or sign in as door staff.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-1.5 min-[380px]:grid-cols-3 lg:w-auto lg:shrink-0 lg:gap-2">
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
