import { readFileSync } from 'node:fs'

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

function getWorkoutPageStylesheet(): string {
  return readFileSync('src/pages/WorkoutPage/WorkoutPage.module.scss', 'utf8')
}

function getRuleBlock(stylesheet: string, selector: string): string {
  const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const ruleBlock = stylesheet.match(new RegExp(`${selectorPattern} \\{[\\s\\S]*?\\n\\}`))?.[0]

  expect(ruleBlock).toBeDefined()

  return ruleBlock ?? ''
}

function getMobileMediaBlock(stylesheet: string): string {
  const mobileMediaBlock = stylesheet.match(
    /@media \(max-width: 767px\) \{[\s\S]*?\n\}(?=\n\n@media|\n*$)/,
  )?.[0]

  expect(mobileMediaBlock).toBeDefined()

  return mobileMediaBlock ?? ''
}

function getDesktopMediaBlock(stylesheet: string): string {
  const desktopMediaBlock = stylesheet.match(
    /@media \(min-width: 768px\) \{[\s\S]*?\n\}(?=\n\n@media|\n*$)/,
  )?.[0]

  expect(desktopMediaBlock).toBeDefined()

  return desktopMediaBlock ?? ''
}

function getMobileRuleBlock(stylesheet: string, selector: string): string {
  const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const mobileRuleBlock = getMobileMediaBlock(stylesheet).match(
    new RegExp(`${selectorPattern} \\{[\\s\\S]*?\\n  \\}`),
  )?.[0]

  expect(mobileRuleBlock).toBeDefined()

  return mobileRuleBlock ?? ''
}

function getDesktopRuleBlock(stylesheet: string, selector: string): string {
  const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const desktopRuleBlock = getDesktopMediaBlock(stylesheet).match(
    new RegExp(`${selectorPattern} \\{[\\s\\S]*?\\n  \\}`),
  )?.[0]

  expect(desktopRuleBlock).toBeDefined()

  return desktopRuleBlock ?? ''
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

  it('does not render header subtitle', () => {
    mockFetchPending()

    renderWorkoutPage()

    expect(screen.queryByText('Онлайн-тренировки для занятий дома')).not.toBeInTheDocument()
  })

  it('keeps desktop workout page source padding stable', () => {
    const stylesheet = getWorkoutPageStylesheet()
    const pageBlock = getRuleBlock(stylesheet, '.workout-page')
    const desktopHeaderBlock = getDesktopRuleBlock(stylesheet, '.workout-page__header')

    expect(pageBlock).toContain('padding: 50px 0 260px;')
    expect(pageBlock).not.toContain('padding: 24px 0 120px;')
    expect(desktopHeaderBlock).toContain('margin-bottom: 45px;')
    expect(stylesheet).not.toMatch(/WorkoutPage-module__/)
    expect(stylesheet).not.toMatch(/(^|})\s*#[A-Za-z_-]/)
  })

  it('keeps mobile workout page source spacing and title styles stable', () => {
    const stylesheet = getWorkoutPageStylesheet()
    const mobilePageBlock = getMobileRuleBlock(stylesheet, '.workout-page')
    const mobileContainerBlock = getMobileRuleBlock(stylesheet, '.workout-page__container')
    const mobileTitleBlock = getMobileRuleBlock(stylesheet, '.workout-page__title-block')
    const mobileTitle = getMobileRuleBlock(stylesheet, '.workout-page__title')

    expect(mobilePageBlock).toContain('padding: 39px 0 40px;')
    expect(mobilePageBlock).not.toContain('padding: 72px 0 56px;')
    expect(mobileContainerBlock).toContain('width: 343px;')
    expect(mobileContainerBlock).toContain('max-width: calc(100% - 32px);')
    expect(mobileContainerBlock).toContain('box-sizing: border-box;')
    expect(mobileContainerBlock).toContain('flex-direction: column;')
    expect(mobileContainerBlock).toContain('gap: 24px;')
    expect(mobileTitleBlock).toContain('width: 343px;')
    expect(mobileTitleBlock).toContain('flex-direction: column;')
    expect(mobileTitleBlock).toContain('min-height: 26px;')
    expect(mobileTitleBlock).toContain('gap: 10px;')
    expect(mobileTitleBlock).not.toContain('min-height: 60px;')
    expect(mobileTitle).toContain('width: 343px;')
    expect(mobileTitle).toContain('font-size: 24px;')
    expect(mobileTitle).toContain('line-height: 26px;')
  })

  it('keeps mobile workout video source layout stable', () => {
    const stylesheet = getWorkoutPageStylesheet()
    const mobileVideoBlock = getMobileRuleBlock(stylesheet, '.workout-page__video')
    const mobileVideoPreviewBlock = getMobileRuleBlock(stylesheet, '.workout-page__video-preview')
    const mobileVideoImageBlock = getMobileRuleBlock(stylesheet, '.workout-page__video-image')

    expect(mobileVideoBlock).toContain('width: 343px;')
    expect(mobileVideoBlock).toContain('height: 189px;')
    expect(mobileVideoPreviewBlock).toContain('width: 100%;')
    expect(mobileVideoPreviewBlock).toContain('height: 189px;')
    expect(mobileVideoPreviewBlock).toContain('border-radius: 8.87px;')
    expect(mobileVideoPreviewBlock).toContain('aspect-ratio: auto;')
    expect(mobileVideoImageBlock).toContain('width: 100%;')
    expect(mobileVideoImageBlock).toContain('height: 100%;')
    expect(mobileVideoImageBlock).toContain('border-radius: 8.87px;')
    expect(mobileVideoImageBlock).toContain('object-fit: cover;')
  })

  it('keeps mobile workout exercises source layout stable', () => {
    const stylesheet = getWorkoutPageStylesheet()
    const contentBlock = getRuleBlock(stylesheet, '.workout-page__exercises-content')
    const mobileCardBlock = getMobileRuleBlock(stylesheet, '.workout-page__exercises-card')
    const mobileContentBlock = getMobileRuleBlock(stylesheet, '.workout-page__exercises-content')
    const mobileMainBlock = getMobileRuleBlock(stylesheet, '.workout-page__exercises-main')
    const mobileTitleBlock = getMobileRuleBlock(stylesheet, '.workout-page__exercises-title')
    const mobileListBlock = getMobileRuleBlock(stylesheet, '.workout-page__exercises-list')
    const mobileGridBlock = getMobileRuleBlock(stylesheet, '.workout-page__exercises-grid')
    const mobileExerciseTextBlock = getMobileRuleBlock(stylesheet, '.workout-page__exercise-text')
    const mobileExerciseTrackBlock = getMobileRuleBlock(stylesheet, '.workout-page__exercise-track')
    const mobileExerciseTrackFillBlock = getMobileRuleBlock(
      stylesheet,
      '.workout-page__exercise-track-fill',
    )
    const mobileProgressButtonBlock = getMobileRuleBlock(
      stylesheet,
      '.workout-page__progress-button,\n  .workout-page__return-link',
    )

    expect(contentBlock).toContain('display: contents;')
    expect(mobileCardBlock).toContain('width: 343px;')
    expect(mobileCardBlock).toContain('box-sizing: border-box;')
    expect(mobileCardBlock).toContain('gap: 24px;')
    expect(mobileCardBlock).toContain('padding: 30px;')
    expect(mobileCardBlock).toContain('border-radius: 30px;')
    expect(mobileCardBlock).toContain('box-shadow: 0 4px 67px -12px #00000021;')
    expect(mobileContentBlock).toContain('display: flex;')
    expect(mobileContentBlock).toContain('max-width: 283px;')
    expect(mobileContentBlock).toContain('box-sizing: border-box;')
    expect(mobileContentBlock).toContain('gap: 40px;')
    expect(mobileMainBlock).toContain('display: flex;')
    expect(mobileMainBlock).toContain('width: 100%;')
    expect(mobileMainBlock).toContain('gap: 20px;')
    expect(mobileTitleBlock).toContain('width: 283px;')
    expect(mobileTitleBlock).toContain('min-height: 70px;')
    expect(mobileTitleBlock).toContain('font-size: 32px;')
    expect(mobileTitleBlock).toContain('font-weight: 400;')
    expect(mobileListBlock).toContain('display: flex;')
    expect(mobileListBlock).toContain('width: 100%;')
    expect(mobileListBlock).toContain('gap: 24px;')
    expect(mobileGridBlock).toContain('max-width: 283px;')
    expect(mobileGridBlock).toContain('display: flex;')
    expect(mobileGridBlock).toContain('flex-direction: column;')
    expect(mobileGridBlock).toContain('gap: 10px;')
    expect(mobileExerciseTextBlock).toContain('width: 283px;')
    expect(mobileExerciseTextBlock).toContain('font-size: 18px;')
    expect(mobileExerciseTrackBlock).toContain('width: 283px;')
    expect(mobileExerciseTrackBlock).toContain('height: 6px;')
    expect(mobileExerciseTrackBlock).toContain('border-radius: 50px;')
    expect(mobileExerciseTrackFillBlock).toContain('width: 113.2px;')
    expect(mobileExerciseTrackFillBlock).toContain('height: 6px;')
    expect(mobileExerciseTrackFillBlock).toContain('border-radius: 50px;')
    expect(mobileProgressButtonBlock).toContain('width: 100%;')
    expect(mobileProgressButtonBlock).toContain('min-height: 52px;')
    expect(mobileProgressButtonBlock).toContain('gap: 10px;')
    expect(mobileProgressButtonBlock).toContain('padding: 16px 26px;')
    expect(mobileProgressButtonBlock).toContain('border-radius: 46px;')
    expect(mobileProgressButtonBlock).toContain('background: #bcec30;')
  })

  it('keeps mobile workout play button source layout stable', () => {
    const stylesheet = getWorkoutPageStylesheet()
    const mobileStylesheet = getMobileMediaBlock(stylesheet)
    const mobilePlayButtonBlock = getMobileRuleBlock(stylesheet, '.workout-page__play-button')
    const mobilePlayIconBlock = getMobileRuleBlock(stylesheet, '.workout-page__play-icon')

    expect(mobilePlayButtonBlock).toContain('width: 46px;')
    expect(mobilePlayButtonBlock).toContain('height: 46px;')
    expect(mobilePlayButtonBlock).toContain('top: 71px;')
    expect(mobilePlayButtonBlock).toContain('left: 148px;')
    expect(mobilePlayButtonBlock).toContain('opacity: 0.75;')
    expect(mobilePlayButtonBlock).toContain('transform: none;')
    expect(mobilePlayIconBlock).toContain('width: 46px;')
    expect(mobilePlayIconBlock).toContain('height: 46px;')
    expect(mobileStylesheet).not.toMatch(
      /\.workout-page__play-button,\s*\.workout-page__play-icon\s*\{[\s\S]*?96px/,
    )
    expect(stylesheet).not.toMatch(/WorkoutPage-module__/)
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
    expect(document.querySelector('.workout-page__exercises-content')).toBeInTheDocument()
    expect(document.querySelector('.workout-page__exercises-main')).toBeInTheDocument()
    expect(document.querySelector('.workout-page__exercises-list')).toBeInTheDocument()
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
