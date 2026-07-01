export type CourseId = string

export type CourseImageVariant = 'yoga' | 'stretching' | 'fitness' | 'stepAerobics' | 'bodyflex'

export type Course = {
  description: string
  directions: string[]
  id: CourseId
  title: string
  imageSrc: string
  imageVariant?: CourseImageVariant
  fitting: string[]
  durationLabel: string
  dailyDurationLabel: string
  difficultyLabel: string
  workoutIds: string[]
}
