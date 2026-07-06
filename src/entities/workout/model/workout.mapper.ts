import type { WorkoutDto } from '@shared/api/types/workout.dto'

import type { Workout, WorkoutListItem } from './workout.types'

const workoutCourseTitleById: Record<string, string> = {
  '3yvozj': 'Йога',
  hfgxlo: 'Йога',
  kcx5ai: 'Йога',
  kt6ah4: 'Йога',
  mrhuag: 'Йога',
  '9mefwq': 'Стретчинг',
  '9yolz2': 'Стретчинг',
  pi5vtr: 'Стретчинг',
  gh7bd5: 'Фитнес',
  hwsut5: 'Фитнес',
  n18r8v: 'Фитнес',
  dq9rzo: 'Фитнес',
  rr70ie: 'Фитнес',
  e9ghsb: 'Степ-аэробика',
  a1rqtt: 'Степ-аэробика',
  mstcbg: 'Степ-аэробика',
  t3cpno: 'Степ-аэробика',
  xlpkqy: 'Бодифлекс',
  '17oz5f': 'Бодифлекс',
  pyvaec: 'Бодифлекс',
}

export function mapWorkoutDtoToWorkout(workoutDto: WorkoutDto): Workout {
  return {
    exercises: workoutDto.exercises.map((exercise) => ({
      id: exercise._id,
      name: exercise.name,
      progressPercent: 0,
      quantity: exercise.quantity,
    })),
    courseTitle: workoutCourseTitleById[workoutDto._id] ?? 'Тренировка',
    id: workoutDto._id,
    name: workoutDto.name,
    previewImageUrl: getYoutubePreviewUrl(workoutDto.video),
    videoUrl: workoutDto.video,
  }
}

export function mapWorkoutDtosToWorkouts(workoutDtos: WorkoutDto[]): Workout[] {
  return workoutDtos.map(mapWorkoutDtoToWorkout)
}

export function mapWorkoutToListItem(workout: Workout): WorkoutListItem {
  return {
    description: 'Видео-тренировка',
    id: workout.id,
    isCompleted: false,
    title: workout.name,
  }
}

export function mapWorkoutsToListItems(workouts: Workout[]): WorkoutListItem[] {
  return workouts.map(mapWorkoutToListItem)
}

function getYoutubePreviewUrl(videoUrl: string): string {
  const videoId = getYoutubeVideoId(videoUrl)

  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ''
}

function getYoutubeVideoId(videoUrl: string): string {
  const embedMatch = /\/embed\/([^?&/]+)/.exec(videoUrl)

  return embedMatch?.[1] ?? ''
}
