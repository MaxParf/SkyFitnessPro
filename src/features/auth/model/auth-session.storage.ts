import type { AuthSession } from './auth-session.types'

const authSessionStorageKey = 'skyfitnesspro.auth'

type StoredAuthSession = {
  email: string
  token: string
  username: string
}

export function saveAuthSession(session: AuthSession): void {
  const storedSession: StoredAuthSession = {
    email: session.email,
    token: session.token,
    username: session.username,
  }

  window.localStorage.setItem(authSessionStorageKey, JSON.stringify(storedSession))
}

export function loadAuthSession(): AuthSession | null {
  const storedSessionText = window.localStorage.getItem(authSessionStorageKey)

  if (!storedSessionText) {
    return null
  }

  try {
    const parsedSession = JSON.parse(storedSessionText) as Partial<StoredAuthSession>

    if (
      typeof parsedSession.email !== 'string' ||
      typeof parsedSession.token !== 'string' ||
      typeof parsedSession.username !== 'string' ||
      !parsedSession.email ||
      !parsedSession.token ||
      !parsedSession.username
    ) {
      clearAuthSession()
      return null
    }

    return {
      displayName: parsedSession.username,
      email: parsedSession.email,
      token: parsedSession.token,
      username: parsedSession.username,
    }
  } catch {
    clearAuthSession()
    return null
  }
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(authSessionStorageKey)
}
