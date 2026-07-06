export type WorkoutId = string

export type WorkoutExercise = {
  id: string
  name: string
  quantity: number
  progressPercent: number
}

export type Workout = {
  id: WorkoutId
  exercises: WorkoutExercise[]
  courseTitle: string
  name: string
  previewImageUrl: string
  videoUrl: string
}

export type WorkoutListItem = {
  description: string
  id: WorkoutId
  isCompleted: boolean
  title: string
}
