import { requestFitnessApi } from '@shared/api/fitnessApi'
import { deduplicateInFlightRequest } from '@shared/api/inFlightRequestDedup'
import type {
  CourseProgressDto,
  WorkoutProgressDto,
  WorkoutProgressSaveRequestDto,
  WorkoutProgressSaveResponseDto,
} from '@shared/api/types/workout-progress.dto'

import { courseMockItems } from '@entities/course/model/course.mock'

import type { WorkoutProgress, WorkoutProgressSavePayload } from '../model/workout-progress.types'
import { calculateCourseProgressByCompletedWorkouts } from '../model/workout-progress.utils'

const courseProgressRequests = new Map<string, Promise<number>>()
const workoutProgressRequests = new Map<string, Promise<WorkoutProgress>>()

export function loadWorkoutProgress(
  token: string,
  courseId: string,
  workoutId: string,
  signal?: AbortSignal,
): Promise<WorkoutProgress> {
  return deduplicateInFlightRequest({
    key: `${token}:${courseId}:${workoutId}`,
    request: () =>
      requestFitnessApi<WorkoutProgressDto>(
        `/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
        {
          token,
        },
      ).then((progress) => ({
        courseId,
        progressData: Array.isArray(progress.progressData) ? progress.progressData : [],
        workoutCompleted: Boolean(progress.workoutCompleted),
        workoutId: progress.workoutId ?? workoutId,
      })),
    requests: workoutProgressRequests,
    signal,
  })
}

export function saveWorkoutProgress(
  token: string,
  payload: WorkoutProgressSavePayload,
): Promise<WorkoutProgressSaveResponseDto> {
  const body: WorkoutProgressSaveRequestDto = {
    progressData: payload.progressData,
  }

  return requestFitnessApi<WorkoutProgressSaveResponseDto>(
    `/courses/${payload.courseId}/workouts/${payload.workoutId}`,
    {
      body,
      method: 'PATCH',
      token,
    },
  )
}

export async function loadCourseProgressPercent(
  token: string,
  courseId: string,
  signal?: AbortSignal,
): Promise<number> {
  return deduplicateInFlightRequest({
    key: `${token}:${courseId}`,
    request: () => loadCourseProgressPercentOnce(token, courseId),
    requests: courseProgressRequests,
    signal,
  })
}

async function loadCourseProgressPercentOnce(
  token: string,
  courseId: string,
  signal?: AbortSignal,
): Promise<number> {
  const progress = await requestFitnessApi<CourseProgressDto>(
    `/users/me/progress?courseId=${courseId}`,
    {
      signal,
      token,
    },
  )

  const workoutsProgress = Array.isArray(progress.workoutsProgress) ? progress.workoutsProgress : []
  const totalWorkoutsCount =
    courseMockItems.find((course) => course.id === courseId)?.workoutIds.length ??
    workoutsProgress.length
  const completedWorkoutsCount = workoutsProgress.filter((workoutProgress) =>
    Boolean(workoutProgress.workoutCompleted),
  ).length

  return calculateCourseProgressByCompletedWorkouts({
    completedWorkoutsCount,
    totalWorkoutsCount,
  })
}
