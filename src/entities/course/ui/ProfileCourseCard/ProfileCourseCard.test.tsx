import { render, screen } from '@testing-library/react'

import type { Course } from '../../model/course.types'
import { ProfileCourseCard } from './ProfileCourseCard'

const course: Course = {
  dailyDurationLabel: '10-30 мин/день',
  difficultyLabel: 'Начальный',
  durationLabel: '20 дней',
  id: 'test-course',
  imageSrc: '/image.jpg',
  imageVariant: 'yoga',
  title: 'Йога',
  workoutIds: ['workout-1'],
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
})
