/**
 * Single source of truth for the top navigation bar so the public site, the
 * staff portal and the staff sign-in screen all share one fixed header look.
 */
export const siteHeaderClass =
  'fixed top-0 inset-x-0 z-40 border-b border-border bg-white/95 text-brand-navy backdrop-blur-xl [transform:translate3d(0,0,0)] [backface-visibility:hidden]'

export const siteHeaderInnerClass =
  'page-container flex h-[var(--header-h)] items-center justify-between gap-2'

/** Outlined pill used for secondary header actions (e.g. "Back to Home", "Staff Sign In"). */
export const headerPillClass =
  'inline-flex h-8.5 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-white px-2.5 text-xs font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20'
