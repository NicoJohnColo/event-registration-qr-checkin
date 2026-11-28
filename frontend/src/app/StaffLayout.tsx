import {
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  History,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  ScanLine,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/ui/BrandLogo'
import { useAuth } from '../features/auth'

function getInitials(name?: string): string {
  if (!name) return 'ST'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function getSectionLabel(pathname: string): string {
  if (pathname.startsWith('/staff/events') && pathname.includes('/attendees')) {
    return 'Attendee Roster'
  }
  if (pathname.startsWith('/staff/events')) return 'Manage Events'
  if (pathname.startsWith('/staff/audit-logs')) return 'Audit Logs'
  if (pathname.startsWith('/staff/check-in')) return 'Door Check-In'
  if (pathname.startsWith('/staff/attendees')) return 'Attendee Roster'
  return 'Operations Dashboard'
}

export function StaffLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { staff, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileSidebarOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileSidebarOpen])

  const handleSignOut = () => {
    logout()
    navigate('/staff/login', { replace: true })
  }

  const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex h-10 min-h-[40px] items-center gap-2.5 rounded-[var(--radius-control)] px-3 text-[13px] font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20 ${
      isActive
        ? 'bg-white text-brand-primary shadow-sm ring-1 ring-brand-sky'
        : 'text-brand-navy/75 hover:bg-white/65 hover:text-brand-navy'
    }`

  const roleLabel = staff?.role === 'DOOR_STAFF' ? 'Door Staff' : 'Organizer'
  const attendeesActive = pathname.startsWith('/staff/attendees') || pathname.includes('/attendees')
  const isOrganizer = staff?.role === 'ORGANIZER'
  const initials = getInitials(staff?.name)
  const sectionLabel = getSectionLabel(pathname)

  const renderSidebarLinks = (onNavigate?: () => void) => (
    <>
      <p className="px-3 pb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-navy/50">
        Operations
      </p>

      {isOrganizer && (
        <NavLink to="/staff/dashboard" className={sidebarLinkClass} onClick={onNavigate}>
          <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">Dashboard</span>
        </NavLink>
      )}

      {isOrganizer && (
        <NavLink to="/staff/events" className={sidebarLinkClass} onClick={onNavigate}>
          <Calendar className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">Manage Events</span>
        </NavLink>
      )}

      <NavLink to="/staff/check-in" className={sidebarLinkClass} onClick={onNavigate}>
        <ScanLine className="h-[18px] w-[18px] shrink-0" />
        <span className="truncate">Door Check-In</span>
      </NavLink>

      <NavLink
        to="/staff/attendees"
        className={({ isActive }) =>
          sidebarLinkClass({ isActive: isActive || attendeesActive })
        }
        onClick={onNavigate}
      >
        <Users className="h-[18px] w-[18px] shrink-0" />
        <span className="truncate">Attendee Roster</span>
      </NavLink>

      {isOrganizer && (
        <NavLink to="/staff/audit-logs" className={sidebarLinkClass} onClick={onNavigate}>
          <History className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate">Audit Logs</span>
        </NavLink>
      )}

      <div className="my-3.5 border-t border-brand-sky/70 pt-3.5">
        <p className="px-3 pb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-navy/50">
          Attendee Portal
        </p>
        <Link
          to="/"
          onClick={onNavigate}
          className="group flex h-10 min-h-[40px] items-center justify-between rounded-[var(--radius-control)] px-3 text-[13px] font-bold text-brand-navy/75 transition-colors hover:bg-white/65 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20"
        >
          <span className="inline-flex items-center gap-2.5">
            <ExternalLink className="h-[18px] w-[18px] shrink-0" />
            <span>Public Site</span>
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-brand-navy/40 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-primary" />
        </Link>
      </div>
    </>
  )

  return (
    <div className="bg-staff-canvas flex min-h-svh flex-col overflow-x-clip text-brand-navy">
      {/* Fixed Static Left Sidebar on Tablet / Desktop (>= 768px) */}
      <aside
        className="bg-sidebar-sky fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-brand-sky/75 shadow-[4px_0_24px_-12px_rgba(25,81,252,0.12)] md:flex"
        aria-label="Staff sidebar"
      >
        <div className="flex h-[60px] shrink-0 items-center border-b border-brand-sky/60 px-4">
          <Link to={isOrganizer ? '/staff/dashboard' : '/staff/check-in'} className="min-w-0 shrink-0 focus-visible:outline-none">
            <BrandLogo />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Staff desktop navigation">
          {renderSidebarLinks()}
        </nav>

        <div className="relative shrink-0 overflow-hidden border-t border-brand-sky/50 px-5 py-5">
          <div
            className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-brand-primary/10 blur-xl"
            aria-hidden="true"
          />
          <p className="font-heading text-xs font-extrabold leading-relaxed text-brand-primary/85">
            Smarter Events.
            <br />
            Instant QR Entry.
            <br />
            Cebu Ready.
          </p>
          <span className="mt-2 inline-block h-0.5 w-7 rounded-full bg-brand-primary/35" />
        </div>
      </aside>

      {/* Mobile Slide-Out Left Sky Sidebar Drawer (< 768px) */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-brand-navy/35 backdrop-blur-[2px] md:hidden"
            aria-hidden="true"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside
            className="bg-sidebar-sky animate-slide-in-left fixed inset-y-0 left-0 z-50 flex w-[240px] max-w-[82vw] flex-col border-r border-brand-sky/80 shadow-2xl md:hidden"
            aria-label="Mobile staff sidebar"
          >
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-brand-sky/60 px-3.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-sky bg-white/85 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
                Staff Portal
              </span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close staff sidebar"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-brand-sky/80 bg-white/80 text-brand-navy transition-colors hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {staff && (
              <div className="mx-3 mt-3 flex items-center gap-2.5 rounded-[var(--radius-control)] border border-brand-sky/80 bg-white/90 px-2.5 py-2 shadow-2xs">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-blue text-[11px] font-extrabold text-white">
                  {initials}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-extrabold text-brand-navy">{staff.name}</p>
                  <p className="truncate text-[11px] font-semibold text-brand-primary">{roleLabel}</p>
                </div>
              </div>
            )}

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3" aria-label="Mobile drawer links">
              {renderSidebarLinks(() => setMobileSidebarOpen(false))}
            </nav>

            <div className="shrink-0 border-t border-brand-sky/60 bg-white/55 p-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-10 min-h-[40px] w-full items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-status-red/30 bg-red-50 px-3 text-xs font-bold text-status-red transition-colors hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Shell */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-[236px]">
        {/* Fixed Desktop Header (>= 768px) */}
        <header className="fixed top-0 right-0 z-20 hidden h-[60px] items-center justify-between gap-4 border-b border-brand-sky/75 bg-white/92 px-5 backdrop-blur-xl [transform:translate3d(0,0,0)] [backface-visibility:hidden] md:left-[236px] md:flex lg:px-7">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-sky bg-sky-50/90 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
              Staff Portal
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-navy/40" aria-hidden="true" />
            <span className="truncate text-sm font-extrabold text-brand-navy">
              {sectionLabel}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="hidden items-center gap-1.5 rounded-full border border-brand-sky/80 bg-page px-2.5 py-1 text-[11px] font-bold text-brand-navy/75 lg:inline-flex">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              <span>Asia/Manila (UTC+8)</span>
            </div>

            {staff && (
              <div className="flex items-center gap-2.5 rounded-full border border-border/90 bg-white py-1 pl-1.5 pr-3 shadow-2xs">
                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-blue text-xs font-extrabold text-white">
                  {initials}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-extrabold text-brand-navy">{staff.name}</p>
                  <p className="text-[11px] font-semibold text-brand-navy/65">{roleLabel}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-10 min-h-[40px] items-center gap-1.5 rounded-[var(--radius-control)] border border-border bg-white px-3 text-xs font-bold text-brand-navy transition-colors hover:border-status-red/40 hover:bg-red-50 hover:text-status-red focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Fixed Compact Mobile Header (< 768px) with Left Sidebar Toggle */}
        <header className="fixed top-0 inset-x-0 z-30 border-b border-brand-sky/75 bg-white/95 text-brand-navy backdrop-blur-xl [transform:translate3d(0,0,0)] [backface-visibility:hidden] md:hidden">
          <div className="page-container flex h-[var(--header-h)] items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open staff sidebar"
                aria-expanded={mobileSidebarOpen}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-brand-sky bg-sky-50/75 text-brand-primary transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20"
              >
                <PanelLeft className="h-4 w-4" />
              </button>

              <Link to={isOrganizer ? '/staff/dashboard' : '/staff/check-in'} className="min-w-0 shrink-0">
                <BrandLogo />
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {staff && (
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Staff account menu"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white p-0.5 text-[11px] font-bold text-brand-navy xs:pr-2.5"
                >
                  <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-blue text-[11px] font-extrabold text-white">
                    {initials}
                  </span>
                  <span className="hidden xs:inline truncate max-w-[85px]">{staff.name}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main
          key={pathname}
          className="animate-page-in relative min-w-0 flex-1 pt-[var(--header-h)] pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pt-[60px] md:pb-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
