import { apiRequest } from '../../lib/apiClient'
import type { LoginPayload, LoginResponse, StaffProfile } from './types'

export function loginStaff(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchStaffMe(token: string): Promise<StaffProfile> {
  return apiRequest<StaffProfile>('/api/auth/me', {
    method: 'GET',
    token,
  })
}
