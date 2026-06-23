import { requestFitnessApi } from '@shared/api/fitnessApi'
import type { CourseDto } from '@shared/api/types/course.dto'

import { mapCourseDtosToCourses } from '../model/course.mapper'
import type { Course } from '../model/course.types'

export function loadCourses(signal?: AbortSignal): Promise<Course[]> {
  return requestFitnessApi<CourseDto[]>('/courses', { signal }).then(mapCourseDtosToCourses)
}
