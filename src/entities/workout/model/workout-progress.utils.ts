import { courseMockItems } from '@entities/course/model/course.mock'
import type { CourseId } from '@entities/course/model/course.types'

import type {
  CourseProgressCalculationInput,
  DifficultyLevel,
  ExerciseProgressInput,
  WorkoutProgressCalculationInput,
} from './workout-progress.types'
import type { WorkoutExercise, WorkoutId } from './workout.types'

export const defaultDifficultyLevel: DifficultyLevel = 1

export function calculateExerciseProgressPercent(params: {
  difficultyLevel: DifficultyLevel
  maxValue: number
  value: number
}): number {
  const { maxValue, value } = params

  if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(maxValue) || maxValue <= 0) {
    return 0
  }

  return Math.min(100, Math.round((value / maxValue) * 100))
}

export function getExerciseMaxValue(exercise: Pick<WorkoutExercise, 'quantity'>): number {
  return Number.isFinite(exercise.quantity) && exercise.quantity > 0 ? exercise.quantity : 100
}

export function mapExercisesToProgressInputs(params: {
  difficultyLevel?: DifficultyLevel
  exercises: WorkoutExercise[]
  progressData: number[]
}): ExerciseProgressInput[] {
  const difficultyLevel = params.difficultyLevel ?? defaultDifficultyLevel

  return params.exercises.map((exercise, index) => {
    const value = params.progressData[index] ?? 0
    const maxValue = getExerciseMaxValue(exercise)

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      maxValue,
      percent: calculateExerciseProgressPercent({
        difficultyLevel,
        maxValue,
        value,
      }),
      value,
    }
  })
}

export function calculateWorkoutProgressPercent(params: WorkoutProgressCalculationInput): number {
  if (params.exercises.length === 0) {
    return 0
  }

  const totalPercent = params.exercises.reduce((sum, exercise, index) => {
    return (
      sum +
      calculateExerciseProgressPercent({
        difficultyLevel: defaultDifficultyLevel,
        maxValue: getExerciseMaxValue(exercise),
        value: params.progressData?.[index] ?? 0,
      })
    )
  }, 0)

  return Math.round(totalPercent / params.exercises.length)
}

export function calculateCourseProgressPercent(params: CourseProgressCalculationInput): number {
  const allExercisePercents = params.workouts.flatMap((workout) =>
    workout.exercises.map((exercise, index) =>
      calculateExerciseProgressPercent({
        difficultyLevel: defaultDifficultyLevel,
        maxValue: getExerciseMaxValue(exercise),
        value: workout.progressData?.[index] ?? 0,
      }),
    ),
  )

  if (allExercisePercents.length === 0) {
    return 0
  }

  const totalPercent = allExercisePercents.reduce((sum, percent) => sum + percent, 0)

  return Math.round(totalPercent / allExercisePercents.length)
}

export function getCourseIdByWorkoutId(workoutId: WorkoutId): CourseId | null {
  return courseMockItems.find((course) => course.workoutIds.includes(workoutId))?.id ?? null
}
