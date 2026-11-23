import {
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  ScanLine,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuth } from '../features/auth'

export function StaffLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { staff, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  const handleSignOut = () => {
    logout()
    navigate('/staff/login', { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-white/15 text-white'
        : 'text-brand-sky/85 hover:bg-white/10 hover:text-white'
    }`

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
      isActive
        ? 'bg-sky-50 text-brand-primary ring-1 ring-brand-sky'
        : 'text-brand-navy/85 hover:bg-page hover:text-brand-navy'
    }`

  const roleLabel = staff?.role === 'DOOR_STAFF' ? 'Door Staff' : 'Organizer'

  return (
    <div className="flex min-h-screen flex-col bg-page text-brand-navy">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-navy text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/staff/check-in" className="shrink-0">
              <BrandLogo inverted />
            </Link>
            <span className="hidden rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-cyan sm:inline-block">
              Staff Portal
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Staff navigation">
            <NavLink to="/staff/check-in" className={navLinkClass}>
              <ScanLine className="h-4 w-4 shrink-0" />
              <span>Check-In</span>
            </NavLink>
            <NavLink to="/staff/attendees" className={navLinkClass}>
              <Users className="h-4 w-4 shrink-0" />
              <span>Attendees</span>
            </NavLink>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {staff && (
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs">
                <span className="font-bold text-white">{staff.name}</span>
                <span className="rounded-full bg-brand-cyan/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-cyan">
                  {roleLabel}
                </span>
              </div>
            )}

            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-sky hover:text-white"
            >
              <span>Public Site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close staff menu' : 'Open staff menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-border/80 bg-white px-4 py-4 text-brand-navy shadow-xl md:hidden">
            {staff && (
              <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-page px-4 py-2.5">
                <div>
                  <p className="text-sm font-extrabold text-brand-navy">{staff.name}</p>
                  <p className="text-xs text-brand-navy/60">@{staff.username}</p>
                </div>
                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-brand-primary ring-1 ring-brand-sky">
                  {roleLabel}
                </span>
              </div>
            )}

            <nav className="flex flex-col gap-1.5" aria-label="Mobile staff navigation">
              <NavLink to="/staff/check-in" className={mobileNavClass}>
                <span className="inline-flex items-center gap-3">
                  <ScanLine className="h-4 w-4 shrink-0 text-brand-primary" />
                  <span>Check-In</span>
                </span>
                <ChevronRight className="h-4 w-4 text-brand-navy/35" />
              </NavLink>

              <NavLink to="/staff/attendees" className={mobileNavClass}>
                <span className="inline-flex items-center gap-3">
                  <Users className="h-4 w-4 shrink-0 text-brand-primary" />
                  <span>Attendees</span>
                </span>
                <ChevronRight className="h-4 w-4 text-brand-navy/35" />
              </NavLink>

              <Link
                to="/"
                className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-brand-navy/80 hover:bg-page"
              >
                <span className="inline-flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 shrink-0 text-brand-primary" />
                  <span>Public Site</span>
                </span>
                <ChevronRight className="h-4 w-4 text-brand-navy/35" />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="mt-1.5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-status-red/30 bg-red-50 px-4 py-2.5 text-sm font-bold text-status-red transition-colors hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
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

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
