import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import type { AuthSession } from '@features/auth/model/auth-session.types'

import { mockFetchPending, mockFetchResponse, mockFetchSuccess } from '../../test/fetchMock'
import { WorkoutPage } from './WorkoutPage'

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

const workoutDto = {
  _id: 'a1rqtt',
  exercises: [
    {
      _id: 'exercise-1',
      name: 'Наклоны вперед',
      quantity: 15,
    },
    {
      _id: 'exercise-2',
      name: 'Наклоны назад',
      quantity: 12,
    },
    {
      _id: 'exercise-3',
      name: 'Поднятие ног',
      quantity: 10,
    },
  ],
  name: 'Урок 2. Основные движения',
  video: 'https://www.youtube.com/embed/gJPs7b8SpVw',
}

function renderWorkoutPage(session: AuthSession | null = authSession, workoutId = 'a1rqtt') {
  return render(
    <MemoryRouter initialEntries={[`/workouts/${workoutId}`]}>
      <Routes>
        <Route
          path="/workouts/:workoutId"
          element={
            <WorkoutPage
              authSession={session}
              isProfileDropdownOpen={false}
              onLoginClick={jest.fn()}
              onLogout={jest.fn()}
              onProfileClick={jest.fn()}
              onProfileDropdownClose={jest.fn()}
              onProfileNavigate={jest.fn()}
            />
          }
        />
        <Route path="/" element={<p>Главная</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('WorkoutPage', () => {
  it('reads workoutId from route params and loads workout details', async () => {
    const fetchMock = mockFetchSuccess(workoutDto)

    renderWorkoutPage()

    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/workouts/a1rqtt',
      expect.objectContaining({
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'GET',
      }),
    )
  })

  it('renders video preview and accessible play button', async () => {
    const user = userEvent.setup()
    mockFetchSuccess(workoutDto)

    renderWorkoutPage()

    expect(await screen.findByLabelText('Видео тренировки')).toBeInTheDocument()

    const playButton = screen.getByRole('button', { name: 'Воспроизвести видео тренировки' })

    expect(playButton).toBeInTheDocument()
    await user.click(playButton)
    expect(playButton).toBeInTheDocument()
  })

  it('renders exercises card, rows, and fill progress button', async () => {
    mockFetchSuccess(workoutDto)

    renderWorkoutPage()

    expect(
      await screen.findByRole('heading', { name: 'Упражнения урок 2. основные движения' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Наклоны вперед 0%')).toBeInTheDocument()
    expect(screen.getByText('Наклоны назад 0%')).toBeInTheDocument()
    expect(screen.getByText('Поднятие ног 0%')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Заполнить свой прогресс' })).toBeInTheDocument()
  })

  it('renders loading state while workout is loading', () => {
    mockFetchPending()

    renderWorkoutPage()

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка...')
  })

  it('renders error state when workout load fails or id is missing', async () => {
    mockFetchResponse({ message: 'Тренировка не найдена' }, 404)

    renderWorkoutPage(authSession, 'missing-id')

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить тренировку')
  })

  it('renders empty state when workout has no exercises', async () => {
    mockFetchSuccess({
      ...workoutDto,
      exercises: [],
    })

    renderWorkoutPage()

    expect(await screen.findByText('Для этой тренировки пока нет упражнений.')).toBeInTheDocument()
  })

  it('handles direct opening without auth session gracefully', () => {
    const fetchMock = mockFetchPending()

    renderWorkoutPage(null)

    expect(screen.getByRole('alert')).toHaveTextContent('Войдите, чтобы открыть тренировку')
    expect(screen.getByRole('link', { name: 'На главную' })).toHaveAttribute('href', '/')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
