const TOKEN_KEY = 'eventreg:staff_token'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore storage errors
  }
}
