import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { AmbientBackdrop } from '../../components/ui/AmbientBackdrop'
import { BrandLogo } from '../../components/ui/BrandLogo'
import { FormField } from '../../components/ui/FormField'
import { headerPillClass, siteHeaderClass, siteHeaderInnerClass } from '../../components/ui/siteHeader'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { loginSchema, useAuth, type LoginFormValues } from '../../features/auth'
import { ApiClientError } from '../../lib/apiClient'

const SHOWCASE_BUBBLES = [
  { text: 'Door check-in is open for today.', opacity: 'bg-white/45 text-brand-navy/60', delay: 'delay-75' },
  { text: 'Live seat & attendance counters synced.', opacity: 'bg-white/65 text-brand-navy/75', delay: 'delay-150' },
  { text: 'Ready to scan QR passes in Cebu.', opacity: 'bg-white/85 text-brand-navy/85', delay: 'delay-225' },
  { text: 'Please verify your staff identity first.', opacity: 'bg-white text-brand-navy shadow-card', delay: 'delay-300' },
] as const

export function StaffLoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const redirectTo =
    (location.state as { from?: string } | null)?.from &&
    !(location.state as { from?: string } | null)?.from?.startsWith('/staff/login')
      ? (location.state as { from: string }).from
      : '/staff/check-in'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  if (isLoading) {
    return (
      <div className="bg-login-canvas flex min-h-svh items-center justify-center px-4">
        <Spinner label="Checking staff session..." />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null)
    try {
      await login({
        username: values.username.trim(),
        password: values.password,
      })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError && Object.keys(err.fieldErrors).length > 0) {
        Object.entries(err.fieldErrors).forEach(([field, message]) => {
          if (field === 'username' || field === 'password') {
            setError(field, { message })
          }
        })
        return
      }
      setSubmitError(
        err instanceof Error && err.message ? err.message : 'Invalid username or password.',
      )
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
      <AmbientBackdrop />
      {/* Same header bar as the public site and staff portal */}
      <header className={siteHeaderClass}>
        <div className={siteHeaderInnerClass}>
          <Link to="/" className="shrink-0">
            <BrandLogo />
          </Link>
          <Link to="/" className={headerPillClass} aria-label="Back to Home">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>
              <span className="hidden min-[360px]:inline">Back to </span>Home
            </span>
          </Link>
        </div>
      </header>

      {/* Main Split Stage */}
      <main className="page-container relative z-10 flex flex-1 flex-col justify-center gap-4 py-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
        {/* Desktop Brand + Animated Floating Dialog Showcase */}
        <div className="hidden lg:col-span-7 lg:flex lg:flex-col lg:items-start lg:gap-8">
          <div className="animate-rise space-y-2.5">
            <span className="font-code block text-sm font-bold uppercase tracking-[0.32em] text-brand-navy/60">
              THE
            </span>
            <p className="font-heading bg-gradient-to-r from-brand-navy via-brand-primary to-[#5B8EFF] bg-clip-text pb-1 text-6xl font-black leading-none tracking-tight text-transparent xl:text-[68px]">
              EventRegister
            </p>
            <p className="font-code text-sm font-bold uppercase tracking-[0.24em] text-brand-navy/65">
              Staff Portal · Asia/Manila (UTC+8)
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            {SHOWCASE_BUBBLES.map((bubble) => (
              <div
                key={bubble.text}
                className={`animate-bubble-in ${bubble.delay} ${bubble.opacity} w-fit rounded-2xl border border-white/80 px-5 py-3 text-sm font-semibold backdrop-blur-md xl:text-[15px]`}
              >
                {bubble.text}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Compact Glass Status Pill */}
        <div className="flex justify-center lg:hidden">
          <div className="animate-bubble-in inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/85 bg-white/85 px-2.5 py-1 text-[11px] font-bold text-brand-navy shadow-xs backdrop-blur-md">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-brand-primary" />
            <span className="truncate">Verify your staff identity to open check-in</span>
          </div>
        </div>

        {/* Right Floating Pure-White Login Card */}
        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <div className="animate-card-float-in w-full max-w-[360px] rounded-[var(--radius-card)] border border-white/90 bg-white/95 p-3.5 shadow-card backdrop-blur-xl sm:max-w-[390px] sm:p-5">
            <div>
              <h1 className="heading-card font-heading font-extrabold text-brand-navy">
                Sign in to EventRegister
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-border/70">
                <span className="border-b-2 border-brand-primary pb-1.5 text-xs font-bold text-brand-navy">
                  Staff Login
                </span>
                <span className="inline-flex min-w-0 items-center gap-1 pb-1.5 text-[10.5px] font-semibold text-brand-navy/65">
                  <Sparkles className="h-3 w-3 shrink-0 text-brand-primary" />
                  <span className="truncate">Door &amp; Organizer</span>
                </span>
              </div>
            </div>

            {submitError && (
              <div className="mt-3">
                <Alert tone="error" title="Sign-in failed">
                  {submitError}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-3.5 space-y-3" noValidate>
              <FormField
                label="Username"
                htmlFor="staff-username"
                error={errors.username?.message}
                required
              >
                <Input
                  id="staff-username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Enter username (e.g. organizer)"
                  className="!border-transparent !bg-[#F3F5F9] pr-10 focus:!border-brand-primary focus:!bg-white"
                  leftIcon={<User className="h-3.5 w-3.5" />}
                  hasError={Boolean(errors.username)}
                  {...register('username')}
                />
              </FormField>

              <FormField
                label="Password"
                htmlFor="staff-password"
                error={errors.password?.message}
                required
              >
                <div className="relative">
                  <Input
                    id="staff-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="!border-transparent !bg-[#F3F5F9] pr-16 focus:!border-brand-primary focus:!bg-white"
                    leftIcon={<Lock className="h-3.5 w-3.5" />}
                    hasError={Boolean(errors.password)}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-brand-navy/65 transition-colors hover:bg-white hover:text-brand-navy"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </FormField>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-electric inline-flex h-[var(--control-h)] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-xs font-bold text-white sm:text-[13px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-brand-navy/75">
              Looking for an attendee pass?{' '}
              <Link
                to="/lookup"
                className="inline-flex min-h-[32px] items-center font-bold text-brand-primary hover:underline"
              >
                Find My Ticket
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
