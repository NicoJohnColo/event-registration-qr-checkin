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

  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold leading-none transition-all duration-150 ${
      isActive
        ? 'bg-sky-50 text-brand-primary shadow-xs ring-1 ring-brand-sky'
        : 'text-brand-navy/75 hover:bg-page hover:text-brand-navy'
    }`

  const mobileNavItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-full min-h-[44px] items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
      isActive
        ? 'bg-sky-50 text-brand-primary ring-1 ring-brand-sky'
        : 'text-brand-navy/85 hover:bg-page hover:text-brand-navy'
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
            <NavLink to="/how-it-works" className={navLinkClass}>
              How It Works
            </NavLink>
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-brand-navy transition-colors hover:bg-page md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="animate-slide-down absolute inset-x-0 top-full z-50 max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-border/80 bg-white px-4 py-4 shadow-xl md:hidden">
            <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
              <NavLink to="/" end className={mobileNavItemClass} onClick={() => setMobileOpen(false)}>
                <span className="inline-flex items-center gap-3">
                  <Home className="h-4 w-4 shrink-0 text-brand-primary" />
                  <span>Home</span>
                </span>
                <ChevronRight className="h-4 w-4 text-brand-navy/35" />
              </NavLink>

              <NavLink to="/events" className={mobileNavItemClass} onClick={() => setMobileOpen(false)}>
                <span className="inline-flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-brand-primary" />
                  <span>Events</span>
                </span>
                <ChevronRight className="h-4 w-4 text-brand-navy/35" />
              </NavLink>

              <NavLink
                to="/how-it-works"
                className={mobileNavItemClass}
                onClick={() => setMobileOpen(false)}
              >
                <span className="inline-flex items-center gap-3">
                  <PlayCircle className="h-4 w-4 shrink-0 text-brand-primary" />
                  <span>How It Works</span>
                </span>
                <ChevronRight className="h-4 w-4 text-brand-navy/35" />
              </NavLink>

              <NavLink to="/lookup" className={mobileNavItemClass} onClick={() => setMobileOpen(false)}>
                <span className="inline-flex items-center gap-3">
                  <Search className="h-4 w-4 shrink-0 text-brand-primary" />
                  <span>Find My Ticket</span>
                </span>
                <ChevronRight className="h-4 w-4 text-brand-navy/35" />
              </NavLink>

              <div className="mt-2 flex items-center justify-between rounded-xl bg-page px-4 py-2.5 text-xs text-brand-navy/70">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Clock className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Cebu Time (UTC+8)</span>
                </span>
                <span className="font-semibold">12-hour AM/PM</span>
              </div>

              <Link to="/staff/login" className="mt-1.5" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="md" fullWidth>
                  <ShieldCheck className="h-4 w-4 text-brand-primary" />
                  <span>Staff Sign In</span>
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-30 bg-brand-navy/35 backdrop-blur-[2px] md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/80 bg-surface py-8 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 text-sm text-brand-navy/65 sm:flex-row sm:items-center sm:px-6">
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
