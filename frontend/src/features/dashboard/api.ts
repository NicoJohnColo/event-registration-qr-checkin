import { apiRequest } from '../../lib/apiClient'
import { API_URL } from '../../lib/constants'
import { getStoredToken } from '../auth/storage'

export interface EventMetrics {
  eventId: number
  title: string
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  codePrefix: string
  venue: string
  startsAt: string
  endsAt: string
  capacity: number
  confirmedCount: number
  waitlistCount: number
  cancelledCount: number
  checkedInCount: number
  noShowCount: number | null
  isStarted: boolean
  isEnded: boolean
}

export async function fetchDashboardMetrics(): Promise<EventMetrics[]> {
  const token = getStoredToken()
  return apiRequest<EventMetrics[]>('/api/staff/dashboard/metrics', {
    token,
  })
}

export async function downloadRosterCsv(eventId: number, eventTitle: string): Promise<void> {
  const token = getStoredToken()
  const res = await fetch(`${API_URL}/api/staff/dashboard/events/${eventId}/export-csv`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    throw new Error('Failed to download attendee roster CSV.')
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')
  a.download = `${safeName}-roster.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
