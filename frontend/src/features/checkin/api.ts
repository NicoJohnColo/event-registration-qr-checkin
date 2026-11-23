import { apiRequest } from '../../lib/apiClient'
import type { CheckInPayload, CheckInResponse, CheckInStats } from './types'

export function submitCheckIn(payload: CheckInPayload, token: string): Promise<CheckInResponse> {
  return apiRequest<CheckInResponse>('/api/checkin', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}

export function fetchCheckInStats(eventId: number, token: string): Promise<CheckInStats> {
  return apiRequest<CheckInStats>(`/api/checkin/stats?eventId=${eventId}`, {
    method: 'GET',
    token,
  })
}
