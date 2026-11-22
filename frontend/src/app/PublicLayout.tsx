import { Clock, Menu, Search, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BrandLogo } from '../components/ui/BrandLogo'
import { Button } from '../components/ui/Button'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold leading-none transition-all duration-150 ${
      isActive
        ? 'bg-sky-50 text-brand-primary shadow-xs ring-1 ring-brand-sky'
        : 'text-brand-navy/75 hover:bg-page hover:text-brand-navy'
    }`

  return (
    <div className="flex min-h-screen flex-col bg-page text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-brand-sky/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1.5 md:flex" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              Events
            </NavLink>
            <a
              href="/#tutorial"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold leading-none text-brand-navy/75 transition-all duration-150 hover:bg-page hover:text-brand-navy"
            >
              How It Works
            </a>
            <NavLink to="/lookup" className={navLinkClass}>
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span>Find My Ticket</span>
            </NavLink>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-border/80 bg-page px-3 py-1.5 text-xs font-semibold leading-none text-brand-navy/70 lg:inline-flex">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span>Asia/Manila (UTC+8)</span>
            </span>
            <Link to="/staff/login">
              <Button variant="secondary" size="sm">
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-primary" />
                <span>Staff Sign In</span>
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-brand-navy transition-colors hover:bg-page md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="animate-slide-down border-t border-border/80 bg-white/95 px-4 py-4 shadow-lg backdrop-blur-md md:hidden">
            <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
              <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/events" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Events
              </NavLink>
              <a
                href="/#tutorial"
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-brand-navy/75 transition-all duration-150 hover:bg-page hover:text-brand-navy"
                onClick={() => setMobileOpen(false)}
              >
                How It Works
              </a>
              <NavLink to="/lookup" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Find My Ticket
              </NavLink>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-page px-3 py-2 text-xs text-brand-navy/70">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-brand-primary" />
                  Cebu Time (UTC+8)
                </span>
                <span>12-hour AM/PM</span>
              </div>
              <Link
                to="/staff/login"
                className="mt-1"
                onClick={() => setMobileOpen(false)}
              >
                <Button variant="secondary" size="md" fullWidth>
                  <ShieldCheck className="h-4 w-4 text-brand-primary" />
                  Staff Sign In
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/80 bg-surface py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 text-sm text-brand-navy/65 sm:flex-row sm:items-center sm:px-6">
          <div className="space-y-1.5">
            <BrandLogo />
            <p className="text-xs text-brand-navy/60">
              All event schedules shown in Cebu local time (Asia/Manila · UTC+8).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold">
            <Link to="/events" className="transition-colors hover:text-brand-primary">
              Browse Events
            </Link>
            <Link to="/lookup" className="transition-colors hover:text-brand-primary">
              Find My Ticket
            </Link>
            <Link to="/staff/login" className="transition-colors hover:text-brand-primary">
              Staff Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
