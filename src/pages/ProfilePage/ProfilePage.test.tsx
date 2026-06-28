import { readFileSync } from 'node:fs'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import type { CourseId } from '@entities/course/model/course.types'
import type { AuthSession } from '@features/auth/model/auth-session.types'

import { ProfilePage } from './ProfilePage'
import { mockFetchPending, mockFetchSuccess } from '../../test/fetchMock'

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

function getProfilePageStylesheet(): string {
  return readFileSync('src/pages/ProfilePage/ProfilePage.module.scss', 'utf8')
}

function getMobileMediaBlock(stylesheet: string): string {
  const mobileMediaBlock = stylesheet.match(
    /@media \(max-width: 767px\) \{[\s\S]*?\n\}(?=\n\n@media|\n*$)/,
  )?.[0]

  expect(mobileMediaBlock).toBeDefined()

  return mobileMediaBlock ?? ''
}

function getMobileRuleBlock(stylesheet: string, selector: string): string {
  const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const mobileRuleBlock = getMobileMediaBlock(stylesheet).match(
    new RegExp(`${selectorPattern} \\{[\\s\\S]*?\\n  \\}`),
  )?.[0]

  expect(mobileRuleBlock).toBeDefined()

  return mobileRuleBlock ?? ''
}

function LocationView() {
  const location = useLocation()

  return <p data-testid="location">{location.pathname}</p>
}

function renderProfilePage(
  session: AuthSession | null = authSession,
  onLogout = jest.fn(),
  selectedCourseIds: CourseId[] = ['ab1c3f', 'kfpq8e', 'ypox9r'],
  onRemoveCourse = jest.fn(),
  courseProgressById: Partial<Record<CourseId, number>> = {},
) {
  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route
          path="/profile"
          element={
            <ProfilePage
              authSession={session}
              courseProgressById={courseProgressById}
              isProfileDropdownOpen={false}
              onLoginClick={jest.fn()}
              onLogout={onLogout}
              onProfileClick={jest.fn()}
              onProfileDropdownClose={jest.fn()}
              onProfileNavigate={jest.fn()}
              onRemoveCourse={onRemoveCourse}
              selectedCourseIds={selectedCourseIds}
            />
          }
        />
        <Route path="/" element={<LocationView />} />
        <Route path="/workouts/:workoutId" element={<LocationView />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders user data and profile course cards', () => {
    renderProfilePage()

    expect(screen.getByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Мои курсы' })).toBeInTheDocument()
    expect(screen.getAllByText('ivan')).toHaveLength(2)
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

  it('renders updated course progress when progress state is provided', () => {
    renderProfilePage(authSession, jest.fn(), ['ab1c3f'], jest.fn(), {
      ab1c3f: 75,
    })

    expect(screen.getByText('Прогресс 75%')).toBeInTheDocument()
  })

  it('logs out and navigates to courses page', async () => {
    const user = userEvent.setup()
    const handleLogout = jest.fn()

    renderProfilePage(authSession, handleLogout)

    await user.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(handleLogout).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })

  it('scrolls profile page to top from footer button', async () => {
    const user = userEvent.setup()
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation()

    renderProfilePage()

    await user.click(screen.getByRole('button', { name: 'Вернуться к началу страницы' }))

    expect(screen.getByRole('button', { name: 'Вернуться к началу страницы' })).toHaveTextContent(
      'Наверх ↑',
    )
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('opens workout selection modal when selected course card is clicked', async () => {
    const user = userEvent.setup()
    mockFetchSuccess([
      {
        _id: 'workout-1',
        exercises: [],
        name: 'Утренняя практика',
        video: 'https://www.youtube.com/embed/video1',
      },
    ])

    renderProfilePage(authSession, jest.fn(), ['ab1c3f'])

    await user.click(screen.getByRole('button', { name: 'Открыть тренировки курса Йога' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Выберите тренировку' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Утренняя практика/ })).toBeInTheDocument()
  })

  it('does not open workout modal when remove button is clicked', async () => {
    const user = userEvent.setup()
    const handleRemoveCourse = jest.fn()
    const fetchMock = mockFetchPending()

    renderProfilePage(authSession, jest.fn(), ['ab1c3f'], handleRemoveCourse)

    await user.click(screen.getByRole('button', { name: 'Удалить курс Йога' }))

    expect(handleRemoveCourse).toHaveBeenCalledWith('ab1c3f')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('navigates from modal start button to selected workout', async () => {
    const user = userEvent.setup()
    mockFetchSuccess([
      {
        _id: 'workout-1',
        exercises: [],
        name: 'Утренняя практика',
        video: 'https://www.youtube.com/embed/video1',
      },
    ])

    renderProfilePage(authSession, jest.fn(), ['ab1c3f'])

    await user.click(screen.getByRole('button', { name: 'Открыть тренировки курса Йога' }))
    await user.click(await screen.findByRole('button', { name: 'Начать' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/workouts/workout-1')
    })
  })

  it('keeps mobile profile user card source styles stable', () => {
    const stylesheet = getProfilePageStylesheet()
    const mobileContainerBlock = getMobileRuleBlock(stylesheet, '.profile-page__container')
    const mobileSectionBlock = getMobileRuleBlock(stylesheet, '.profile-page__section')
    const mobileCardBlock = getMobileRuleBlock(stylesheet, '.profile-page__card')
    const mobileAvatarBlock = getMobileRuleBlock(stylesheet, '.profile-page__avatar')
    const mobileUserContentBlock = getMobileRuleBlock(stylesheet, '.profile-page__user-content')
    const mobileNameBlock = getMobileRuleBlock(stylesheet, '.profile-page__name')
    const mobileLoginBlock = getMobileRuleBlock(stylesheet, '.profile-page__login')
    const mobileButtonBlock = getMobileRuleBlock(stylesheet, '.profile-page__button')
    const mobileCoursesGridBlock = getMobileRuleBlock(stylesheet, '.profile-page__courses-grid')
    const footerBlock = stylesheet.match(/\.profile-page__footer \{[\s\S]*?\n\}/)?.[0]
    const backToTopBlock = stylesheet.match(/\.profile-page__back-to-top \{[\s\S]*?\n\}/)?.[0]
    const mobileFooterBlock = getMobileRuleBlock(stylesheet, '.profile-page__footer')

    expect(footerBlock).toContain('display: none;')
    expect(backToTopBlock).toContain('min-width: 127px;')
    expect(backToTopBlock).toContain('min-height: 52px;')
    expect(backToTopBlock).toContain('padding: 16px 26px;')
    expect(backToTopBlock).toContain('gap: 8px;')
    expect(backToTopBlock).toContain('font-size: 18px;')
    expect(mobileContainerBlock).toContain('gap: 24px;')
    expect(mobileSectionBlock).toContain('gap: 24px;')
    expect(mobileCardBlock).toContain('align-items: center;')
    expect(mobileAvatarBlock).toContain('width: 141px;')
    expect(mobileAvatarBlock).toContain('height: 141px;')
    expect(mobileUserContentBlock).toContain('width: 283px;')
    expect(mobileUserContentBlock).toContain('gap: 20px;')
    expect(mobileUserContentBlock).toContain('margin-top: 30px;')
    expect(mobileNameBlock).toContain('width: 283px;')
    expect(mobileNameBlock).toContain('font-size: 24px;')
    expect(mobileNameBlock).toContain('font-weight: 500;')
    expect(mobileLoginBlock).toContain('width: 283px;')
    expect(mobileLoginBlock).toContain('font-size: 16px;')
    expect(mobileLoginBlock).toContain('font-weight: 400;')
    expect(mobileButtonBlock).toContain('width: 100%;')
    expect(mobileButtonBlock).toContain('height: 50px;')
    expect(mobileButtonBlock).toContain('border-radius: 46px;')
    expect(mobileButtonBlock).toContain('padding: 16px 26px;')
    expect(mobileButtonBlock).toContain('font-size: 16px;')
    expect(mobileCoursesGridBlock).toContain('gap: 24px;')
    expect(mobileFooterBlock).toContain('display: flex;')
    expect(mobileFooterBlock).toContain('justify-content: flex-end;')
    expect(stylesheet).not.toMatch(/ProfilePage-module__/)
    expect(stylesheet).not.toMatch(/(^|})\s*#[A-Za-z_-]/)
  })
})
