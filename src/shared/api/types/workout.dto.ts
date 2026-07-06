export type WorkoutExerciseDto = {
  _id: string
  name: string
  quantity: number
}

export type WorkoutDto = {
  _id: string
  exercises: WorkoutExerciseDto[]
  name: string
  video: string
}
