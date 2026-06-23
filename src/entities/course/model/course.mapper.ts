import imageBodyFlex from '@image/image_5.jpg'
import imageFitness from '@image/image_3.jpg'
import imageStepAerobics from '@image/image_4.jpg'
import imageStretching from '@image/image_2.jpg'
import imageYoga from '@image/image_1.jpg'

import type { CourseDto } from '@shared/api/types/course.dto'

import type { Course, CourseImageVariant } from './course.types'

type CoursePresentation = {
  dailyDurationLabel: string
  difficultyLabel: string
  durationLabel: string
  imageSrc: string
  imageVariant: CourseImageVariant
}

const coursePresentationById: Record<string, CoursePresentation> = {
  '6i67sm': {
    dailyDurationLabel: '20-50 мин/день',
    difficultyLabel: 'Средний',
    durationLabel: '25 дней',
    imageSrc: imageStepAerobics,
    imageVariant: 'stepAerobics',
  },
  ab1c3f: {
    dailyDurationLabel: '10-30 мин/день',
    difficultyLabel: 'Начальный',
    durationLabel: '20 дней',
    imageSrc: imageYoga,
    imageVariant: 'yoga',
  },
  kfpq8e: {
    dailyDurationLabel: '30-45 мин/день',
    difficultyLabel: 'Начальный',
    durationLabel: '40 дней',
    imageSrc: imageStretching,
    imageVariant: 'stretching',
  },
  q02a6i: {
    dailyDurationLabel: '50-70 мин/день',
    difficultyLabel: 'Сложный',
    durationLabel: '15 дней',
    imageSrc: imageBodyFlex,
    imageVariant: 'bodyflex',
  },
  ypox9r: {
    dailyDurationLabel: '45-60 мин/день',
    difficultyLabel: 'Сложный',
    durationLabel: '20 дней',
    imageSrc: imageFitness,
    imageVariant: 'fitness',
  },
}

const fallbackCoursePresentation: CoursePresentation = {
  dailyDurationLabel: '30-45 мин/день',
  difficultyLabel: 'Начальный',
  durationLabel: '20 дней',
  imageSrc: imageYoga,
  imageVariant: 'yoga',
}

export function mapCourseDtoToCourse(courseDto: CourseDto): Course {
  const presentation = coursePresentationById[courseDto._id] ?? fallbackCoursePresentation

  return {
    dailyDurationLabel: presentation.dailyDurationLabel,
    difficultyLabel: presentation.difficultyLabel,
    durationLabel: presentation.durationLabel,
    id: courseDto._id,
    imageSrc: presentation.imageSrc,
    imageVariant: presentation.imageVariant,
    title: courseDto.nameRU,
  }
}

export function mapCourseDtosToCourses(courseDtos: CourseDto[]): Course[] {
  return courseDtos.map(mapCourseDtoToCourse)
}
