import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

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

function LocationView() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

function renderCoursesPage(
  session: AuthSession | null = null,
  onAddCourse = jest.fn<Promise<void>, [string]>(),
  selectedCourseIds: string[] = [],
  onRemoveCourse = jest.fn<Promise<void>, [string]>(),
) {
  return render(
    <MemoryRouter>
      <CoursesPage
        authSession={session}
        isProfileDropdownOpen={false}
        onAddCourse={onAddCourse}
        onRemoveCourse={onRemoveCourse}
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

function renderCoursesPageWithRoutes(
  session: AuthSession | null = null,
  onAddCourse = jest.fn<Promise<void>, [string]>(),
  selectedCourseIds: string[] = [],
  onRemoveCourse = jest.fn<Promise<void>, [string]>(),
) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <CoursesPage
              authSession={session}
              isProfileDropdownOpen={false}
              onAddCourse={onAddCourse}
              onRemoveCourse={onRemoveCourse}
              onLoginClick={jest.fn()}
              onLogout={jest.fn()}
              onProfileClick={jest.fn()}
              onProfileDropdownClose={jest.fn()}
              onProfileNavigate={jest.fn()}
              selectedCourseIds={selectedCourseIds}
            />
          }
        />
        <Route path="/courses/:courseId" element={<LocationView />} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderCoursesPageWithSelection(initialSelectedCourseIds: string[] = []) {
  const handleAddCourse = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined)
  const handleRemoveCourse = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined)

  function CoursesPageSelectionHarness() {
    const [selectedCourseIds, setSelectedCourseIds] = useState(initialSelectedCourseIds)

    const handleAdd = async (courseId: string): Promise<void> => {
      await handleAddCourse(courseId)
      setSelectedCourseIds((currentIds) =>
        currentIds.includes(courseId) ? currentIds : [...currentIds, courseId],
      )
    }

    const handleRemove = async (courseId: string): Promise<void> => {
      await handleRemoveCourse(courseId)
      setSelectedCourseIds((currentIds) => currentIds.filter((id) => id !== courseId))
    }

    return (
      <CoursesPage
        authSession={authSession}
        isProfileDropdownOpen={false}
        onAddCourse={handleAdd}
        onRemoveCourse={handleRemove}
        onLoginClick={jest.fn()}
        onLogout={jest.fn()}
        onProfileClick={jest.fn()}
        onProfileDropdownClose={jest.fn()}
        onProfileNavigate={jest.fn()}
        selectedCourseIds={selectedCourseIds}
      />
    )
  }

  render(
    <MemoryRouter>
      <CoursesPageSelectionHarness />
    </MemoryRouter>,
  )

  return { handleAddCourse, handleRemoveCourse }
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

  it('navigates to course page when unauthenticated user clicks course card', async () => {
    const user = userEvent.setup()
    mockFetchSuccess(courseDtoItems)

    renderCoursesPageWithRoutes()

    await user.click(await screen.findByLabelText('Открыть описание курса Йога'))

    expect(screen.getByTestId('location')).toHaveTextContent('/courses/ab1c3f')
  })

  it('navigates to course page when authenticated user clicks non-selected course card', async () => {
    const user = userEvent.setup()
    mockFetchSuccess(courseDtoItems)

    renderCoursesPageWithRoutes(authSession)

    await user.click(await screen.findByLabelText('Открыть описание курса Йога'))

    expect(screen.getByTestId('location')).toHaveTextContent('/courses/ab1c3f')
  })

  it('does not navigate when add button is clicked', async () => {
    const user = userEvent.setup()
    const handleAddCourse = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined)
    mockFetchSuccess(courseDtoItems)

    renderCoursesPageWithRoutes(authSession, handleAddCourse)

    await user.click(await screen.findByRole('button', { name: 'Добавить курс: Йога' }))

    expect(handleAddCourse).toHaveBeenCalledWith('ab1c3f')
    expect(screen.queryByTestId('location')).not.toBeInTheDocument()
  })

  it('removes selected course when minus button is clicked', async () => {
    const user = userEvent.setup()
    const handleAddCourse = jest.fn<Promise<void>, [string]>()
    const handleRemoveCourse = jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined)
    mockFetchSuccess(courseDtoItems)

    renderCoursesPage(authSession, handleAddCourse, ['ab1c3f'], handleRemoveCourse)

    const selectedButton = await screen.findByRole('button', {
      name: 'Удалить курс: Йога',
      pressed: true,
    })

    await user.click(selectedButton)

    expect(handleAddCourse).not.toHaveBeenCalled()
    expect(handleRemoveCourse).toHaveBeenCalledWith('ab1c3f')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('changes course card state from plus to minus after successful add', async () => {
    const user = userEvent.setup()
    mockFetchSuccess(courseDtoItems)

    const { handleAddCourse } = renderCoursesPageWithSelection()

    await user.click(await screen.findByRole('button', { name: 'Добавить курс: Йога' }))

    expect(handleAddCourse).toHaveBeenCalledWith('ab1c3f')
    expect(
      screen.getByRole('button', { name: 'Удалить курс: Йога', pressed: true }),
    ).toBeInTheDocument()
  })

  it('changes course card state from minus to plus after successful remove', async () => {
    const user = userEvent.setup()
    mockFetchSuccess(courseDtoItems)

    const { handleRemoveCourse } = renderCoursesPageWithSelection(['ab1c3f'])

    await user.click(await screen.findByRole('button', { name: 'Удалить курс: Йога' }))

    expect(handleRemoveCourse).toHaveBeenCalledWith('ab1c3f')
    expect(
      screen.getByRole('button', { name: 'Добавить курс: Йога', pressed: false }),
    ).toBeInTheDocument()
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
