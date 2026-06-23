import calendarIcon from '@image/calendar.svg'
import clockIcon from '@image/clock.svg'
import plusIcon from '@image/plus.svg'
import signalIcon from '@image/signal.svg'
import { Button } from '@shared/ui/Button'
import { Icon } from '@shared/ui/Icon'
import { MetaBadge } from '@shared/ui/MetaBadge'

import type { Course, CourseId, CourseImageVariant } from '../../model/course.types'
import styles from './CourseCard.module.scss'

const imageVariantClassNames: Record<CourseImageVariant, string> = {
  yoga: styles['course-card__image--yoga'],
  stretching: styles['course-card__image--stretching'],
  fitness: styles['course-card__image--fitness'],
  stepAerobics: styles['course-card__image--step-aerobics'],
  bodyflex: styles['course-card__image--bodyflex'],
}

export type CourseCardProps = {
  course: Course
  onAddClick?: (courseId: CourseId) => Promise<void> | void
}

export function CourseCard({ course, onAddClick }: CourseCardProps) {
  const imageClassName = [
    styles['course-card__image'],
    course.imageVariant ? imageVariantClassNames[course.imageVariant] : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleAddClick = (): void => {
    onAddClick?.(course.id)
  }

  return (
    <article className={styles['course-card']}>
      <div className={styles['course-card__image-wrapper']}>
        <img className={imageClassName} src={course.imageSrc} alt="" />
        <Button
          aria-label={`Добавить курс: ${course.title}`}
          className={styles['course-card__add-button']}
          onClick={handleAddClick}
          variant="icon"
        >
          <Icon
            alt=""
            className={styles['course-card__add-icon']}
            decorative
            size="medium"
            src={plusIcon}
          />
        </Button>
      </div>

      <div className={styles['course-card__content']}>
        <h2 className={styles['course-card__title']}>{course.title}</h2>
        <ul
          className={styles['course-card__meta-list']}
          aria-label={`Параметры курса ${course.title}`}
        >
          <li className={styles['course-card__meta-item']}>
            <MetaBadge iconSrc={calendarIcon} text={course.durationLabel} />
          </li>
          <li className={styles['course-card__meta-item']}>
            <MetaBadge iconSrc={clockIcon} text={course.dailyDurationLabel} />
          </li>
          <li className={styles['course-card__meta-item']}>
            <MetaBadge iconSrc={signalIcon} text={course.difficultyLabel} />
          </li>
        </ul>
      </div>
    </article>
  )
}
