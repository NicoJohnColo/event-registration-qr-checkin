import {
  CalendarDays,
  ChevronRight,
  Clock,
  Home,
  Menu,
  PlayCircle,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { BrandLogo } from '../components/ui/BrandLogo'
import { Button } from '../components/ui/Button'
import {
  headerPillClass,
  siteHeaderClass,
  siteHeaderInnerClass,
} from '../components/ui/siteHeader'
import { useAuth } from '../features/auth'

interface PublicLayoutProps {
  children?: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const { isAuthenticated } = useAuth()
  const staffDestination = isAuthenticated ? '/staff/check-in' : '/staff/login'
  const staffLabel = isAuthenticated ? 'Staff Portal' : 'Staff Sign In'

  useEffect(() => {
    setMobileOpen(false)
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex h-8.5 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-bold leading-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20 ${
      isActive
        ? 'bg-sky-50 text-brand-primary shadow-xs ring-1 ring-brand-sky'
        : 'text-brand-navy/80 hover:bg-page hover:text-brand-navy'
    }`

  const mobileNavItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-full h-9.5 items-center justify-between rounded-[var(--radius-control)] px-3 text-xs font-bold transition-colors ${
      isActive
        ? 'bg-sky-50 text-brand-primary ring-1 ring-brand-sky'
        : 'text-brand-navy/85 hover:bg-page hover:text-brand-navy'
    }`

  return (
    <div className="flex min-h-dvh flex-col bg-page text-brand-navy">
      <header className={siteHeaderClass}>
        <div className={siteHeaderInnerClass}>
          <Link to="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              Events
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>
              How It Works
            </NavLink>
            <NavLink to="/lookup" className={navLinkClass}>
              <Search className="h-4 w-4 shrink-0" />
              <span>Find My Ticket</span>
            </NavLink>
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-border/80 bg-page px-2.5 py-1 text-xs font-semibold leading-none text-brand-navy/75 lg:inline-flex">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span>Asia/Manila (UTC+8)</span>
            </span>
            <Link to={staffDestination} className={headerPillClass}>
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-primary" />
              <span>{staffLabel}</span>
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border bg-surface text-brand-navy transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="animate-slide-down absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-border/80 bg-white py-2.5 shadow-xl md:hidden">
            <nav className="page-container flex flex-col gap-1" aria-label="Mobile navigation">
              <NavLink to="/" end className={mobileNavItemClass} onClick={() => setMobileOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <Home className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                  <span>Home</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-brand-navy/45" />
              </NavLink>

              <NavLink to="/events" className={mobileNavItemClass} onClick={() => setMobileOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                  <span>Events</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-brand-navy/45" />
              </NavLink>

              <NavLink
                to="/how-it-works"
                className={mobileNavItemClass}
                onClick={() => setMobileOpen(false)}
              >
                <span className="inline-flex items-center gap-2">
                  <PlayCircle className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                  <span>How It Works</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-brand-navy/45" />
              </NavLink>

              <NavLink to="/lookup" className={mobileNavItemClass} onClick={() => setMobileOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                  <span>Find My Ticket</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-brand-navy/45" />
              </NavLink>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-control)] bg-page px-3 py-2 text-[11px] text-brand-navy/75">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Clock className="h-3 w-3 shrink-0 text-brand-primary" />
                  <span>Cebu Time (UTC+8)</span>
                </span>
                <span className="font-semibold">12-hour AM/PM</span>
              </div>

              <Link to={staffDestination} className="mt-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" fullWidth>
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
                  <span>{staffLabel}</span>
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-30 bg-brand-navy/35 backdrop-blur-[2px] md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main key={pathname} className="animate-page-in relative z-10 flex-1">
        {children ?? <Outlet />}
      </main>

      <footer className="relative z-10 border-t border-border bg-white py-4 sm:py-6">
        <div className="page-container flex flex-col items-start justify-between gap-3 text-xs text-brand-navy/75 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <BrandLogo />
            <p className="text-[11px] leading-relaxed text-brand-navy/70">
              All event schedules shown in Cebu local time (Asia/Manila · UTC+8).
            </p>
          </div>
          <nav
            aria-label="Footer links"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold"
          >
            <Link
              to="/events"
              className="inline-flex h-8 items-center transition-colors hover:text-brand-primary"
            >
              Browse Events
            </Link>
            <Link
              to="/lookup"
              className="inline-flex h-8 items-center transition-colors hover:text-brand-primary"
            >
              Find My Ticket
            </Link>
            <Link
              to={staffDestination}
              className="inline-flex h-8 items-center transition-colors hover:text-brand-primary"
            >
              {staffLabel}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
