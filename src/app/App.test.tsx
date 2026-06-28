import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import App from './App'
import { createJsonResponse, mockFetchSuccess } from '../test/fetchMock'

const courseDtoItems = [
  {
    _id: 'ab1c3f',
    description: 'Йога',
    directions: [],
    fitting: [],
    nameEN: 'Yoga',
    nameRU: 'Йога',
    workouts: [],
  },
]

describe('App', () => {
  beforeEach(() => {
    mockFetchSuccess(courseDtoItems)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    window.localStorage.clear()
  })

  it('renders the app shell', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Начните заниматься спортом/i })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('recomputes profile course progress across all course workouts after workout save', async () => {
    const user = userEvent.setup()
    let isWorkoutProgressSaved = false
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockImplementation((input, init) => {
        const url = String(input)

        if (url.endsWith('/users/me')) {
          return Promise.resolve(
            createJsonResponse({
              user: {
                email: 'ivan@example.com',
                selectedCourses: ['ab1c3f'],
              },
            }),
          )
        }

        if (url.endsWith('/courses/ab1c3f/workouts/3yvozj') && init?.method === 'PATCH') {
          isWorkoutProgressSaved = true
          return Promise.resolve(createJsonResponse({ message: 'Прогресс сохранён!' }))
        }

        if (url.endsWith('/workouts/3yvozj')) {
          return Promise.resolve(
            createJsonResponse({
              _id: '3yvozj',
              exercises: [{ _id: 'exercise-1', name: 'Приветствие солнца', quantity: 10 }],
              name: 'Утренняя практика',
              video: 'https://www.youtube.com/embed/video1',
            }),
          )
        }

        if (url.endsWith('/courses/ab1c3f/workouts') && init?.method !== 'PATCH') {
          return Promise.resolve(
            createJsonResponse([
              {
                _id: '3yvozj',
                exercises: [{ _id: 'exercise-1', name: 'Приветствие солнца', quantity: 10 }],
                name: 'Утренняя практика',
                video: 'https://www.youtube.com/embed/video1',
              },
              {
                _id: 'workout-2',
                exercises: [{ _id: 'exercise-2', name: 'Упражнение 2', quantity: 10 }],
                name: 'Тренировка 2',
                video: 'https://www.youtube.com/embed/video2',
              },
              {
                _id: 'workout-3',
                exercises: [{ _id: 'exercise-3', name: 'Упражнение 3', quantity: 10 }],
                name: 'Тренировка 3',
                video: 'https://www.youtube.com/embed/video3',
              },
              {
                _id: 'workout-4',
                exercises: [{ _id: 'exercise-4', name: 'Упражнение 4', quantity: 10 }],
                name: 'Тренировка 4',
                video: 'https://www.youtube.com/embed/video4',
              },
              {
                _id: 'workout-5',
                exercises: [{ _id: 'exercise-5', name: 'Упражнение 5', quantity: 10 }],
                name: 'Тренировка 5',
                video: 'https://www.youtube.com/embed/video5',
              },
            ]),
          )
        }

        if (url.includes('/users/me/progress?courseId=ab1c3f&workoutId=3yvozj')) {
          return Promise.resolve(
            createJsonResponse({
              progressData: isWorkoutProgressSaved ? [10] : [],
              workoutCompleted: isWorkoutProgressSaved,
              workoutId: '3yvozj',
            }),
          )
        }

        if (url.includes('/users/me/progress?courseId=ab1c3f&workoutId=')) {
          return Promise.resolve(
            createJsonResponse({
              progressData: [],
              workoutCompleted: false,
              workoutId: url.split('workoutId=')[1] ?? '',
            }),
          )
        }

        return Promise.resolve(createJsonResponse([]))
      })

    Object.assign(globalThis, { fetch: fetchMock })
    window.localStorage.setItem(
      'skyfitnesspro.auth',
      JSON.stringify({
        email: 'ivan@example.com',
        token: 'jwt-token',
        username: 'ivan',
      }),
    )

    render(
      <MemoryRouter initialEntries={['/workouts/3yvozj?courseId=ab1c3f']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Заполнить свой прогресс' }))
    await user.clear(screen.getByLabelText('Сколько раз вы сделали приветствие солнца?'))
    await user.type(screen.getByLabelText('Сколько раз вы сделали приветствие солнца?'), '10')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))
    await screen.findByText('Приветствие солнца 100%')

    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(await screen.findByRole('button', { name: 'Мой профиль' }))

    expect(await screen.findByText('Прогресс 20%')).toBeInTheDocument()
    expect(screen.queryByText('Прогресс 100%')).not.toBeInTheDocument()
  })
})
