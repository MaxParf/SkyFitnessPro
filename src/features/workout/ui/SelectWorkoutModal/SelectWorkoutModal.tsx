import checkboxCircleIcon from '@image/checkbox_circle.svg'
import checkboxGreenIcon from '@image/checkbox_green.svg'
import { useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { loadCourseWorkouts } from '@entities/workout/api/workout.service'
import { mapWorkoutsToListItems } from '@entities/workout/model/workout.mapper'
import type { WorkoutListItem } from '@entities/workout/model/workout.types'
import { Button } from '@shared/ui/Button'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { ErrorState } from '@shared/ui/ErrorState/ErrorState'
import { Loader } from '@shared/ui/Loader/Loader'

import styles from './SelectWorkoutModal.module.scss'

export type SelectWorkoutModalProps = {
  courseId: string
  onClose: () => void
  token: string
}

type LoadState = 'error' | 'loading' | 'success'

export function SelectWorkoutModal({ courseId, onClose, token }: SelectWorkoutModalProps) {
  const navigate = useNavigate()
  const titleId = useId()
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('')
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([])

  useEffect(() => {
    const abortController = new AbortController()

    void loadCourseWorkouts(token, courseId, abortController.signal)
      .then((loadedWorkouts) => {
        const listItems = mapWorkoutsToListItems(loadedWorkouts)

        setWorkouts(listItems)
        setSelectedWorkoutId(listItems[0]?.id ?? '')
        setLoadState('success')
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setLoadState('error')
      })

    return () => {
      abortController.abort()
    }
  }, [courseId, token])

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [onClose])

  const handleStartClick = (): void => {
    if (!selectedWorkoutId) {
      return
    }

    onClose()
    navigate(`/workouts/${selectedWorkoutId}`)
  }

  const hasWorkouts = workouts.length > 0

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className={styles['select-workout-modal']}
      role="dialog"
    >
      <button
        aria-label="Закрыть выбор тренировки"
        className={styles['select-workout-modal__backdrop']}
        onClick={onClose}
        type="button"
      />

      <div className={styles['select-workout-modal__dialog']}>
        <h2 className={styles['select-workout-modal__title']} id={titleId}>
          Выберите тренировку
        </h2>

        <div className={styles['select-workout-modal__content']}>
          {loadState === 'loading' ? <Loader /> : null}

          {loadState === 'error' ? (
            <ErrorState
              title="Не удалось загрузить тренировки"
              description="Попробуйте открыть курс позже."
            />
          ) : null}

          {loadState === 'success' && !hasWorkouts ? (
            <EmptyState title="В этом курсе пока нет тренировок." />
          ) : null}

          {loadState === 'success' && hasWorkouts ? (
            <ul className={styles['select-workout-modal__list']}>
              {workouts.map((workout, index) => {
                const isSelected = workout.id === selectedWorkoutId
                const checkboxIcon =
                  isSelected || workout.isCompleted ? checkboxGreenIcon : checkboxCircleIcon

                return (
                  <li className={styles['select-workout-modal__item']} key={workout.id}>
                    <button
                      aria-pressed={isSelected}
                      className={styles['select-workout-modal__item-button']}
                      onClick={() => setSelectedWorkoutId(workout.id)}
                      type="button"
                    >
                      <span className={styles['select-workout-modal__checkbox']}>
                        <img
                          alt=""
                          className={styles['select-workout-modal__checkbox-icon']}
                          src={checkboxIcon}
                        />
                      </span>
                      <span className={styles['select-workout-modal__text']}>
                        <span className={styles['select-workout-modal__workout-title']}>
                          {workout.title}
                        </span>
                        <span className={styles['select-workout-modal__workout-description']}>
                          {workout.description}
                        </span>
                      </span>
                    </button>
                    {index < workouts.length - 1 ? (
                      <span className={styles['select-workout-modal__divider']} />
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : null}

          <Button
            className={styles['select-workout-modal__start-button']}
            disabled={!selectedWorkoutId}
            onClick={handleStartClick}
            type="button"
          >
            Начать
          </Button>
        </div>
      </div>
    </div>
  )
}
