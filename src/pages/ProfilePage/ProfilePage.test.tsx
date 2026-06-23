import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import type { AuthSession } from '@features/auth/model/auth-session.types'

import { ProfilePage } from './ProfilePage'

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
}

function LocationView() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

function renderProfilePage(session: AuthSession | null = authSession, onLogout = jest.fn()) {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route
          path="/profile"
          element={<ProfilePage authSession={session} onLogout={onLogout} />}
        />
        <Route path="/" element={<LocationView />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  it('renders user data and empty purchased courses state', () => {
    renderProfilePage()

    expect(screen.getByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Мои курсы' })).toBeInTheDocument()
    expect(screen.getByText('ivan')).toBeInTheDocument()
    expect(screen.getByText('Логин: ivan')).toBeInTheDocument()
    expect(screen.getByText('У вас пока нет приобретённых курсов.')).toBeInTheDocument()
  })

  it('handles missing auth session gracefully', () => {
    renderProfilePage(null)

    expect(screen.getByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
    expect(
      screen.getByText('Войдите, чтобы посмотреть данные профиля и приобретённые курсы.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'На главную' })).toBeInTheDocument()
  })

  it('logs out and navigates to courses page', async () => {
    const user = userEvent.setup()
    const handleLogout = jest.fn()

    renderProfilePage(authSession, handleLogout)

    await user.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(handleLogout).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })
})
