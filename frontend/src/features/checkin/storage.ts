import type { CheckInResponse } from './types'

const CHECKIN_SESSION_KEY = 'eventreg:checkin_session'

export interface CheckInSessionState {
  selectedEventId: number | null
  lastResult: CheckInResponse | null
  recentScans: CheckInResponse[]
}

const EMPTY_STATE: CheckInSessionState = {
  selectedEventId: null,
  lastResult: null,
  recentScans: [],
}

export function readCheckInSession(): CheckInSessionState {
  try {
    const raw = sessionStorage.getItem(CHECKIN_SESSION_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<CheckInSessionState>
    return {
      selectedEventId: typeof parsed.selectedEventId === 'number' ? parsed.selectedEventId : null,
      lastResult: parsed.lastResult ?? null,
      recentScans: Array.isArray(parsed.recentScans) ? parsed.recentScans : [],
    }
  } catch {
    return EMPTY_STATE
  }
}

export function saveCheckInSession(state: CheckInSessionState): void {
  try {
    sessionStorage.setItem(CHECKIN_SESSION_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage quota errors
  }
}

export function clearCheckInSession(): void {
  try {
    sessionStorage.removeItem(CHECKIN_SESSION_KEY)
  } catch {
    // Ignore storage errors
  }
}
