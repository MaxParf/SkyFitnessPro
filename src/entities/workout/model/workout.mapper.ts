import type { WorkoutDto } from '@shared/api/types/workout.dto'

import type { Workout, WorkoutListItem } from './workout.types'

const workoutCourseTitleById: Record<string, string> = {
  '17oz5f': 'Йога',
  xlpkqy: 'Йога',
  pyvaec: 'Йога',
  a1rqtt: 'Йога',
  vp4mas: 'Йога',
  r3yaxb: 'Стретчинг',
  '1pmjgw': 'Стретчинг',
  okz3t1: 'Стретчинг',
  kcx5ai: 'Стретчинг',
  p9r9n5: 'Стретчинг',
  hfgxlo: 'Фитнес',
  k3rfhi: 'Фитнес',
  '9mefwq': 'Фитнес',
  '9yolz2': 'Фитнес',
  '9og0lc': 'Фитнес',
  ixkxrt: 'Степ-аэробика',
  '1yyv12': 'Степ-аэробика',
  kssaqg: 'Степ-аэробика',
  u0it5i: 'Степ-аэробика',
  '7t6kps': 'Степ-аэробика',
  mk9n7n: 'Бодифлекс',
  i6er3p: 'Бодифлекс',
  d5vdz5: 'Бодифлекс',
  lo4eiu: 'Бодифлекс',
  '5dnk32': 'Бодифлекс',
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
