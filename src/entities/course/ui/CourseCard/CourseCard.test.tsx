import { render, screen } from '@testing-library/react'

import type { Course } from '../../model/course.types'
import { CourseCard } from './CourseCard'

const course: Course = {
  id: 'test-course',
  title: 'Йога',
  imageSrc: '/image.jpg',
  imageVariant: 'yoga',
  durationLabel: '20 дней',
  dailyDurationLabel: '10-30 мин/день',
  difficultyLabel: 'Начальный',
  workoutIds: ['workout-1'],
}

describe('CourseCard', () => {
  it('renders course title', () => {
    render(<CourseCard course={course} />)

    expect(screen.getByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })

  it('renders accessible add button label', () => {
    render(<CourseCard course={course} />)

    expect(screen.getByRole('button', { name: 'Добавить курс: Йога' })).toBeInTheDocument()
  })
})
