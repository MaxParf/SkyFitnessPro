import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { SelectWorkoutModal } from './SelectWorkoutModal'
import { mockFetchPending, mockFetchResponse, mockFetchSuccess } from '../../../../test/fetchMock'

const workoutsResponse = [
  {
    _id: 'workout-1',
    exercises: [],
    name: 'Утренняя практика',
    video: 'https://www.youtube.com/embed/video1',
  },
  {
    _id: 'workout-2',
    exercises: [],
    name: 'Красота и здоровье',
    video: 'https://www.youtube.com/embed/video2',
  },
  {
    _id: 'workout-3',
    exercises: [],
    name: 'Асанны стоя',
    video: 'https://www.youtube.com/embed/video3',
  },
  {
    _id: 'workout-4',
    exercises: [],
    name: 'Растягиваем мышцы бедра',
    video: 'https://www.youtube.com/embed/video4',
  },
  {
    _id: 'workout-5',
    exercises: [],
    name: 'Гибкость спины',
    video: 'https://www.youtube.com/embed/video5',
  },
  {
    _id: 'workout-6',
    exercises: [],
    name: 'Баланс',
    video: 'https://www.youtube.com/embed/video6',
  },
]

function LocationView() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

function renderModal(onClose = jest.fn()) {
  return {
    onClose,
    ...render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={<SelectWorkoutModal courseId="course-1" onClose={onClose} token="jwt-token" />}
          />
          <Route path="/workouts/:workoutId" element={<LocationView />} />
        </Routes>
      </MemoryRouter>,
    ),
  }
}

describe('SelectWorkoutModal', () => {
  it('renders title and workouts loaded from API', async () => {
    const fetchMock = mockFetchSuccess(workoutsResponse)

    renderModal()

    expect(screen.getByRole('heading', { name: 'Выберите тренировку' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Загрузка...')

    expect(await screen.findByRole('button', { name: /Утренняя практика/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Гибкость спины/ })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/courses/course-1/workouts',
      expect.objectContaining({
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'GET',
      }),
    )
  })

  it('selects the first workout by default and changes selection by click', async () => {
    const user = userEvent.setup()
    mockFetchSuccess(workoutsResponse)

    renderModal()

    const firstWorkout = await screen.findByRole('button', { name: /Утренняя практика/ })
    const secondWorkout = screen.getByRole('button', { name: /Красота и здоровье/ })

    expect(firstWorkout).toHaveAttribute('aria-pressed', 'true')
    expect(secondWorkout).toHaveAttribute('aria-pressed', 'false')

    await user.click(secondWorkout)

    expect(firstWorkout).toHaveAttribute('aria-pressed', 'false')
    expect(secondWorkout).toHaveAttribute('aria-pressed', 'true')
  })

  it('navigates to selected workout and closes on start', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()
    mockFetchSuccess(workoutsResponse)

    renderModal(handleClose)

    await user.click(await screen.findByRole('button', { name: /Красота и здоровье/ }))
    await user.click(screen.getByRole('button', { name: 'Начать' }))

    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('location')).toHaveTextContent('/workouts/workout-2')
  })

  it('renders empty state and disables start when API returns no workouts', async () => {
    mockFetchSuccess([])

    renderModal()

    expect(await screen.findByText('В этом курсе пока нет тренировок.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Начать' })).toBeDisabled()
  })

  it('renders error state when API loading fails', async () => {
    mockFetchResponse({ message: 'Ошибка' }, 500)

    renderModal()

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить тренировки')
  })

  it('closes on Escape and backdrop click', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()
    mockFetchPending()

    renderModal(handleClose)

    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Закрыть выбор тренировки' }))

    expect(handleClose).toHaveBeenCalledTimes(2)
  })

  it('uses scrollable list structure for more than five workouts', async () => {
    mockFetchSuccess(workoutsResponse)

    const { container } = renderModal()

    await screen.findByRole('button', { name: /Баланс/ })

    expect(container.querySelector('.select-workout-modal__list')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { pressed: false }).length).toBeGreaterThan(0)
  })
})
