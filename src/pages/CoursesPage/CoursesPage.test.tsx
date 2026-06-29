import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import type { AuthSession } from '@features/auth/model/auth-session.types'
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

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

function renderCoursesPage(
  session: AuthSession | null = null,
  onAddCourse = jest.fn<Promise<void>, [string]>(),
  selectedCourseIds: string[] = [],
) {
  return render(
    <MemoryRouter>
      <CoursesPage
        authSession={session}
        isProfileDropdownOpen={false}
        onAddCourse={onAddCourse}
        onLoginClick={jest.fn()}
        onLogout={jest.fn()}
        onProfileClick={jest.fn()}
        onProfileDropdownClose={jest.fn()}
        onProfileNavigate={jest.fn()}
        selectedCourseIds={selectedCourseIds}
      />
    </MemoryRouter>,
  )
}

describe('CoursesPage', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders loading state before courses load', () => {
    mockFetchPending()

    renderCoursesPage()

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка...')
  })

  it('renders courses after successful loading', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursesPage()

    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })

  it('renders error state when course loading fails', async () => {
    mockFetchError(new Error('Network error'))

    renderCoursesPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить курсы')
  })

  it('renders empty state when API returns no courses', async () => {
    mockFetchSuccess([])

    renderCoursesPage()

    expect(await screen.findByText('Курсы пока не добавлены')).toBeInTheDocument()
  })

  it('does not call add API when course is already selected', async () => {
    const user = userEvent.setup()
    const handleAddCourse = jest.fn<Promise<void>, [string]>()
    mockFetchSuccess(courseDtoItems)

    renderCoursesPage(authSession, handleAddCourse, ['ab1c3f'])

    const selectedButton = await screen.findByRole('button', {
      name: 'Добавить курс: Йога',
      pressed: true,
    })

    await user.click(selectedButton)

    expect(handleAddCourse).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps courses visible when add course API fails', async () => {
    const user = userEvent.setup()
    const handleAddCourse = jest
      .fn<Promise<void>, [string]>()
      .mockRejectedValue(new Error('API error'))
    mockFetchSuccess(courseDtoItems)

    renderCoursesPage(authSession, handleAddCourse)

    await user.click(await screen.findByRole('button', { name: 'Добавить курс: Йога' }))

    expect(handleAddCourse).toHaveBeenCalledWith('ab1c3f')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })
})
