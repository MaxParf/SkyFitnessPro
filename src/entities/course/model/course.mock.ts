import imageBodyFlex from '@image/image_5.jpg'
import imageFitness from '@image/image_3.jpg'
import imageStepAerobics from '@image/image_4.jpg'
import imageStretching from '@image/image_2.jpg'
import imageYoga from '@image/image_1.jpg'

import type { Course } from './course.types'

export const courseMockItems: Course[] = [
  {
    description: 'Курс поможет мягко развить гибкость, укрепить мышцы и снизить уровень стресса.',
    directions: ['Йога для новичков', 'Утренняя практика', 'Дыхание', 'Растяжка', 'Баланс'],
    fitting: [
      'Давно хотели попробовать йогу, но не решались начать',
      'Хотите укрепить тело без ударной нагрузки',
      'Ищете спокойные тренировки для дома',
    ],
    id: 'ab1c3f',
    title: 'Йога',
    imageSrc: imageYoga,
    imageVariant: 'yoga',
    durationLabel: '20 дней',
    dailyDurationLabel: '10-30 мин/день',
    difficultyLabel: 'Начальный',
    workoutIds: ['3yvozj', 'hfgxlo', 'kcx5ai', 'kt6ah4', 'mrhuag'],
  },
  {
    description: 'Курс на развитие подвижности, гибкости и расслабление мышц после нагрузки.',
    directions: ['Здоровая спина', 'Гибкость', 'Расслабление', 'Мобильность', 'Осанка'],
    fitting: [
      'Хотите улучшить гибкость и подвижность',
      'Много сидите и чувствуете напряжение',
      'Любите мягкие тренировки без спешки',
    ],
    id: 'kfpq8e',
    title: 'Стретчинг',
    imageSrc: imageStretching,
    imageVariant: 'stretching',
    durationLabel: '40 дней',
    dailyDurationLabel: '30-45 мин/день',
    difficultyLabel: 'Начальный',
    workoutIds: ['9mefwq', '9yolz2', 'pi5vtr'],
  },
  {
    description: 'Интенсивный курс для укрепления мышц, развития выносливости и тонуса.',
    directions: ['Силовые упражнения', 'Кардио', 'Пресс', 'Ягодицы', 'Выносливость'],
    fitting: [
      'Хотите тренироваться энергично и регулярно',
      'Готовы к сложной нагрузке',
      'Хотите укрепить мышцы всего тела',
    ],
    id: 'ypox9r',
    title: 'Фитнес',
    imageSrc: imageFitness,
    imageVariant: 'fitness',
    durationLabel: '20 дней',
    dailyDurationLabel: '45-60 мин/день',
    difficultyLabel: 'Сложный',
    workoutIds: ['gh7bd5', 'hwsut5', 'n18r8v', 'dq9rzo', 'rr70ie'],
  },
  {
    description: 'Динамичный курс с простыми связками, ритмом и нагрузкой средней интенсивности.',
    directions: ['Базовые шаги', 'Кардио', 'Координация', 'Ритм', 'Выносливость'],
    fitting: [
      'Любите активные тренировки под ритм',
      'Хотите развивать координацию',
      'Ищете кардио без сложного оборудования',
    ],
    id: '6i67sm',
    title: 'Степ-аэробика',
    imageSrc: imageStepAerobics,
    imageVariant: 'stepAerobics',
    durationLabel: '25 дней',
    dailyDurationLabel: '20-50 мин/день',
    difficultyLabel: 'Средний',
    workoutIds: ['e9ghsb', 'a1rqtt', 'mstcbg', 't3cpno'],
  },
  {
    description: 'Курс с дыхательными практиками и упражнениями на тонус глубоких мышц.',
    directions: ['Дыхание', 'Глубокие мышцы', 'Корпус', 'Тонус', 'Мягкая нагрузка'],
    fitting: [
      'Хотите начать с коротких тренировок',
      'Интересуетесь дыхательными практиками',
      'Ищете нагрузку без резких движений',
    ],
    id: 'q02a6i',
    title: 'Бодифлекс',
    imageSrc: imageBodyFlex,
    imageVariant: 'bodyflex',
    durationLabel: '15 дней',
    dailyDurationLabel: '50-70 мин/день',
    difficultyLabel: 'Сложный',
    workoutIds: ['xlpkqy', '17oz5f', 'pyvaec'],
  },
]
