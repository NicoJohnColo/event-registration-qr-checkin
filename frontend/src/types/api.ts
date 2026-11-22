export interface ApiErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  fieldErrors?: Record<string, string> | null
}

export interface HealthResponse {
  status: string
  database: string
  zone: string
  serverTime: string
}
