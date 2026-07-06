import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { ExerciseProgressInput } from '@entities/workout/model/workout-progress.types'
import { mapExercisesToProgressInputs } from '@entities/workout/model/workout-progress.utils'
import type { WorkoutExercise } from '@entities/workout/model/workout.types'
import { Button } from '@shared/ui/Button'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'

import styles from './WorkoutProgressModal.module.scss'

const progressFormSchema = z.object({
  progressValues: z.record(
    z.string(),
    z.coerce
      .number({
        error: 'Введите число',
      })
      .min(0, 'Значение не может быть меньше 0'),
  ),
})

type WorkoutProgressFormValues = z.infer<typeof progressFormSchema>
type WorkoutProgressFormInputValues = z.input<typeof progressFormSchema>

export type WorkoutProgressModalProps = {
  exercises: WorkoutExercise[]
  initialProgressData: number[]
  isSaving?: boolean
  onClose: () => void
  onSave: (exerciseProgress: ExerciseProgressInput[]) => Promise<void>
  saveError?: string
}

export function WorkoutProgressModal({
  exercises,
  initialProgressData,
  isSaving = false,
  onClose,
  onSave,
  saveError = '',
}: WorkoutProgressModalProps) {
  const titleId = useId()
  const formErrorId = useId()
  const firstInputRef = useRef<HTMLInputElement | null>(null)
  const [submitError, setSubmitError] = useState('')
  const hasExercises = exercises.length > 0

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<WorkoutProgressFormInputValues, never, WorkoutProgressFormValues>({
    defaultValues: {
      progressValues: getDefaultProgressValues(exercises, initialProgressData),
    },
    mode: 'onSubmit',
    resolver: zodResolver(progressFormSchema),
  })

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

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

  const handleValidSubmit = async (values: WorkoutProgressFormValues): Promise<void> => {
    setSubmitError('')

    const progressData = exercises.map((exercise) => values.progressValues[exercise.id] ?? 0)
    const exerciseProgress = mapExercisesToProgressInputs({
      exercises,
      progressData,
    })

    try {
      await onSave(exerciseProgress)
    } catch {
      setSubmitError('Не удалось сохранить прогресс. Попробуйте ещё раз.')
    }
  }

  const formError = submitError || saveError
  const submitDisabled = !hasExercises || isSaving || isSubmitting

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className={styles['workout-progress-modal']}
      role="dialog"
    >
      <button
        aria-label="Закрыть заполнение прогресса"
        className={styles['workout-progress-modal__backdrop']}
        onClick={onClose}
        type="button"
      />

      <section className={styles['workout-progress-modal__dialog']}>
        <h2 className={styles['workout-progress-modal__title']} id={titleId}>
          Мой прогресс
        </h2>

        <div className={styles['workout-progress-modal__content']}>
          {!hasExercises ? <EmptyState title="Для этой тренировки пока нет упражнений." /> : null}

          <form
            aria-describedby={formError ? formErrorId : undefined}
            className={styles['workout-progress-modal__form']}
            noValidate
            onSubmit={handleSubmit(handleValidSubmit)}
          >
            {hasExercises ? (
              <div className={styles['workout-progress-modal__fields']}>
                {exercises.map((exercise, index) => {
                  const fieldName = `progressValues.${exercise.id}` as const
                  const fieldError = errors.progressValues?.[exercise.id]
                  const { ref, ...fieldProps } = register(fieldName)

                  return (
                    <div className={styles['workout-progress-modal__field']} key={exercise.id}>
                      <label
                        className={styles['workout-progress-modal__label']}
                        htmlFor={`progress-${exercise.id}`}
                      >
                        Сколько раз вы сделали {exercise.name.toLowerCase()}?
                      </label>
                      <input
                        aria-invalid={Boolean(fieldError)}
                        className={styles['workout-progress-modal__input']}
                        id={`progress-${exercise.id}`}
                        inputMode="numeric"
                        min={0}
                        placeholder="0"
                        type="number"
                        {...fieldProps}
                        ref={(element) => {
                          ref(element)

                          if (index === 0) {
                            firstInputRef.current = element
                          }
                        }}
                      />
                      {fieldError ? (
                        <p className={styles['workout-progress-modal__error']}>
                          {fieldError.message}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}

            {formError ? (
              <p className={styles['workout-progress-modal__error']} id={formErrorId} role="alert">
                {formError}
              </p>
            ) : null}

            <Button
              className={styles['workout-progress-modal__save-button']}
              disabled={submitDisabled}
              type="submit"
            >
              Сохранить
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}

function getDefaultProgressValues(
  exercises: WorkoutExercise[],
  progressData: number[],
): Record<string, number> {
  return exercises.reduce<Record<string, number>>((values, exercise, index) => {
    return {
      ...values,
      [exercise.id]: progressData[index] ?? 0,
    }
  }, {})
}
