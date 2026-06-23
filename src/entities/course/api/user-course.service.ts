import { requestFitnessApi } from '@shared/api/fitnessApi'
import type { UserCourseMutationResponseDto, UserProfileDto } from '@shared/api/types/user.dto'

import type { CourseId } from '../model/course.types'

export function loadUserProfile(token: string): Promise<UserProfileDto> {
  return requestFitnessApi<UserProfileDto>('/users/me', {
    token,
  })
}

export function addUserCourse(
  token: string,
  courseId: CourseId,
): Promise<UserCourseMutationResponseDto> {
  return requestFitnessApi<UserCourseMutationResponseDto>('/users/me/courses', {
    body: { courseId },
    method: 'POST',
    token,
  })
}

export function removeUserCourse(
  token: string,
  courseId: CourseId,
): Promise<UserCourseMutationResponseDto> {
  return requestFitnessApi<UserCourseMutationResponseDto>(`/users/me/courses/${courseId}`, {
    method: 'DELETE',
    token,
  })
}
