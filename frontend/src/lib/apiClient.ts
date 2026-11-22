import { API_URL } from './constants'
import type { ApiErrorResponse } from '../types/api'

export class ApiClientError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null
}

/**
 * Thin fetch wrapper that prefixes VITE_API_URL, attaches JWT when provided,
 * and normalizes backend ApiError JSON into ApiClientError.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options
  const mergedHeaders = new Headers(headers)

  if (rest.body && !mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json')
  }
  if (token) {
    mergedHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  })

  if (!response.ok) {
    let payload: Partial<ApiErrorResponse> | null = null
    try {
      payload = (await response.json()) as Partial<ApiErrorResponse>
    } catch {
      // Fall back to status text if body is empty or non-JSON
    }
    throw new ApiClientError(
      response.status,
      payload?.message || response.statusText || 'Request failed',
      payload?.fieldErrors ?? {},
    )
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}
