export type CourseId = string

export type CourseImageVariant = 'yoga' | 'stretching' | 'fitness' | 'stepAerobics' | 'bodyflex'

export type Course = {
  id: CourseId
  title: string
  imageSrc: string
  imageVariant?: CourseImageVariant
  durationLabel: string
  dailyDurationLabel: string
  difficultyLabel: string
}
