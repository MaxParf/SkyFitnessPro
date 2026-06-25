import { requestFitnessApi } from '@shared/api/fitnessApi'
import type { WorkoutDto } from '@shared/api/types/workout.dto'

import { mapWorkoutDtoToWorkout, mapWorkoutDtosToWorkouts } from '../model/workout.mapper'
import type { Workout, WorkoutId } from '../model/workout.types'

export function loadCourseWorkouts(
  token: string,
  courseId: string,
  signal?: AbortSignal,
): Promise<Workout[]> {
  return requestFitnessApi<WorkoutDto[]>(`/courses/${courseId}/workouts`, {
    signal,
    token,
  }).then(mapWorkoutDtosToWorkouts)
}

export function loadWorkout(
  token: string,
  workoutId: WorkoutId,
  signal?: AbortSignal,
): Promise<Workout> {
  return requestFitnessApi<WorkoutDto>(`/workouts/${workoutId}`, {
    signal,
    token,
  }).then(mapWorkoutDtoToWorkout)
}
