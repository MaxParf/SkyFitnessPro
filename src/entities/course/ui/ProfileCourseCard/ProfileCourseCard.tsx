import calendarIcon from '@image/calendar.svg'
import clockIcon from '@image/clock.svg'
import minusIcon from '@image/minus.svg'
import signalIcon from '@image/signal.svg'
import { Button } from '@shared/ui/Button'
import { Icon } from '@shared/ui/Icon'
import { MetaBadge } from '@shared/ui/MetaBadge'
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'

import type { Course, CourseId, CourseImageVariant } from '../../model/course.types'
import styles from './ProfileCourseCard.module.scss'

const imageVariantClassNames: Record<CourseImageVariant, string> = {
  yoga: styles['profile-course-card__image--yoga'],
  stretching: styles['profile-course-card__image--stretching'],
  fitness: styles['profile-course-card__image--fitness'],
  stepAerobics: styles['profile-course-card__image--step-aerobics'],
  bodyflex: styles['profile-course-card__image--bodyflex'],
}

type ProgressStyle = CSSProperties & {
  '--profile-course-card-progress': string
}

export type ProfileCourseCardProps = {
  course: Course
  onActionClick?: (courseId: CourseId) => void
  onCardClick?: (courseId: CourseId) => void
  onRemoveClick?: (courseId: CourseId) => void
  progressPercent: number
}

function getClampedProgress(progressPercent: number): number {
  return Math.min(100, Math.max(0, progressPercent))
}

function getActionText(progressPercent: number): string {
  if (progressPercent <= 0) {
    return 'Начать тренировки'
  }

  if (progressPercent >= 100) {
    return 'Начать заново'
  }

  return 'Продолжить'
}

export function ProfileCourseCard({
  course,
  onActionClick,
  onCardClick,
  onRemoveClick,
  progressPercent,
}: ProfileCourseCardProps) {
  const progress = getClampedProgress(progressPercent)
  const imageClassName = [
    styles['profile-course-card__image'],
    course.imageVariant ? imageVariantClassNames[course.imageVariant] : '',
  ]
    .filter(Boolean)
    .join(' ')
  const progressStyle: ProgressStyle = {
    '--profile-course-card-progress': `${progress}%`,
  }

  const handleCardClick = (): void => {
    onCardClick?.(course.id)
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick()
    }
  }

  const handleActionClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    onActionClick?.(course.id)
  }

  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    onRemoveClick?.(course.id)
  }

  return (
    <article
      aria-label={`Открыть тренировки курса ${course.title}`}
      className={styles['profile-course-card']}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles['profile-course-card__image-wrapper']}>
        <img alt="" className={imageClassName} src={course.imageSrc} />
        <Button
          aria-label={`Удалить курс ${course.title}`}
          className={styles['profile-course-card__remove-button']}
          onClick={handleRemoveClick}
          variant="icon"
        >
          <Icon
            alt=""
            className={styles['profile-course-card__remove-icon']}
            decorative
            size="medium"
            src={minusIcon}
          />
        </Button>
      </div>

      <div className={styles['profile-course-card__content']}>
        <h2 className={styles['profile-course-card__title']}>{course.title}</h2>
        <ul
          aria-label={`Параметры курса ${course.title}`}
          className={styles['profile-course-card__meta']}
        >
          <li className={styles['profile-course-card__meta-item']}>
            <MetaBadge iconSrc={calendarIcon} text={course.durationLabel} />
          </li>
          <li className={styles['profile-course-card__meta-item']}>
            <MetaBadge iconSrc={clockIcon} text={course.dailyDurationLabel} />
          </li>
          <li className={styles['profile-course-card__meta-item']}>
            <MetaBadge iconSrc={signalIcon} text={course.difficultyLabel} />
          </li>
        </ul>

        <div className={styles['profile-course-card__progress']}>
          <p className={styles['profile-course-card__progress-label']}>Прогресс {progress}%</p>
          <div className={styles['profile-course-card__progress-track']}>
            <div className={styles['profile-course-card__progress-value']} style={progressStyle} />
          </div>
        </div>

        <Button
          className={styles['profile-course-card__action']}
          onClick={handleActionClick}
          type="button"
        >
          {getActionText(progress)}
        </Button>
      </div>
    </article>
  )
}
