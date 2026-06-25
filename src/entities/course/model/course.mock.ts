import imageBodyFlex from '@image/image_5.jpg'
import imageFitness from '@image/image_3.jpg'
import imageStepAerobics from '@image/image_4.jpg'
import imageStretching from '@image/image_2.jpg'
import imageYoga from '@image/image_1.jpg'

import type { Course } from './course.types'

export const courseMockItems: Course[] = [
  {
    id: 'ab1c3f',
    title: 'Йога',
    imageSrc: imageYoga,
    imageVariant: 'yoga',
    durationLabel: '20 дней',
    dailyDurationLabel: '10-30 мин/день',
    difficultyLabel: 'Начальный',
    workoutIds: ['17oz5f', 'xlpkqy', 'pyvaec', 'a1rqtt', 'vp4mas'],
  },
  {
    id: 'kfpq8e',
    title: 'Стретчинг',
    imageSrc: imageStretching,
    imageVariant: 'stretching',
    durationLabel: '40 дней',
    dailyDurationLabel: '30-45 мин/день',
    difficultyLabel: 'Начальный',
    workoutIds: ['r3yaxb', '1pmjgw', 'okz3t1', 'kcx5ai', 'p9r9n5'],
  },
  {
    id: 'ypox9r',
    title: 'Фитнес',
    imageSrc: imageFitness,
    imageVariant: 'fitness',
    durationLabel: '20 дней',
    dailyDurationLabel: '45-60 мин/день',
    difficultyLabel: 'Сложный',
    workoutIds: ['hfgxlo', 'k3rfhi', '9mefwq', '9yolz2', '9og0lc'],
  },
  {
    id: '6i67sm',
    title: 'Степ-аэробика',
    imageSrc: imageStepAerobics,
    imageVariant: 'stepAerobics',
    durationLabel: '25 дней',
    dailyDurationLabel: '20-50 мин/день',
    difficultyLabel: 'Средний',
    workoutIds: ['ixkxrt', '1yyv12', 'kssaqg', 'u0it5i', '7t6kps'],
  },
  {
    id: 'q02a6i',
    title: 'Бодифлекс',
    imageSrc: imageBodyFlex,
    imageVariant: 'bodyflex',
    durationLabel: '15 дней',
    dailyDurationLabel: '50-70 мин/день',
    difficultyLabel: 'Сложный',
    workoutIds: ['mk9n7n', 'i6er3p', 'd5vdz5', 'lo4eiu', '5dnk32'],
  },
]
