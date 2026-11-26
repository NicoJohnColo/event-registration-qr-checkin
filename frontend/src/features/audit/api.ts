import { apiRequest } from '../../lib/apiClient'
import { getStoredToken } from '../auth/storage'
import type { AuditLogEntry } from './types'

export async function fetchAuditLogs(limit = 200): Promise<AuditLogEntry[]> {
  const token = getStoredToken()
  return apiRequest<AuditLogEntry[]>(`/api/staff/audit-logs?limit=${limit}`, {
    token,
  })
}
