export function BrandLogo({
  inverted = false,
  size = 'default',
}: {
  inverted?: boolean
  size?: 'default' | 'compact'
}) {
  const isCompact = size === 'compact'

  return (
    <span
      className={`inline-flex items-center select-none ${
        isCompact ? 'gap-1.5' : 'gap-2 sm:gap-2.5'
      }`}
    >
      {/* 4-diamond geometric mark inspired by the brand reference */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`shrink-0 ${
          isCompact ? 'h-[18px] w-[18px] sm:h-[21px] sm:w-[21px]' : 'h-7 w-7 sm:h-8 sm:w-8'
        }`}
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
          className={`font-heading font-extrabold tracking-tight ${
            isCompact
              ? 'text-[12.5px] sm:text-[14px]'
              : 'text-[16px] sm:text-[18px]'
          } ${inverted ? 'text-white' : 'text-brand-navy'}`}
        >
          EventRegister
        </span>
        <span
          className={`mt-0.5 font-bold uppercase tracking-[0.12em] ${
            isCompact ? 'text-[8px] sm:text-[8.5px]' : 'text-[9.5px] sm:text-[10px]'
          } ${inverted ? 'text-brand-sky/90' : 'text-brand-primary'}`}
        >
          Cebu · QR Pass
        </span>
      </span>
    </span>
  )
}
