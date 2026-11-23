import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { BrandLogo } from '../../components/ui/BrandLogo'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { loginSchema, useAuth, type LoginFormValues } from '../../features/auth'
import { ApiClientError } from '../../lib/apiClient'

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
      <div className="bg-sky-header flex min-h-screen items-center justify-center px-4">
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
    <div className="bg-sky-header flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="flex justify-center">
          <Link to="/">
            <BrandLogo />
          </Link>
        </div>

        <div className="rounded-[24px] border border-border bg-surface p-6 shadow-dock sm:p-8">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-brand-primary ring-1 ring-brand-sky">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Staff Access Only</span>
            </span>
            <h1 className="mt-3 font-heading text-2xl font-black text-brand-navy">
              Staff Sign In
            </h1>
            <p className="mt-1 text-sm text-brand-navy/70">
              Sign in with your organizer or door staff account to open check-in and attendee tools.
            </p>
          </div>

          {submitError && (
            <div className="mb-5">
              <Alert tone="error" title="Sign-in failed">
                {submitError}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                placeholder="organizer"
                leftIcon={<User className="h-4 w-4" />}
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
                  className="pr-11"
                  leftIcon={<Lock className="h-4 w-4" />}
                  hasError={Boolean(errors.password)}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-brand-navy/55 transition-colors hover:bg-page hover:text-brand-navy"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to public events</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
