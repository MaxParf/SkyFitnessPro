import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import type { AuthSession } from '@features/auth/model/auth-session.types'

import {
  createJsonResponse,
  mockFetchPending,
  mockFetchResponse,
  mockFetchSuccess,
} from '../../test/fetchMock'
import { WorkoutPage } from './WorkoutPage'

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

const workoutDto = {
  _id: '3yvozj',
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

function renderWorkoutPage(
  session: AuthSession | null = authSession,
  workoutId = '3yvozj',
  onWorkoutProgressChange = jest.fn(),
  courseId = '',
) {
  const initialEntry = courseId
    ? `/workouts/${workoutId}?courseId=${courseId}`
    : `/workouts/${workoutId}`

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
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
              onWorkoutProgressChange={onWorkoutProgressChange}
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
      'https://webdev-hw-api.herokuapp.com/api/fitness/workouts/3yvozj',
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

  it('opens workout progress modal from progress button', async () => {
    const user = userEvent.setup()
    mockFetchSuccess(workoutDto)

    renderWorkoutPage()

    await user.click(await screen.findByRole('button', { name: 'Заполнить свой прогресс' }))

    expect(screen.getByRole('dialog', { name: 'Мой прогресс' })).toBeInTheDocument()
    expect(screen.getByLabelText('Сколько раз вы сделали наклоны вперед?')).toBeInTheDocument()
    expect(screen.getByLabelText('Сколько раз вы сделали наклоны назад?')).toBeInTheDocument()
    expect(screen.getByLabelText('Сколько раз вы сделали поднятие ног?')).toBeInTheDocument()
  })

  it('saves progress, updates exercise rows, and reports course progress', async () => {
    const user = userEvent.setup()
    const handleWorkoutProgressChange = jest.fn()
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(workoutDto))
      .mockResolvedValueOnce(
        createJsonResponse({
          progressData: [0, 0, 0],
          workoutCompleted: false,
          workoutId: '3yvozj',
        }),
      )
      .mockResolvedValueOnce(createJsonResponse({ message: 'Прогресс сохранён!' }))

    Object.assign(globalThis, { fetch: fetchMock })

    renderWorkoutPage(authSession, '3yvozj', handleWorkoutProgressChange, 'ab1c3f')

    await user.click(await screen.findByRole('button', { name: 'Заполнить свой прогресс' }))
    await user.clear(screen.getByLabelText('Сколько раз вы сделали наклоны вперед?'))
    await user.type(screen.getByLabelText('Сколько раз вы сделали наклоны вперед?'), '30')
    await user.clear(screen.getByLabelText('Сколько раз вы сделали наклоны назад?'))
    await user.type(screen.getByLabelText('Сколько раз вы сделали наклоны назад?'), '6')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByText('Наклоны вперед 100%')).toBeInTheDocument()
    expect(screen.getByText('Наклоны назад 50%')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Мой прогресс' })).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/courses/ab1c3f/workouts/3yvozj',
      expect.objectContaining({
        body: JSON.stringify({ progressData: [30, 6, 0] }),
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'PATCH',
      }),
    )
    expect(handleWorkoutProgressChange).toHaveBeenCalledWith({
      courseId: 'ab1c3f',
      workoutId: '3yvozj',
    })
  })

  it('falls back to live workout-to-course mapping for direct workout URLs', async () => {
    const user = userEvent.setup()
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(workoutDto))
      .mockResolvedValueOnce(
        createJsonResponse({
          progressData: [0, 0, 0],
          workoutCompleted: false,
          workoutId: '3yvozj',
        }),
      )
      .mockResolvedValueOnce(createJsonResponse({ message: 'Прогресс сохранён!' }))

    Object.assign(globalThis, { fetch: fetchMock })

    renderWorkoutPage(authSession, '3yvozj')

    await user.click(await screen.findByRole('button', { name: 'Заполнить свой прогресс' }))
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByText('Наклоны вперед 0%')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/courses/ab1c3f/workouts/3yvozj',
      expect.objectContaining({
        method: 'PATCH',
      }),
    )
  })

  it('does not call PATCH and shows inline error when courseId cannot be resolved', async () => {
    const user = userEvent.setup()
    const externalWorkoutDto = {
      ...workoutDto,
      _id: 'external-workout',
    }
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(externalWorkoutDto))

    Object.assign(globalThis, { fetch: fetchMock })

    renderWorkoutPage(authSession, 'external-workout')

    await user.click(await screen.findByRole('button', { name: 'Заполнить свой прогресс' }))
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось сохранить прогресс. Попробуйте ещё раз.',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog', { name: 'Мой прогресс' })).toBeInTheDocument()
  })

  it('shows inline error and keeps modal open when PATCH fails', async () => {
    const user = userEvent.setup()
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(workoutDto))
      .mockResolvedValueOnce(
        createJsonResponse({
          progressData: [0, 0, 0],
          workoutCompleted: false,
          workoutId: '3yvozj',
        }),
      )
      .mockResolvedValueOnce(createJsonResponse({ message: 'Ошибка' }, 500))

    Object.assign(globalThis, { fetch: fetchMock })

    renderWorkoutPage(authSession, '3yvozj', jest.fn(), 'ab1c3f')

    await user.click(await screen.findByRole('button', { name: 'Заполнить свой прогресс' }))
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось сохранить прогресс. Попробуйте ещё раз.',
    )
    expect(screen.getByRole('dialog', { name: 'Мой прогресс' })).toBeInTheDocument()
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
