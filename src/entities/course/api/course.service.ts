import { requestFitnessApi } from '@shared/api/fitnessApi'
import { deduplicateInFlightRequest } from '@shared/api/inFlightRequestDedup'
import type { CourseDto } from '@shared/api/types/course.dto'

import { mapCourseDtosToCourses } from '../model/course.mapper'
import type { Course } from '../model/course.types'

const coursesRequests = new Map<string, Promise<Course[]>>()

export function loadCourses(signal?: AbortSignal): Promise<Course[]> {
  return deduplicateInFlightRequest({
    key: 'courses',
    request: () => requestFitnessApi<CourseDto[]>('/courses').then(mapCourseDtosToCourses),
    requests: coursesRequests,
    signal,
  })
}
