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
  const { isAuthenticated, staff } = useAuth()
  const staffDestination = isAuthenticated
    ? staff?.role === 'DOOR_STAFF'
      ? '/staff/check-in'
      : '/staff/dashboard'
    : '/staff/login'
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
    `inline-flex h-8.5 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-bold leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20 ${
      isActive
        ? 'bg-sky-50 text-brand-primary shadow-xs ring-1 ring-brand-sky'
        : 'text-brand-navy/80 hover:bg-page hover:text-brand-navy'
    }`

  const mobileNavItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex h-10 w-full items-center justify-between rounded-[var(--radius-control)] px-3 text-sm font-bold transition-colors ${
      isActive
        ? 'bg-sky-50 text-brand-primary ring-1 ring-brand-sky'
        : 'text-brand-navy/85 hover:bg-page hover:text-brand-navy'
    }`

  return (
    <div className="flex min-h-svh flex-col bg-page text-brand-navy">
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
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border bg-surface text-brand-navy transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="animate-slide-down absolute inset-x-0 top-full z-50 max-h-[calc(100svh-var(--header-h))] overflow-y-auto border-t border-border/80 bg-white py-2 shadow-xl md:hidden">
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

              <div className="mt-0.5 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-control)] bg-page px-2.5 py-1.5 text-[10.5px] text-brand-navy/75">
                <span className="inline-flex items-center gap-1 font-semibold">
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
          className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-[35] bg-brand-navy/35 backdrop-blur-[2px] md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main
        key={pathname}
        className="animate-page-in relative z-10 flex-1 pt-[var(--header-h)] pb-[calc(3.25rem+env(safe-area-inset-bottom))] sm:pb-16"
      >
        {children ?? <Outlet />}
      </main>

      <footer className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-white/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl [transform:translate3d(0,0,0)] [backface-visibility:hidden] sm:py-2.5">
        <div className="page-container flex items-center justify-between gap-2 text-xs text-brand-navy/75">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="shrink-0">
              <BrandLogo size="compact" />
            </div>
            <p className="hidden truncate border-l border-border/80 pl-2.5 text-[11px] text-brand-navy/70 md:block">
              Cebu local time (Asia/Manila · UTC+8)
            </p>
          </div>
          <nav
            aria-label="Footer links"
            className="flex shrink-0 items-center gap-x-3 text-xs font-bold sm:gap-x-4"
          >
            <Link
              to="/events"
              className="inline-flex h-7 items-center whitespace-nowrap transition-colors hover:text-brand-primary"
            >
              <span className="sm:hidden">Events</span>
              <span className="hidden sm:inline">Browse Events</span>
            </Link>
            <Link
              to="/lookup"
              className="inline-flex h-7 items-center whitespace-nowrap transition-colors hover:text-brand-primary"
            >
              <span className="sm:hidden">Ticket</span>
              <span className="hidden sm:inline">Find My Ticket</span>
            </Link>
            <Link
              to={staffDestination}
              className="inline-flex h-7 items-center whitespace-nowrap transition-colors hover:text-brand-primary"
            >
              <span className="sm:hidden">{isAuthenticated ? 'Staff' : 'Sign In'}</span>
              <span className="hidden sm:inline">{staffLabel}</span>
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
