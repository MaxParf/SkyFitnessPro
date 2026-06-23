import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import type { CourseId } from '@entities/course/model/course.types'
import type { AuthSession } from '@features/auth/model/auth-session.types'

import { ProfilePage } from './ProfilePage'

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

function LocationView() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

function renderProfilePage(
  session: AuthSession | null = authSession,
  onLogout = jest.fn(),
  selectedCourseIds: CourseId[] = ['ab1c3f', 'kfpq8e', 'ypox9r'],
) {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route
          path="/profile"
          element={
            <ProfilePage
              authSession={session}
              onLogout={onLogout}
              onRemoveCourse={jest.fn()}
              selectedCourseIds={selectedCourseIds}
            />
          }
        />
        <Route path="/" element={<LocationView />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  it('renders user data and profile course cards', () => {
    renderProfilePage()

    expect(screen.getByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Мои курсы' })).toBeInTheDocument()
    expect(screen.getByText('ivan')).toBeInTheDocument()
    expect(screen.getByText('Логин: ivan')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Йога' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Стретчинг' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Фитнес' })).toBeInTheDocument()
  })

  it('handles missing auth session gracefully', () => {
    renderProfilePage(null)

    expect(screen.getByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
    expect(
      screen.getByText('Войдите, чтобы посмотреть данные профиля и приобретённые курсы.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'На главную' })).toBeInTheDocument()
  })

  it('renders empty purchased courses state when no courses are selected', () => {
    renderProfilePage(authSession, jest.fn(), [])

    expect(screen.getByText('У вас пока нет приобретённых курсов.')).toBeInTheDocument()
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
