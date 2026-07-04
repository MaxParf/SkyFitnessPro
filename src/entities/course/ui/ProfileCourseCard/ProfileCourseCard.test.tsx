import { readFileSync } from 'node:fs'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Course } from '../../model/course.types'
import { ProfileCourseCard } from './ProfileCourseCard'

const course: Course = {
  dailyDurationLabel: '10-30 мин/день',
  description: 'Описание курса',
  directions: ['Дыхание'],
  difficultyLabel: 'Начальный',
  durationLabel: '20 дней',
  fitting: ['Новичкам'],
  id: 'test-course',
  imageSrc: '/image.jpg',
  imageVariant: 'yoga',
  title: 'Йога',
  workoutIds: ['workout-1'],
}

function getProfileCourseCardStylesheet(): string {
  return readFileSync(
    'src/entities/course/ui/ProfileCourseCard/ProfileCourseCard.module.scss',
    'utf8',
  )
}

function getRuleBlock(stylesheet: string, selector: string): string {
  const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const ruleBlock = stylesheet.match(new RegExp(`${selectorPattern} \\{[\\s\\S]*?\\n\\}`))?.[0]

  expect(ruleBlock).toBeDefined()

  return ruleBlock ?? ''
}

describe('ProfileCourseCard', () => {
  it('renders course title', () => {
    render(<ProfileCourseCard course={course} progressPercent={40} />)

    expect(screen.getByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })

  it('renders progress label', () => {
    render(<ProfileCourseCard course={course} progressPercent={40} />)

    expect(screen.getByText('Прогресс 40%')).toBeInTheDocument()
  })

  it('renders continue action for progress between zero and complete', () => {
    render(<ProfileCourseCard course={course} progressPercent={40} />)

    expect(screen.getByRole('button', { name: 'Продолжить' })).toBeInTheDocument()
  })

  it('renders start action for zero progress', () => {
    render(<ProfileCourseCard course={course} progressPercent={0} />)

    expect(screen.getByRole('button', { name: 'Начать тренировки' })).toBeInTheDocument()
  })

  it('renders restart action for complete progress', () => {
    render(<ProfileCourseCard course={course} progressPercent={100} />)

    expect(screen.getByRole('button', { name: 'Начать заново' })).toBeInTheDocument()
  })

  it('renders accessible remove button label', () => {
    render(<ProfileCourseCard course={course} progressPercent={40} />)

    expect(screen.getByRole('button', { name: 'Удалить курс Йога' })).toBeInTheDocument()
  })

  it('handles rejected async remove callback without bubbling from click', async () => {
    const user = userEvent.setup()
    const handleRemoveClick = jest
      .fn<Promise<void>, [string]>()
      .mockRejectedValue(new Error('Fail'))

    render(
      <ProfileCourseCard course={course} onRemoveClick={handleRemoveClick} progressPercent={40} />,
    )

    await expect(
      user.click(screen.getByRole('button', { name: 'Удалить курс Йога' })),
    ).resolves.toBe(undefined)
    expect(handleRemoveClick).toHaveBeenCalledWith('test-course')
  })

  it('keeps desktop content width from shrinking', () => {
    const stylesheet = getProfileCourseCardStylesheet()
    const contentBlock = getRuleBlock(stylesheet, '.profile-course-card__content')

    expect(contentBlock).toContain('width: 300px;')
    expect(contentBlock).not.toContain('max-width: calc(100% - 52px);')
    expect(stylesheet).not.toMatch(/ProfileCourseCard-module__/)
    expect(stylesheet).not.toMatch(/(^|})\s*#[A-Za-z_-]/)
  })
})
