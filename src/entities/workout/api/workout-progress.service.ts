import { requestFitnessApi } from '@shared/api/fitnessApi'
import type {
  WorkoutProgressDto,
  WorkoutProgressSaveRequestDto,
  WorkoutProgressSaveResponseDto,
} from '@shared/api/types/workout-progress.dto'

import { loadCourseWorkouts } from './workout.service'
import type { WorkoutProgress, WorkoutProgressSavePayload } from '../model/workout-progress.types'
import { calculateCourseProgressPercent } from '../model/workout-progress.utils'

export function loadWorkoutProgress(
  token: string,
  courseId: string,
  workoutId: string,
  signal?: AbortSignal,
): Promise<WorkoutProgress> {
  return requestFitnessApi<WorkoutProgressDto>(
    `/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
    {
      signal,
      token,
    },
  ).then((progress) => ({
    courseId,
    progressData: Array.isArray(progress.progressData) ? progress.progressData : [],
    workoutCompleted: Boolean(progress.workoutCompleted),
    workoutId: progress.workoutId ?? workoutId,
  }))
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
  const workouts = await loadCourseWorkouts(token, courseId, signal)
  const workoutProgressItems = await Promise.all(
    workouts.map((workout) =>
      loadWorkoutProgress(token, courseId, workout.id, signal).catch(() => ({
        courseId,
        progressData: [],
        workoutCompleted: false,
        workoutId: workout.id,
      })),
    ),
  )

  return calculateCourseProgressPercent({
    workouts: workouts.map((workout, index) => ({
      exercises: workout.exercises,
      progressData: workoutProgressItems[index]?.progressData ?? [],
    })),
  })
}
