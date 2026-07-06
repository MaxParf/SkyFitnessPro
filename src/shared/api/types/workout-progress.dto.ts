export type WorkoutProgressDto = {
  progressData?: number[]
  workoutCompleted?: boolean
  workoutId?: string
}

export type CourseWorkoutProgressDto = {
  progressData?: number[]
  workoutCompleted?: boolean
  workoutId?: string
}

export type CourseProgressDto = {
  courseCompleted?: boolean
  courseId?: string
  workoutsProgress?: CourseWorkoutProgressDto[]
}

export type WorkoutProgressSaveRequestDto = {
  progressData: number[]
}

export type WorkoutProgressSaveResponseDto = {
  message?: string
}
