import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from 'lucide-react'
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
  const { isAuthenticated, isLoading, staff, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fromPath =
    (location.state as { from?: string } | null)?.from &&
    !(location.state as { from?: string } | null)?.from?.startsWith('/staff/login')
      ? (location.state as { from: string }).from
      : null

  const getDefaultDestination = (role?: string) =>
    role === 'DOOR_STAFF' ? '/staff/check-in' : '/staff/dashboard'

  const redirectTo = fromPath ?? getDefaultDestination(staff?.role)

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
      const signedInStaff = await login({
        username: values.username.trim(),
        password: values.password,
      })
      navigate(fromPath ?? getDefaultDestination(signedInStaff.role), { replace: true })
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
    <div className="relative flex min-h-svh flex-col overflow-x-clip">
      <AmbientBackdrop />
      {/* Same header bar as the public site and staff portal */}
      <header className={siteHeaderClass}>
        <div className={siteHeaderInnerClass}>
          <Link to="/" className="shrink-0">
            <BrandLogo />
          </Link>
          <Link
            to="/"
            className={headerPillClass}
            aria-label="Back to Home"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span>
              <span className="hidden min-[360px]:inline">Back to </span>Home
            </span>
          </Link>
        </div>
      </header>

      {/* Main Split Stage */}
      <main className="page-container relative z-10 flex flex-1 flex-col justify-center pt-[calc(var(--header-h)+0.75rem)] pb-4 sm:py-6 sm:pt-[calc(var(--header-h)+1.5rem)] lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
        {/* Desktop Brand + Animated Floating Dialog Showcase */}
        <div className="hidden lg:col-span-7 lg:flex lg:flex-col lg:items-start lg:gap-8">
          <div className="animate-rise space-y-2.5">
            <span className="font-code block text-sm font-bold uppercase tracking-[0.32em] text-brand-navy/60">
              THE
            </span>
            <p className="font-heading bg-gradient-to-r from-brand-navy via-brand-primary to-[#5B8EFF] bg-clip-text pb-1 text-5xl font-extrabold leading-none tracking-tight text-transparent xl:text-[54px]">
              EventRegister
            </p>
            <p className="font-code text-xs font-bold uppercase tracking-[0.24em] text-brand-navy/65 sm:text-sm">
              Staff Portal · Asia/Manila (UTC+8)
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            {SHOWCASE_BUBBLES.map((bubble) => (
              <div
                key={bubble.text}
                className={`animate-bubble-in ${bubble.delay} ${bubble.opacity} w-fit rounded-2xl border border-white/80 px-5 py-3 text-sm font-semibold backdrop-blur-md`}
              >
                {bubble.text}
              </div>
            ))}
          </div>
        </div>

        {/* Floating White Staff Login Card */}
        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <div className="animate-card-float-in w-full max-w-[380px] rounded-[var(--radius-card)] border border-border/90 bg-white p-3.5 shadow-card sm:max-w-[400px] sm:p-6">
            <div className="border-b border-border/75 pb-2.5 text-center sm:pb-3.5">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-[10px] border border-brand-sky bg-sky-50 text-brand-primary sm:h-10 sm:w-10">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="section-eyebrow mt-2 sm:mt-2.5">Staff Portal · UTC+8</p>
              <h1 className="heading-section mt-0.5 font-heading font-extrabold text-brand-navy">
                Sign in to EventRegister
              </h1>
              <p className="section-subtitle mt-0.5 sm:mt-1">
                Organizer &amp; door staff access for check-in and event tools.
              </p>
            </div>

            {submitError && (
              <div className="mt-2.5 sm:mt-3">
                <Alert tone="error" title="Sign-in failed">
                  {submitError}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3" noValidate>
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
                  placeholder="Enter your username"
                  leftIcon={<User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
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
                    className="pr-10"
                    leftIcon={<Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    hasError={Boolean(errors.password)}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-brand-navy/60 transition-colors hover:bg-page hover:text-brand-navy"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </button>
                </div>
              </FormField>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-electric mt-1 inline-flex h-[var(--control-h)] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-bold text-white"
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

            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 border-t border-border/70 pt-3 text-center text-xs text-brand-navy/75 sm:text-sm">
              <span>Need an attendee QR pass?</span>
              <Link
                to="/lookup"
                className="font-bold text-brand-primary transition-colors hover:underline"
              >
                Find My Ticket →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
