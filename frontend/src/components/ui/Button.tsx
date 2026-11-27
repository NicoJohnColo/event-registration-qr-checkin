import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'btn-primary-gloss text-white border border-transparent hover:-translate-y-[1px] active:translate-y-0',
  secondary:
    'bg-brand-sky/55 text-brand-navy hover:bg-brand-sky/85 border border-brand-sky-end/70',
  outline:
    'bg-surface text-brand-navy hover:bg-page hover:border-brand-sky-end border border-border',
  ghost:
    'bg-transparent text-brand-navy hover:bg-brand-sky/40 border border-transparent',
  danger:
    'bg-surface text-status-red hover:bg-red-50 border border-status-red/40',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-[var(--control-h-sm)] px-2.5 text-[11px] sm:px-3 sm:text-xs rounded-[var(--radius-control)]',
  md: 'h-[var(--control-h)] px-3 text-xs sm:px-3.5 sm:text-sm rounded-[var(--radius-control)]',
  lg: 'h-9.5 px-3.5 text-xs sm:h-11 sm:px-4 sm:text-sm rounded-[var(--radius-control)]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/20 active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:bg-none disabled:text-slate-500 disabled:border-slate-300 disabled:shadow-none disabled:translate-y-0 disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
