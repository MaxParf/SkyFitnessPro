import type { CourseDto } from '@shared/api/types/course.dto'

import { mapCourseDtoToCourse, mapCourseDtosToCourses } from './course.mapper'

const yogaDto: CourseDto = {
  _id: 'ab1c3f',
  description: 'Описание курса',
  directions: [],
  fitting: [],
  nameEN: 'Yoga',
  nameRU: 'Йога',
  workouts: ['17oz5f'],
}

describe('course.mapper', () => {
  it('maps API course dto to UI course model', () => {
    expect(mapCourseDtoToCourse(yogaDto)).toMatchObject({
      dailyDurationLabel: '10-30 мин/день',
      difficultyLabel: 'Начальный',
      durationLabel: '20 дней',
      id: 'ab1c3f',
      imageVariant: 'yoga',
      title: 'Йога',
    })
  })

  it('maps API course dto arrays', () => {
    expect(mapCourseDtosToCourses([yogaDto])).toHaveLength(1)
  })
})
