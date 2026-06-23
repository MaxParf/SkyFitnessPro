import { render, screen } from '@testing-library/react'

import type { CourseDto } from '@shared/api/types/course.dto'

import { CoursesPage } from './CoursesPage'
import { mockFetchError, mockFetchPending, mockFetchSuccess } from '../../test/fetchMock'

const courseDtoItems: CourseDto[] = [
  {
    _id: 'ab1c3f',
    description: 'Описание курса',
    directions: [],
    fitting: [],
    nameEN: 'Yoga',
    nameRU: 'Йога',
    workouts: ['17oz5f'],
  },
]

describe('CoursesPage', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders loading state before courses load', () => {
    mockFetchPending()

    render(<CoursesPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка...')
  })

  it('renders courses after successful loading', async () => {
    mockFetchSuccess(courseDtoItems)

    render(<CoursesPage />)

    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })

  it('renders error state when course loading fails', async () => {
    mockFetchError(new Error('Network error'))

    render(<CoursesPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить курсы')
  })

  it('renders empty state when API returns no courses', async () => {
    mockFetchSuccess([])

    render(<CoursesPage />)

    expect(await screen.findByText('Курсы пока не добавлены')).toBeInTheDocument()
  })
})
