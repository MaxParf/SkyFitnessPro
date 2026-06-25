import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { AuthSession } from '@features/auth/model/auth-session.types'

import { AppHeader } from './AppHeader'

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

function renderAppHeader(
  session: AuthSession | null = null,
  isProfileDropdownOpen = false,
  handlers = {
    onLoginClick: jest.fn(),
    onLogout: jest.fn(),
    onProfileClick: jest.fn(),
    onProfileDropdownClose: jest.fn(),
    onProfileNavigate: jest.fn(),
  },
) {
  return {
    handlers,
    ...render(
      <AppHeader
        authSession={session}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLoginClick={handlers.onLoginClick}
        onLogout={handlers.onLogout}
        onProfileClick={handlers.onProfileClick}
        onProfileDropdownClose={handlers.onProfileDropdownClose}
        onProfileNavigate={handlers.onProfileNavigate}
      />,
    ),
  }
}

describe('AppHeader', () => {
  it('renders brand and opens login from unauthenticated header', async () => {
    const user = userEvent.setup()
    const { handlers } = renderAppHeader()

    expect(screen.getByLabelText('SkyFitnessPro')).toBeInTheDocument()
    expect(screen.getByText('Онлайн-тренировки для занятий дома')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(handlers.onLoginClick).toHaveBeenCalledTimes(1)
  })

  it('renders user trigger and profile dropdown actions', async () => {
    const user = userEvent.setup()
    const { handlers } = renderAppHeader(authSession, true)

    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    expect(handlers.onProfileClick).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Мой профиль' }))
    expect(handlers.onProfileNavigate).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Выйти' }))
    expect(handlers.onLogout).toHaveBeenCalledTimes(1)
  })
})
