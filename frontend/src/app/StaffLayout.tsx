import {
  Calendar,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanLine,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/ui/BrandLogo'
import { siteHeaderClass, siteHeaderInnerClass } from '../components/ui/siteHeader'
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

  const handleSignOut = () => {
    logout()
    navigate('/staff/login', { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex h-8.5 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20 ${
      isActive
        ? 'bg-sky-50 text-brand-primary shadow-xs ring-1 ring-brand-sky'
        : 'text-brand-navy/80 hover:bg-page hover:text-brand-navy'
    }`

  const mobileTabClass = ({ isActive }: { isActive: boolean }) =>
    `flex h-[var(--bottom-nav-h)] flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors ${
      isActive
        ? 'text-brand-primary'
        : 'text-brand-navy/70 hover:text-brand-navy'
    }`

  const roleLabel = staff?.role === 'DOOR_STAFF' ? 'Door Staff' : 'Organizer'
  const attendeesActive = pathname.startsWith('/staff/attendees') || pathname.includes('/attendees')
  const isOrganizer = staff?.role === 'ORGANIZER'

  return (
    <div className="flex min-h-dvh flex-col bg-page text-brand-navy">
      <header className={siteHeaderClass}>
        <div className={siteHeaderInnerClass}>
          <div className="flex items-center gap-2">
            <Link to="/staff/dashboard" className="shrink-0">
              <BrandLogo />
            </Link>
            <span className="hidden rounded-full border border-brand-sky bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-primary sm:inline-block">
              Staff Portal
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Staff navigation">
            <NavLink to="/staff/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </NavLink>

            {isOrganizer && (
              <NavLink to="/staff/events" className={navLinkClass}>
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Events</span>
              </NavLink>
            )}

            <NavLink to="/staff/check-in" className={navLinkClass}>
              <ScanLine className="h-4 w-4 shrink-0" />
              <span>Check-In</span>
            </NavLink>

            <NavLink
              to="/staff/attendees"
              className={({ isActive }) => navLinkClass({ isActive: isActive || attendeesActive })}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Attendees</span>
            </NavLink>
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            {staff && (
              <div className="flex items-center gap-2 rounded-full border border-border bg-white/80 px-2.5 py-1 text-xs">
                <span className="font-bold text-brand-navy">{staff.name}</span>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-primary ring-1 ring-brand-sky">
                  {roleLabel}
                </span>
              </div>
            )}

            <Link
              to="/"
              className="inline-flex h-10 min-h-[40px] items-center gap-1 px-2 text-xs font-bold text-brand-navy/75 hover:text-brand-primary"
            >
              <span>Public Site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-10 min-h-[40px] items-center gap-1.5 rounded-[var(--radius-control)] border border-border bg-white px-3 text-xs font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-border bg-surface text-brand-navy transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close staff menu' : 'Open staff menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="animate-slide-down absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-border/80 bg-white py-2.5 text-brand-navy shadow-xl md:hidden">
            <div className="page-container">
              {staff && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-control)] border border-border bg-page px-3 py-2">
                  <div>
                    <p className="text-xs font-extrabold text-brand-navy">{staff.name}</p>
                    <p className="text-[11px] text-brand-navy/70">@{staff.username}</p>
                  </div>
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-primary ring-1 ring-brand-sky">
                    {roleLabel}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                {isOrganizer && (
                  <Link
                    to="/staff/events"
                    className="flex h-9.5 w-full items-center justify-between rounded-[var(--radius-control)] px-3 text-xs font-bold text-brand-navy/85 hover:bg-page"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                      <span>Manage Events</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-brand-navy/45" />
                  </Link>
                )}

                <Link
                  to="/"
                  className="flex h-9.5 w-full items-center justify-between rounded-[var(--radius-control)] px-3 text-xs font-bold text-brand-navy/85 hover:bg-page"
                >
                  <span className="inline-flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                    <span>Public Site</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-brand-navy/45" />
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-0.5 flex h-9.5 w-full items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-status-red/30 bg-red-50 px-3 text-xs font-bold text-status-red transition-colors hover:bg-red-100"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
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

      <main
        key={pathname}
        className="animate-page-in relative z-10 flex-1 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+16px)] md:pb-8"
      >
        <Outlet />
      </main>

      {/* Fixed 1-tap Mobile Bottom Tab Bar (3 tabs: Dashboard, Check-In, Attendees) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(3,25,91,0.06)] backdrop-blur-md md:hidden"
        aria-label="Mobile staff tabs"
      >
        <NavLink to="/staff/dashboard" className={mobileTabClass}>
          {({ isActive }) => (
            <>
              <span
                className={`inline-flex h-6 w-11 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-sky-50 text-brand-primary' : ''
                }`}
              >
                <LayoutDashboard className="h-[18px] w-[18px]" />
              </span>
              <span>Dashboard</span>
            </>
          )}
        </NavLink>

        <NavLink to="/staff/check-in" className={mobileTabClass}>
          {({ isActive }) => (
            <>
              <span
                className={`inline-flex h-6 w-11 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-sky-50 text-brand-primary' : ''
                }`}
              >
                <ScanLine className="h-[18px] w-[18px]" />
              </span>
              <span>Check-In</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/staff/attendees"
          className={({ isActive }) => mobileTabClass({ isActive: isActive || attendeesActive })}
        >
          {({ isActive }) => {
            const active = isActive || attendeesActive
            return (
              <>
                <span
                  className={`inline-flex h-6 w-11 items-center justify-center rounded-full transition-colors ${
                    active ? 'bg-sky-50 text-brand-primary' : ''
                  }`}
                >
                  <Users className="h-[18px] w-[18px]" />
                </span>
                <span>Attendees</span>
              </>
            )
          }}
        </NavLink>
      </nav>
    </div>
  )
}
