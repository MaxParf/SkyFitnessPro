import { readFileSync } from 'node:fs'

import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import type { AuthSession } from '@features/auth/model/auth-session.types'
import type { CourseDto } from '@shared/api/types/course.dto'

import { mockFetchError, mockFetchPending, mockFetchSuccess } from '../../test/fetchMock'
import {
  COURSE_BANNER_COLORS,
  COURSE_BANNER_IMAGE_GEOMETRY,
  COURSE_BANNER_MASK_GEOMETRY,
  type CourseBannerImageGeometry,
  distributeIntoColumns,
} from './CoursePage.helpers'
import { CoursePage } from './CoursePage'

const courseDtoItems: CourseDto[] = [
  {
    _id: 'ab1c3f',
    description: 'Описание курса йоги',
    directions: ['Йога для новичков', 'Утренняя практика', 'Дыхание', 'Растяжка', 'Баланс'],
    fitting: [
      'Давно хотели попробовать йогу, но не решались начать',
      'Хотите укрепить тело без ударной нагрузки',
      'Ищете спокойные тренировки для дома',
    ],
    nameEN: 'Yoga',
    nameRU: 'Йога',
    workouts: ['3yvozj'],
  },
  {
    _id: 'kfpq8e',
    description: 'Описание курса стретчинга',
    directions: ['Здоровая спина', 'Гибкость'],
    fitting: [
      'Хотите улучшить гибкость и подвижность',
      'Много сидите и чувствуете напряжение',
      'Любите мягкие тренировки без спешки',
    ],
    nameEN: 'Stretching',
    nameRU: 'Стретчинг',
    workouts: ['9mefwq'],
  },
  {
    _id: 'ypox9r',
    description: 'Описание курса фитнеса',
    directions: ['Силовые упражнения', 'Кардио', 'Пресс'],
    fitting: [
      'Хотите тренироваться энергично и регулярно',
      'Готовы к сложной нагрузке',
      'Хотите укрепить мышцы всего тела',
    ],
    nameEN: 'Fitness',
    nameRU: 'Фитнес',
    workouts: ['gh7bd5'],
  },
  {
    _id: '6i67sm',
    description: 'Описание курса степ-аэробики',
    directions: ['Базовые шаги', 'Кардио', 'Координация', 'Ритм'],
    fitting: [
      'Любите активные тренировки под ритм',
      'Хотите развивать координацию',
      'Ищете кардио без сложного оборудования',
    ],
    nameEN: 'Step aerobics',
    nameRU: 'Степ-аэробика',
    workouts: ['e9ghsb'],
  },
  {
    _id: 'q02a6i',
    description: 'Описание курса бодифлекса',
    directions: ['Дыхание', 'Глубокие мышцы', 'Корпус', 'Тонус', 'Мягкая нагрузка'],
    fitting: [
      'Хотите начать с коротких тренировок',
      'Интересуетесь дыхательными практиками',
      'Ищете нагрузку без резких движений',
    ],
    nameEN: 'Bodyflex',
    nameRU: 'Бодифлекс',
    workouts: ['xlpkqy'],
  },
]

const courseBannerCases = [
  ['ab1c3f', 'Йога', COURSE_BANNER_COLORS.yoga],
  ['kfpq8e', 'Стретчинг', COURSE_BANNER_COLORS.stretching],
  ['ypox9r', 'Фитнес', COURSE_BANNER_COLORS.fitness],
  ['6i67sm', 'Степ-аэробика', COURSE_BANNER_COLORS.stepAerobics],
  ['q02a6i', 'Бодифлекс', COURSE_BANNER_COLORS.bodyflex],
]

const courseBannerImageCases = [
  ['ab1c3f', 'Йога', COURSE_BANNER_IMAGE_GEOMETRY.yoga],
  ['ypox9r', 'Фитнес', COURSE_BANNER_IMAGE_GEOMETRY.fitness],
  ['q02a6i', 'Бодифлекс', COURSE_BANNER_IMAGE_GEOMETRY.bodyflex],
] satisfies Array<[string, string, CourseBannerImageGeometry]>

const ctaListItems = [
  'проработка всех групп мышц',
  'тренировка суставов',
  'улучшение циркуляции крови',
  'упражнения заряжают бодростью',
  'помогают противостоять стрессам',
]

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

function getCoursePageStylesheet(): string {
  return readFileSync('src/pages/CoursePage/CoursePage.module.scss', 'utf8')
}

function getSharedContainerStylesheet(): string {
  return readFileSync('src/shared/ui/Container/Container.module.scss', 'utf8')
}

function getAppHeaderStylesheet(): string {
  return readFileSync('src/widgets/AppHeader/AppHeader.module.scss', 'utf8')
}

function getCoursePageSource(): string {
  return readFileSync('src/pages/CoursePage/CoursePage.tsx', 'utf8')
}

function getRuleBlock(stylesheet: string, selector: string): string {
  const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const ruleBlock = stylesheet.match(new RegExp(`${selectorPattern} \\{[\\s\\S]*?\\n\\}`))?.[0]

  expect(ruleBlock).toBeDefined()

  return ruleBlock ?? ''
}

function getMobileMediaBlock(stylesheet: string): string {
  const mediaBlock = stylesheet.match(/@media \(max-width: 767px\) \{[\s\S]*\n\}/)?.[0]

  expect(mediaBlock).toBeDefined()

  return mediaBlock ?? ''
}

function renderCoursePage(
  courseId = 'ab1c3f',
  session: AuthSession | null = null,
  isProfileDropdownOpen = false,
  onLoginClick = jest.fn(),
) {
  return render(
    <MemoryRouter initialEntries={[`/courses/${courseId}`]}>
      <Routes>
        <Route
          path="/courses/:courseId"
          element={
            <CoursePage
              authSession={session}
              isProfileDropdownOpen={isProfileDropdownOpen}
              onLoginClick={onLoginClick}
              onLogout={jest.fn()}
              onProfileClick={jest.fn()}
              onProfileDropdownClose={jest.fn()}
              onProfileNavigate={jest.fn()}
            />
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CoursePage', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders AppHeader for unauthenticated users', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage()

    expect(screen.getByLabelText('SkyFitnessPro')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })

  it('renders AppHeader for authenticated users', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage('ab1c3f', authSession)

    expect(
      await screen.findByRole('button', { name: 'Открыть меню пользователя' }),
    ).toBeInTheDocument()
  })

  it('renders course description sections from course data', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage()

    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Подойдет для вас, если:' })).toBeInTheDocument()
    expect(screen.getAllByText(/Давно|Хотите|Ищете/)).toHaveLength(3)
    expect(screen.getByRole('heading', { name: 'Направления' })).toBeInTheDocument()
    expect(screen.getByText('Йога для новичков')).toBeInTheDocument()
    expect(document.querySelectorAll('.course-page__direction-star')).toHaveLength(5)
  })

  it('renders lower CTA block with title, list, button and decorative images', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage()

    expect(
      await screen.findByRole('heading', { name: /Начните путь\s+к новому телу/ }),
    ).toBeInTheDocument()
    ctaListItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Войдите, чтобы добавить курс' })).toBeInTheDocument()
    const cta = document.querySelector('.course-page__cta')
    const ctaInner = cta?.querySelector('.course-page__cta-inner')
    const visual = ctaInner?.querySelector('.course-page__cta-visual')
    const ribbonClip = visual?.querySelector('.course-page__cta-ribbon-clip')
    const ribbon = ribbonClip?.querySelector('.course-page__cta-ribbon')
    const arc = visual?.querySelector('.course-page__cta-arc')
    const manBlock = document.querySelector('.course-page__cta-man-block')
    const manFrame = manBlock?.querySelector('.course-page__cta-man-frame')
    const manImage = manFrame?.querySelector('.course-page__cta-man')
    const ctaContent = ctaInner?.querySelector('.course-page__cta-content')

    expect(cta).toBeInTheDocument()
    expect(ctaInner).toBeInTheDocument()
    expect(visual).toBeInTheDocument()
    expect(visual).toHaveAttribute('aria-hidden', 'true')
    expect(ribbonClip).toBeInTheDocument()
    expect(ribbon).toBeInTheDocument()
    expect(ribbonClip?.contains(ribbon ?? null)).toBe(true)
    expect(ctaInner?.contains(ctaContent ?? null)).toBe(true)
    expect(visual?.contains(ctaContent ?? null)).toBe(false)
    expect(arc).toBeInTheDocument()
    expect(arc?.tagName.toLowerCase()).toBe('img')
    expect(arc).toHaveAttribute('aria-hidden', 'true')
    expect(arc).toHaveAttribute('src', 'test-file-stub')
    expect(arc).toHaveAttribute('alt', '')
    expect(manBlock).toBeInTheDocument()
    expect(manBlock).toHaveAttribute('aria-hidden', 'true')
    expect(manFrame).toBeInTheDocument()
    expect(manImage).toBeInTheDocument()
    expect(manImage).toHaveAttribute('src', 'test-file-stub')
    expect(manImage).toHaveAttribute('alt', '')
  })

  it('keeps CTA content contained by the inner card source structure', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage()

    expect(
      await screen.findByRole('heading', { name: /Начните путь\s+к новому телу/ }),
    ).toBeInTheDocument()
    const ctaInner = document.querySelector('.course-page__cta-inner')
    const ctaContent = document.querySelector('.course-page__cta-content')
    const visual = document.querySelector('.course-page__cta-visual')

    expect(ctaInner).toBeInTheDocument()
    expect(ctaContent).toBeInTheDocument()
    expect(ctaInner?.contains(ctaContent ?? null)).toBe(true)
    expect(visual?.contains(ctaContent ?? null)).toBe(false)
  })

  it('keeps CTA content positioned inside the inner card in source CSS', () => {
    const stylesheet = getCoursePageStylesheet()
    const ctaInnerBlock = getRuleBlock(stylesheet, '.course-page__cta-inner')
    const ctaContentBlock = getRuleBlock(stylesheet, '.course-page__cta-content')

    expect(ctaInnerBlock).toContain('position: relative;')
    expect(ctaInnerBlock).toContain('padding: 40px 0 40px 40px;')
    expect(ctaContentBlock).toContain('position: relative;')
    expect(ctaContentBlock).toContain('z-index: 3;')
    expect(ctaContentBlock).toContain('width: 437px;')
    expect(ctaContentBlock).toContain('min-height: 406px;')
    expect(ctaContentBlock).toContain('gap: 28px;')
    expect(ctaContentBlock).toContain('margin: 0;')
    expect(ctaContentBlock).not.toContain('margin: 40px 0 40px 40px;')
    expect(ctaContentBlock).not.toContain('margin-top')
    expect(ctaContentBlock).not.toContain('position: absolute;')
    expect(ctaContentBlock).not.toContain('top:')
    expect(ctaContentBlock).not.toContain('left:')
  })

  it('opens login from CTA button for unauthenticated users', async () => {
    const handleLoginClick = jest.fn()
    mockFetchSuccess(courseDtoItems)

    renderCoursePage('ab1c3f', null, false, handleLoginClick)

    fireEvent.click(await screen.findByRole('button', { name: 'Войдите, чтобы добавить курс' }))

    expect(handleLoginClick).toHaveBeenCalledTimes(1)
  })

  it.each(courseBannerCases)(
    'uses course banner color for %s',
    async (courseId, courseTitle, expectedColor) => {
      mockFetchSuccess(courseDtoItems)

      renderCoursePage(courseId)

      const banner = await screen.findByRole('region', { name: courseTitle })

      expect(banner).toHaveStyle(`--course-banner-color: ${expectedColor}`)
    },
  )

  it.each(courseBannerImageCases)(
    'uses course banner image geometry for %s',
    async (courseId, courseTitle, expectedGeometry) => {
      mockFetchSuccess(courseDtoItems)

      renderCoursePage(courseId)

      expect(await screen.findByRole('heading', { name: courseTitle })).toBeInTheDocument()
      const bannerImage = document.querySelector('.course-page__banner-image')
      const expectedTop = expectedGeometry.top ?? ''

      expect(expectedGeometry.top).toBeDefined()
      expect(bannerImage).toHaveStyle(`--course-banner-image-width: ${expectedGeometry.width}`)
      expect(bannerImage).toHaveStyle(`--course-banner-image-height: ${expectedGeometry.height}`)
      expect(bannerImage).toHaveStyle(`--course-banner-image-top: ${expectedTop}`)
      expect(bannerImage).toHaveStyle(
        `--course-banner-image-transform: ${expectedGeometry.transform ?? 'none'}`,
      )
      expect(bannerImage).toHaveStyle(
        `--course-banner-image-transform-origin: ${expectedGeometry.transformOrigin ?? 'center'}`,
      )
      if (expectedGeometry.left) {
        expect(bannerImage).toHaveStyle(`--course-banner-image-left: ${expectedGeometry.left}`)
      }
      if (expectedGeometry.right) {
        expect(bannerImage).toHaveStyle(`--course-banner-image-right: ${expectedGeometry.right}`)
      }
    },
  )

  it('uses stretching banner image geometry with right positioning', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage('kfpq8e')

    expect(await screen.findByRole('heading', { name: 'Стретчинг' })).toBeInTheDocument()
    const bannerImage = document.querySelector('.course-page__banner-image')
    const styleAttribute = bannerImage?.getAttribute('style') ?? ''

    expect(bannerImage).toHaveStyle(
      `--course-banner-image-width: ${COURSE_BANNER_IMAGE_GEOMETRY.stretching.width}`,
    )
    expect(bannerImage).toHaveStyle(
      `--course-banner-image-height: ${COURSE_BANNER_IMAGE_GEOMETRY.stretching.height}`,
    )
    expect(bannerImage).toHaveStyle(
      `--course-banner-image-top: ${COURSE_BANNER_IMAGE_GEOMETRY.stretching.top}`,
    )
    expect(bannerImage).toHaveStyle(
      `--course-banner-image-right: ${COURSE_BANNER_IMAGE_GEOMETRY.stretching.right}`,
    )
    expect(bannerImage).toHaveStyle('--course-banner-image-transform: none')
    expect(bannerImage).toHaveStyle('--course-banner-image-transform-origin: center')
    expect(styleAttribute).not.toContain('--course-banner-image-left')
  })

  it('uses step-aerobics banner image mask crop geometry', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage('6i67sm')

    expect(await screen.findByRole('heading', { name: 'Степ-аэробика' })).toBeInTheDocument()
    const bannerImage = document.querySelector('.course-page__banner-image')
    const bannerImageMask = document.querySelector('.course-page__banner-image-mask')
    const imageStyleAttribute = bannerImage?.getAttribute('style') ?? ''
    const maskStyleAttribute = bannerImageMask?.getAttribute('style') ?? ''

    expect(bannerImageMask).toHaveStyle(
      `--course-banner-mask-width: ${COURSE_BANNER_MASK_GEOMETRY.stepAerobics.width}`,
    )
    expect(bannerImageMask).toHaveStyle(
      `--course-banner-mask-height: ${COURSE_BANNER_MASK_GEOMETRY.stepAerobics.height}`,
    )
    expect(bannerImageMask).toHaveStyle(
      `--course-banner-mask-top: ${COURSE_BANNER_MASK_GEOMETRY.stepAerobics.top}`,
    )
    expect(bannerImageMask).toHaveStyle(
      `--course-banner-mask-right: ${COURSE_BANNER_MASK_GEOMETRY.stepAerobics.right}`,
    )
    expect(COURSE_BANNER_MASK_GEOMETRY.stepAerobics.width).toBe('695px')
    expect(COURSE_BANNER_MASK_GEOMETRY.stepAerobics.height).toBe('310px')
    expect(COURSE_BANNER_MASK_GEOMETRY.stepAerobics.top).toBe('0px')
    expect(COURSE_BANNER_MASK_GEOMETRY.stepAerobics.right).toBe('0px')
    expect(maskStyleAttribute).not.toContain('--course-banner-mask-left')
    expect(maskStyleAttribute).not.toContain('--course-banner-mask-bottom')
    expect(imageStyleAttribute).not.toContain('--course-banner-image-width')
    expect(imageStyleAttribute).not.toContain('--course-banner-image-height')
    expect(imageStyleAttribute).not.toContain('--course-banner-image-top')
    expect(imageStyleAttribute).not.toContain('--course-banner-image-right')
    expect(imageStyleAttribute).not.toContain('--course-banner-image-transform')
    expect(imageStyleAttribute).not.toContain('--course-banner-image-transform-origin')
    expect('stepAerobics' in COURSE_BANNER_IMAGE_GEOMETRY).toBe(false)
    expect(bannerImage).toHaveClass('course-page__banner-image')
    expect(bannerImage).toHaveClass('course-page__banner-image--step-aerobics')
  })

  it.each([
    ['ab1c3f', 'Йога'],
    ['kfpq8e', 'Стретчинг'],
    ['ypox9r', 'Фитнес'],
    ['q02a6i', 'Бодифлекс'],
  ])('keeps banner image scale at defaults for %s', async (courseId, courseTitle) => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage(courseId)

    expect(await screen.findByRole('heading', { name: courseTitle })).toBeInTheDocument()
    const bannerImage = document.querySelector('.course-page__banner-image')
    const styleAttribute = bannerImage?.getAttribute('style') ?? ''

    expect(styleAttribute).toContain('--course-banner-image-width')
    expect(styleAttribute).toContain('--course-banner-image-height')
    expect(styleAttribute).toContain('--course-banner-image-top')
    expect(bannerImage).toHaveStyle('--course-banner-image-transform: none')
    expect(bannerImage).toHaveStyle('--course-banner-image-transform-origin: center')
    expect(bannerImage).not.toHaveClass('course-page__banner-image--step-aerobics')
  })

  it('renders a banner image occluder only for step-aerobics', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage('6i67sm')

    expect(await screen.findByRole('heading', { name: 'Степ-аэробика' })).toBeInTheDocument()
    const bannerImageMask = document.querySelector('.course-page__banner-image-mask')
    const occluder = document.querySelector('.course-page__banner-image-occluder')

    expect(occluder).toBeInTheDocument()
    expect(occluder).toHaveAttribute('aria-hidden', 'true')
    expect(bannerImageMask?.contains(occluder ?? null)).toBe(true)
  })

  it.each([
    ['ab1c3f', 'Йога'],
    ['kfpq8e', 'Стретчинг'],
    ['ypox9r', 'Фитнес'],
    ['q02a6i', 'Бодифлекс'],
  ])('does not render a banner image occluder for %s', async (courseId, courseTitle) => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage(courseId)

    expect(await screen.findByRole('heading', { name: courseTitle })).toBeInTheDocument()
    expect(document.querySelector('.course-page__banner-image-occluder')).not.toBeInTheDocument()
  })

  it('distributes directions into up to three ordered columns', () => {
    expect(distributeIntoColumns(['item1', 'item2'])).toEqual([['item1'], ['item2']])
    expect(distributeIntoColumns(['item1', 'item2', 'item3'])).toEqual([
      ['item1'],
      ['item2'],
      ['item3'],
    ])
    expect(distributeIntoColumns(['item1', 'item2', 'item3', 'item4'])).toEqual([
      ['item1', 'item2'],
      ['item3'],
      ['item4'],
    ])
    expect(
      distributeIntoColumns(['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7']),
    ).toEqual([
      ['item1', 'item2', 'item3'],
      ['item4', 'item5'],
      ['item6', 'item7'],
    ])
  })

  it('does not create empty direction columns', () => {
    const columns = distributeIntoColumns(['item1'], 3)

    expect(columns).toEqual([['item1']])
    expect(columns.every((column) => column.length > 0)).toBe(true)
  })

  it('renders loading state', () => {
    mockFetchPending()

    renderCoursePage()

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка...')
  })

  it('renders error state when courses fail to load', async () => {
    mockFetchError(new Error('Network error'))

    renderCoursePage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить курс')
  })

  it('renders not found state for unknown course id', async () => {
    mockFetchSuccess(courseDtoItems)

    renderCoursePage('unknown-course')

    expect(await screen.findByText('Курс не найден')).toBeInTheDocument()
  })

  it('keeps desktop course page source layout stable', () => {
    const stylesheet = getCoursePageStylesheet()
    const containerBlock = getRuleBlock(stylesheet, '.course-page__container')
    const bannerBlock = getRuleBlock(stylesheet, '.course-page__banner')
    const bannerTitleWrapperBlock = getRuleBlock(stylesheet, '.course-page__banner-title-block')
    const bannerTitleBlock = getRuleBlock(stylesheet, '.course-page__banner-title')
    const bannerImageBlock = getRuleBlock(stylesheet, '.course-page__banner-image')
    const stepAerobicsBannerImageBlock = getRuleBlock(
      stylesheet,
      '.course-page__banner-image--step-aerobics',
    )
    const bannerImageMaskBlock = getRuleBlock(stylesheet, '.course-page__banner-image-mask')
    const bannerImageOccluderBlock = getRuleBlock(stylesheet, '.course-page__banner-image-occluder')
    const sectionTitleBlock = getRuleBlock(stylesheet, '.course-page__section-title')
    const suitableCardsBlock = getRuleBlock(stylesheet, '.course-page__suitable-cards')
    const suitableCardBlock = getRuleBlock(stylesheet, '.course-page__suitable-card')
    const suitableCardInnerBlock = getRuleBlock(stylesheet, '.course-page__suitable-card-inner')
    const suitableTextBlock = getRuleBlock(stylesheet, '.course-page__suitable-text')
    const directionsCardBlock = getRuleBlock(stylesheet, '.course-page__directions-card')
    const directionStarBlock = getRuleBlock(stylesheet, '.course-page__direction-star')
    const ctaBlock = getRuleBlock(stylesheet, '.course-page__cta')
    const ctaInnerBlock = getRuleBlock(stylesheet, '.course-page__cta-inner')
    const ctaContentBlock = getRuleBlock(stylesheet, '.course-page__cta-content')
    const ctaTitleBlock = getRuleBlock(stylesheet, '.course-page__cta-title')
    const ctaListBlock = getRuleBlock(stylesheet, '.course-page__cta-list')
    const ctaButtonBlock = getRuleBlock(stylesheet, '.course-page__cta-button')
    const ctaVisualBlock = getRuleBlock(stylesheet, '.course-page__cta-visual')
    const ctaRibbonClipBlock = getRuleBlock(stylesheet, '.course-page__cta-ribbon-clip')
    const ctaRibbonBlock = getRuleBlock(stylesheet, '.course-page__cta-ribbon')
    const ctaArcBlock = getRuleBlock(stylesheet, '.course-page__cta-arc')
    const ctaManOuterBlock = getRuleBlock(stylesheet, '.course-page__cta-man-block')
    const ctaManFrameBlock = getRuleBlock(stylesheet, '.course-page__cta-man-frame')
    const ctaManBlock = getRuleBlock(stylesheet, '.course-page__cta-man')
    const mobileBlock = getMobileMediaBlock(stylesheet)

    expect(containerBlock).toContain('width: 1160px;')
    expect(containerBlock).toContain('max-width: 100%;')
    expect(containerBlock).toContain('padding-inline: 0;')
    expect(containerBlock).toContain('gap: 60px;')
    expect(bannerBlock).toContain('width: 1160px;')
    expect(bannerBlock).toContain('max-width: 100%;')
    expect(bannerBlock).toContain('height: 310px;')
    expect(bannerBlock).toContain('border-radius: 30px;')
    expect(bannerBlock).toContain('background: var(--course-banner-color, #ffc700);')
    expect(bannerTitleWrapperBlock).toContain('z-index: 3;')
    expect(bannerTitleBlock).toContain('width: max-content;')
    expect(bannerTitleBlock).toContain('max-width: 520px;')
    expect(bannerTitleBlock).toContain('white-space: nowrap;')
    expect(bannerTitleBlock).not.toContain('width: 300px;')
    expect(bannerImageBlock).toContain('z-index: 1;')
    expect(bannerImageBlock).toContain('width: var(--course-banner-image-width, 1023px);')
    expect(bannerImageBlock).toContain('max-width: none;')
    expect(bannerImageBlock).toContain('height: var(--course-banner-image-height, 683px);')
    expect(bannerImageBlock).toContain('max-height: none;')
    expect(bannerImageBlock).toContain('top: var(--course-banner-image-top, -231px);')
    expect(bannerImageBlock).toContain('left: var(--course-banner-image-left, auto);')
    expect(bannerImageBlock).toContain('right: var(--course-banner-image-right, auto);')
    expect(bannerImageBlock).toContain('transform: var(--course-banner-image-transform, none);')
    expect(bannerImageBlock).toContain(
      'transform-origin: var(--course-banner-image-transform-origin, center);',
    )
    expect(stepAerobicsBannerImageBlock).toContain('top: -1130px;')
    expect(stepAerobicsBannerImageBlock).toContain('right: 37px;')
    expect(stepAerobicsBannerImageBlock).toContain('left: auto;')
    expect(stepAerobicsBannerImageBlock).toContain('width: 400px;')
    expect(stepAerobicsBannerImageBlock).toContain('height: 1081px;')
    expect(stepAerobicsBannerImageBlock).toContain('transform: scale(1.78);')
    expect(stepAerobicsBannerImageBlock).toContain('transform-origin: top right;')
    expect(stepAerobicsBannerImageBlock).not.toContain('top: -706px;')
    expect(stepAerobicsBannerImageBlock).not.toContain('right: 192px;')
    expect(stepAerobicsBannerImageBlock).not.toContain('top: -655px;')
    expect(stepAerobicsBannerImageBlock).not.toContain('right: 21px;')
    expect(stepAerobicsBannerImageBlock).not.toContain('transform: scale(1.2);')
    expect(bannerImageMaskBlock).toContain('position: absolute;')
    expect(bannerImageMaskBlock).toContain('z-index: 1;')
    expect(bannerImageMaskBlock).toContain('top: var(--course-banner-mask-top, 0);')
    expect(bannerImageMaskBlock).toContain('right: var(--course-banner-mask-right, 0);')
    expect(bannerImageMaskBlock).toContain('bottom: var(--course-banner-mask-bottom, auto);')
    expect(bannerImageMaskBlock).toContain('left: var(--course-banner-mask-left, auto);')
    expect(bannerImageMaskBlock).toContain('width: var(--course-banner-mask-width, auto);')
    expect(bannerImageMaskBlock).toContain('height: var(--course-banner-mask-height, auto);')
    expect(bannerImageMaskBlock).toContain('overflow: hidden;')
    expect(bannerImageOccluderBlock).toContain('position: absolute;')
    expect(bannerImageOccluderBlock).toContain('z-index: 2;')
    expect(bannerImageOccluderBlock).toContain('top: 0;')
    expect(bannerImageOccluderBlock).toContain('left: 0;')
    expect(bannerImageOccluderBlock).toContain('width: 271px;')
    expect(bannerImageOccluderBlock).toContain('height: 310px;')
    expect(bannerImageOccluderBlock).toContain('background: var(--course-banner-color, #ff7e65);')
    expect(bannerImageOccluderBlock).toContain('pointer-events: none;')
    expect(sectionTitleBlock).toContain('font-size: 40px;')
    expect(suitableCardsBlock).toContain('display: flex;')
    expect(suitableCardsBlock).toContain('width: 1160px;')
    expect(suitableCardsBlock).toContain('max-width: 100%;')
    expect(suitableCardsBlock).toContain('gap: 17px;')
    expect(suitableCardsBlock).toContain('flex-wrap: nowrap;')
    expect(suitableCardsBlock).not.toContain('flex-wrap: wrap;')
    expect(suitableCardBlock).toContain('flex: 1 1 0;')
    expect(suitableCardBlock).toContain('min-width: 0;')
    expect(suitableCardBlock).not.toContain('width: 100%;')
    expect(suitableCardBlock).not.toContain('width: fit-content;')
    expect(suitableCardInnerBlock).toContain('width: 100%;')
    expect(suitableCardInnerBlock).toContain('min-width: 0;')
    expect(suitableCardInnerBlock).toContain('gap: 25px;')
    expect(suitableCardInnerBlock).not.toContain('gap: 3px;')
    expect(suitableTextBlock).toContain('display: flex;')
    expect(suitableTextBlock).toContain('width: auto;')
    expect(suitableTextBlock).toContain('min-width: 0;')
    expect(suitableTextBlock).toContain('flex: 1 1 auto;')
    expect(suitableTextBlock).toContain('align-items: center;')
    expect(getRuleBlock(stylesheet, '.course-page__suitable')).toContain('width: 1160px;')
    expect(getRuleBlock(stylesheet, '.course-page__suitable')).toContain('max-width: 100%;')
    expect(getRuleBlock(stylesheet, '.course-page__directions')).toContain('width: 1160px;')
    expect(getRuleBlock(stylesheet, '.course-page__directions')).toContain('max-width: 100%;')
    expect(directionsCardBlock).toContain('width: 1160px;')
    expect(directionsCardBlock).toContain('max-width: 100%;')
    expect(directionsCardBlock).toContain('background: #bcec30;')
    expect(directionStarBlock).toContain('width: 19.5px;')
    expect(ctaBlock).toContain('width: 1160px;')
    expect(ctaBlock).toContain('max-width: 100%;')
    expect(ctaBlock).toContain('height: 486px;')
    expect(ctaBlock).toContain('margin-top: 42px;')
    expect(ctaInnerBlock).toContain('width: 1160px;')
    expect(ctaInnerBlock).toContain('max-width: 100%;')
    expect(ctaInnerBlock).toContain('height: 486px;')
    expect(ctaInnerBlock).toContain('border-radius: 30px;')
    expect(ctaInnerBlock).toContain('background: #ffffff;')
    expect(ctaInnerBlock).toContain('padding: 40px 0 40px 40px;')
    expect(ctaInnerBlock).toContain('box-shadow: 0 4px 67px -12px rgb(0 0 0 / 13%);')
    expect(ctaInnerBlock).toContain('overflow: visible;')
    expect(ctaInnerBlock).not.toContain('overflow: hidden;')
    expect(ctaContentBlock).toContain('width: 437px;')
    expect(ctaContentBlock).toContain('min-height: 406px;')
    expect(ctaContentBlock).toContain('gap: 28px;')
    expect(ctaContentBlock).toContain('margin: 0;')
    expect(ctaContentBlock).not.toContain('margin: 40px 0 40px 40px;')
    expect(ctaContentBlock).not.toContain('margin-top')
    expect(ctaTitleBlock).toContain('width: 398px;')
    expect(ctaTitleBlock).toContain('font-size: 60px;')
    expect(ctaTitleBlock).toContain('font-weight: 500;')
    expect(ctaListBlock).toContain('width: 437px;')
    expect(ctaListBlock).toContain('gap: 12px;')
    expect(ctaListBlock).toContain('font-size: 24px;')
    expect(ctaListBlock).toContain('color: rgb(0 0 0 / 60%);')
    expect(ctaButtonBlock).toContain('width: 437px;')
    expect(ctaButtonBlock).toContain('min-height: 52px;')
    expect(ctaButtonBlock).toContain('border-radius: 46px;')
    expect(ctaButtonBlock).toContain('padding: 16px 26px;')
    expect(ctaButtonBlock).toContain('background: #bcec30;')
    expect(ctaVisualBlock).toContain('position: absolute;')
    expect(ctaVisualBlock).toContain('inset: 0 0 0 -30px;')
    expect(ctaVisualBlock).toContain('pointer-events: none;')
    expect(ctaRibbonClipBlock).toContain('position: absolute;')
    expect(ctaRibbonClipBlock).toContain('inset: 0;')
    expect(ctaRibbonClipBlock).toContain('overflow: hidden;')
    expect(ctaRibbonClipBlock).toContain('pointer-events: none;')
    expect(ctaRibbonBlock).toContain('position: absolute;')
    expect(ctaRibbonBlock).toContain('z-index: 1;')
    expect(ctaRibbonBlock).toContain('top: 120px;')
    expect(ctaRibbonBlock).toContain('left: 465px;')
    expect(ctaRibbonBlock).toContain('width: 700px;')
    expect(ctaRibbonBlock).toContain('height: 420px;')
    expect(ctaRibbonBlock).toContain('transform: rotate(0deg);')
    expect(ctaRibbonBlock).toContain('pointer-events: none;')
    expect(ctaRibbonBlock).not.toContain('rotate(-12.38deg)')
    expect(ctaRibbonBlock).not.toContain('top: 135px;')
    expect(ctaRibbonBlock).not.toContain('width: 670.18px;')
    expect(ctaRibbonBlock).not.toContain('height: 390.98px;')
    expect(ctaArcBlock).toContain('position: absolute;')
    expect(ctaArcBlock).toContain('z-index: 2;')
    expect(ctaArcBlock).toContain('width: 50px;')
    expect(ctaArcBlock).toContain('height: 42.5px;')
    expect(ctaArcBlock).toContain('top: 31.59px;')
    expect(ctaArcBlock).toContain('left: 732px;')
    expect(ctaArcBlock).toContain('pointer-events: none;')
    expect(ctaArcBlock).not.toContain('border-top')
    expect(ctaArcBlock).not.toContain('border-left')
    expect(ctaArcBlock).not.toContain('border-radius')
    expect(ctaManOuterBlock).toContain('width: 487px;')
    expect(ctaManOuterBlock).toContain('height: 542.49px;')
    expect(ctaManOuterBlock).toContain('top: -102px;')
    expect(ctaManOuterBlock).toContain('left: 615.19px;')
    expect(ctaManOuterBlock).not.toContain('transform: rotate(2.99deg);')
    expect(ctaManFrameBlock).toContain('width: 604.47px;')
    expect(ctaManFrameBlock).toContain('height: 604.47px;')
    expect(ctaManFrameBlock).toContain('top: -17.91px;')
    expect(ctaManFrameBlock).toContain('left: -57.36px;')
    expect(ctaManFrameBlock).not.toContain('transform: rotate(2.99deg);')
    expect(ctaManBlock).toContain('position: absolute;')
    expect(ctaManBlock).toContain('width: 519.47px;')
    expect(ctaManBlock).toContain('height: 539.54px;')
    expect(ctaManBlock).toContain('top: 33px;')
    expect(ctaManBlock).toContain('left: 64px;')
    expect(ctaManBlock).toContain('display: block;')
    expect(ctaManBlock).toContain('transform: rotate(1.1deg);')
    expect(stylesheet).toContain(`.course-page__cta-visual {
    display: none;
  }`)
    expect(mobileBlock).toContain(`.course-page__container,
  .course-page__banner,
  .course-page__suitable,
  .course-page__suitable-cards,
  .course-page__directions,
  .course-page__directions-card,
  .course-page__cta,
  .course-page__cta-inner {
    width: 100%;
    max-width: 100%;
  }`)
    expect(mobileBlock).toContain(`.course-page__container {
    width: calc(100% - 32px);
    padding-inline: 0;
  }`)
    expect(mobileBlock).toContain(`.course-page__suitable-card {
    flex: none;
  }`)
    expect(stylesheet).not.toMatch(/CoursePage-module__/)
    expect(stylesheet).not.toMatch(/(^|})\s*#[A-Za-z_-]/)
  })

  it('keeps shared Container and AppHeader desktop width behavior unchanged', () => {
    const containerStylesheet = getSharedContainerStylesheet()
    const appHeaderStylesheet = getAppHeaderStylesheet()
    const sharedContainerBlock = getRuleBlock(containerStylesheet, '.container')
    const appHeaderContainerBlock = getRuleBlock(appHeaderStylesheet, '.app-header__container')

    expect(sharedContainerBlock).toContain('width: 100%;')
    expect(sharedContainerBlock).toContain('max-width: var(--container-max-width);')
    expect(sharedContainerBlock).toContain('padding-right: var(--container-padding-desktop);')
    expect(sharedContainerBlock).toContain('padding-left: var(--container-padding-desktop);')
    expect(sharedContainerBlock).not.toContain('padding-inline: 0;')
    expect(appHeaderContainerBlock).toContain('max-width: 1208px;')
  })

  it('does not use generated CSS module selectors in CoursePage sources', () => {
    const stylesheet = getCoursePageStylesheet()
    const source = getCoursePageSource()

    expect(stylesheet).not.toMatch(/CoursePage-module__/)
    expect(source).not.toMatch(/CoursePage-module__/)
  })
})
