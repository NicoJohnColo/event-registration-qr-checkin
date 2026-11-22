import { useQuery } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { apiRequest } from '../lib/apiClient'
import type { HealthResponse } from '../types/api'

function PhaseZeroHome() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiRequest<HealthResponse>('/api/health'),
  })

  return (
    <div className="min-h-screen bg-page">
      <header className="bg-sky-hero border-b border-border/70 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
            EventRegister · Phase 0 Foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-navy sm:text-4xl">
            Cebu Events &amp; QR Check-in
          </h1>
          <p className="mt-2 text-base text-brand-navy/80">
            Calm at the door, clear at a glance. Verifying backend, Supabase database, and Asia/Manila clock.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-[20px] border border-border bg-surface p-6 shadow-card">
          <h2 className="text-lg font-semibold text-brand-navy">System Health Check</h2>

          {isLoading && (
            <div className="mt-4 flex items-center gap-2 text-brand-navy/70">
              <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
              <span>Connecting to backend API...</span>
            </div>
          )}

          {isError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-status-red/30 bg-red-50 p-4 text-status-red">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Backend Unreachable</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            </div>
          )}

          {data && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-status-green/30 bg-green-50 p-4 text-status-green">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="font-semibold">Connected — Status: {data.status}</span>
              </div>
              <dl className="grid grid-cols-1 gap-3 pt-2 text-sm sm:grid-cols-3">
                <div className="rounded-xl bg-page p-3">
                  <dt className="text-brand-navy/60">Database</dt>
                  <dd className="mt-1 font-semibold text-brand-navy">{data.database}</dd>
                </div>
                <div className="rounded-xl bg-page p-3">
                  <dt className="text-brand-navy/60">Timezone</dt>
                  <dd className="mt-1 font-semibold text-brand-navy">{data.zone}</dd>
                </div>
                <div className="rounded-xl bg-page p-3">
                  <dt className="text-brand-navy/60">Server Time</dt>
                  <dd className="mt-1 font-code text-xs font-medium text-brand-navy">{data.serverTime}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhaseZeroHome />} />
      </Routes>
    </BrowserRouter>
  )
}
