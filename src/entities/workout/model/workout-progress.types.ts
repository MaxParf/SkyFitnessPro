import type { CourseId } from '@entities/course/model/course.types'

import type { WorkoutId } from './workout.types'
import type { WorkoutExercise } from './workout.types'

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5

export type ExerciseProgressInput = {
  exerciseId: string
  exerciseName: string
  maxValue: number
  percent: number
  value: number
}

export type WorkoutProgress = {
  courseId: CourseId
  progressData: number[]
  workoutCompleted: boolean
  workoutId: WorkoutId
}

export type WorkoutProgressSavePayload = {
  courseId: CourseId
  progressData: number[]
  workoutId: WorkoutId
}

export type WorkoutProgressCalculationInput = {
  exercises: Pick<WorkoutExercise, 'quantity'>[]
  progressData?: number[]
}

export type CourseProgressCalculationInput = {
  workouts: WorkoutProgressCalculationInput[]
}
