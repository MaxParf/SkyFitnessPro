import { requestFitnessApi } from '@shared/api/fitnessApi'
import { deduplicateInFlightRequest } from '@shared/api/inFlightRequestDedup'
import type { WorkoutDto } from '@shared/api/types/workout.dto'

import { mapWorkoutDtoToWorkout, mapWorkoutDtosToWorkouts } from '../model/workout.mapper'
import type { Workout, WorkoutId } from '../model/workout.types'

const courseWorkoutsRequests = new Map<string, Promise<Workout[]>>()
const workoutRequests = new Map<string, Promise<Workout>>()

export function loadCourseWorkouts(
  token: string,
  courseId: string,
  signal?: AbortSignal,
): Promise<Workout[]> {
  return deduplicateInFlightRequest({
    key: `${token}:${courseId}`,
    request: () =>
      requestFitnessApi<WorkoutDto[]>(`/courses/${courseId}/workouts`, {
        token,
      }).then(mapWorkoutDtosToWorkouts),
    requests: courseWorkoutsRequests,
    signal,
  })
}

export function loadWorkout(
  token: string,
  workoutId: WorkoutId,
  signal?: AbortSignal,
): Promise<Workout> {
  return deduplicateInFlightRequest({
    key: `${token}:${workoutId}`,
    request: () =>
      requestFitnessApi<WorkoutDto>(`/workouts/${workoutId}`, {
        token,
      }).then(mapWorkoutDtoToWorkout),
    requests: workoutRequests,
    signal,
  })
}
