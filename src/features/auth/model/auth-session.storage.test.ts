import { clearAuthSession, loadAuthSession, saveAuthSession } from './auth-session.storage'
import type { AuthSession } from './auth-session.types'

const storageKey = 'skyfitnesspro.auth'

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

describe('auth-session.storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('saves minimal auth session data without password', () => {
    saveAuthSession(authSession)

    expect(window.localStorage.getItem(storageKey)).toBe(
      JSON.stringify({
        email: 'ivan@example.com',
        token: 'jwt-token',
        username: 'ivan',
      }),
    )
    expect(window.localStorage.getItem(storageKey)).not.toContain('password')
  })

  it('loads auth session from localStorage', () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        email: 'ivan@example.com',
        token: 'jwt-token',
        username: 'ivan',
      }),
    )

    expect(loadAuthSession()).toEqual(authSession)
  })

  it('clears broken JSON and returns null', () => {
    window.localStorage.setItem(storageKey, '{broken-json')

    expect(loadAuthSession()).toBeNull()
    expect(window.localStorage.getItem(storageKey)).toBeNull()
  })

  it('clears missing required fields and returns null', () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        email: 'ivan@example.com',
        username: 'ivan',
      }),
    )

    expect(loadAuthSession()).toBeNull()
    expect(window.localStorage.getItem(storageKey)).toBeNull()
  })

  it('clears auth session', () => {
    saveAuthSession(authSession)

    clearAuthSession()

    expect(window.localStorage.getItem(storageKey)).toBeNull()
  })
})
