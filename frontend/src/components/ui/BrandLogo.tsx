export function BrandLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-2.5 select-none">
      {/* 4-diamond geometric mark inspired by the brand reference */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        <rect
          x="16"
          y="3"
          width="8.5"
          height="8.5"
          rx="2"
          transform="rotate(45 16 3)"
          stroke="#00F0FF"
          strokeWidth="2.4"
        />
        <rect
          x="9.5"
          y="9.5"
          width="8.5"
          height="8.5"
          rx="2"
          transform="rotate(45 9.5 9.5)"
          stroke="#40E0D0"
          strokeWidth="2.4"
        />
        <rect
          x="22.5"
          y="9.5"
          width="8.5"
          height="8.5"
          rx="2"
          transform="rotate(45 22.5 9.5)"
          stroke={inverted ? 'rgba(255,255,255,0.65)' : '#CBD5E1'}
          strokeWidth="2.4"
        />
        <rect
          x="16"
          y="16"
          width="8.5"
          height="8.5"
          rx="2"
          transform="rotate(45 16 16)"
          stroke={inverted ? '#CBE9FD' : '#1951FC'}
          strokeWidth="2.4"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={`font-heading text-lg font-black tracking-tight ${
            inverted ? 'text-white' : 'text-brand-navy'
          }`}
        >
          EventRegister
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
            inverted ? 'text-brand-sky/90' : 'text-brand-primary'
          }`}
        >
          Cebu · QR Pass
        </span>
      </span>
    </span>
  )
}
