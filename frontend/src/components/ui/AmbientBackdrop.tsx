/**
 * Luminous sky canvas (soft glow orbs + two drifting silk-wave ribbons).
 * Contained: place it inside a `relative overflow-hidden` section (landing hero,
 * login) so it only decorates that section instead of the whole app.
 */
export function AmbientBackdrop() {
  return (
    <div
      className="bg-login-canvas pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="animate-orb absolute -left-24 top-12 h-80 w-80 rounded-full bg-[#93C5FD]/35 blur-3xl sm:h-[460px] sm:w-[460px]" />
      <div className="animate-orb delay-300 absolute -right-20 bottom-6 h-96 w-96 rounded-full bg-[#7CA3FF]/30 blur-3xl sm:h-[520px] sm:w-[520px]" />

      <svg
        viewBox="0 0 1440 700"
        preserveAspectRatio="none"
        className="animate-silk-a absolute inset-x-0 bottom-0 -left-[10%] h-[62%] w-[120%] opacity-80"
      >
        <defs>
          <linearGradient id="silkGradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#608BFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1951FC" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <path
          fill="url(#silkGradA)"
          d="M0,360 C240,510 480,210 760,330 C1040,450 1240,180 1440,260 L1440,700 L0,700 Z"
        />
      </svg>

      <svg
        viewBox="0 0 1440 700"
        preserveAspectRatio="none"
        className="animate-silk-b absolute inset-x-0 bottom-0 -left-[12%] h-[54%] w-[125%] opacity-75"
      >
        <defs>
          <linearGradient id="silkGradB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          fill="url(#silkGradB)"
          d="M0,450 C320,280 560,520 880,360 C1140,230 1310,370 1440,310 L1440,700 L0,700 Z"
        />
      </svg>
    </div>
  )
}
