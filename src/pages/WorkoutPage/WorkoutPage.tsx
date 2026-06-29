import playIcon from '@image/play.svg'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import {
  loadWorkoutProgress,
  saveWorkoutProgress,
} from '@entities/workout/api/workout-progress.service'
import { loadWorkout } from '@entities/workout/api/workout.service'
import type { ExerciseProgressInput } from '@entities/workout/model/workout-progress.types'
import {
  getCourseIdByWorkoutId,
  mapExercisesToProgressInputs,
} from '@entities/workout/model/workout-progress.utils'
import type { Workout, WorkoutExercise } from '@entities/workout/model/workout.types'
import type { AuthSession } from '@features/auth/model/auth-session.types'
import { WorkoutProgressModal } from '@features/workout/ui/WorkoutProgressModal'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { ErrorState } from '@shared/ui/ErrorState/ErrorState'
import { Loader } from '@shared/ui/Loader/Loader'
import { AppHeader } from '@widgets/AppHeader'

import styles from './WorkoutPage.module.scss'

export type WorkoutPageProps = {
  authSession: AuthSession | null
  isProfileDropdownOpen: boolean
  onLoginClick: () => void
  onLogout: () => void
  onProfileClick: () => void
  onProfileDropdownClose: () => void
  onProfileNavigate: () => void
  onWorkoutProgressChange?: (params: { courseId: string; workoutId: string }) => void
}

type WorkoutStatus = 'error' | 'loading' | 'success'

export function WorkoutPage({
  authSession,
  isProfileDropdownOpen,
  onLoginClick,
  onLogout,
  onProfileClick,
  onProfileDropdownClose,
  onProfileNavigate,
  onWorkoutProgressChange,
}: WorkoutPageProps) {
  const { workoutId } = useParams()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<WorkoutStatus>('loading')
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [progressData, setProgressData] = useState<number[]>([])
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
  const [isProgressSaving, setIsProgressSaving] = useState(false)
  const [progressSaveError, setProgressSaveError] = useState('')
  const courseIdParam = searchParams.get('courseId')
  const workoutCourseId = courseIdParam || (workoutId ? getCourseIdByWorkoutId(workoutId) : null)

  useEffect(() => {
    if (!authSession || !workoutId) {
      return
    }

    const abortController = new AbortController()

    void loadWorkout(authSession.token, workoutId, abortController.signal)
      .then(async (loadedWorkout) => {
        let loadedProgressData = getEmptyProgressData(loadedWorkout.exercises)

        if (workoutCourseId) {
          try {
            const workoutProgress = await loadWorkoutProgress(
              authSession.token,
              workoutCourseId,
              workoutId,
              abortController.signal,
            )

            loadedProgressData = normalizeProgressData(
              workoutProgress.progressData,
              loadedWorkout.exercises.length,
            )
          } catch {
            loadedProgressData = getEmptyProgressData(loadedWorkout.exercises)
          }
        }

        setProgressData(loadedProgressData)
        setWorkout(applyProgressDataToWorkout(loadedWorkout, loadedProgressData))
        setStatus('success')
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setStatus('error')
      })

    return () => {
      abortController.abort()
    }
  }, [authSession, workoutCourseId, workoutId])

  const exerciseColumns = useMemo(
    () => splitExercisesIntoColumns(workout?.exercises ?? [], 3),
    [workout],
  )

  const handleProgressClick = (): void => {
    setProgressSaveError('')
    setIsProgressModalOpen(true)
  }

  const handleProgressModalClose = (): void => {
    setIsProgressModalOpen(false)
    setProgressSaveError('')
  }

  const handleProgressSave = async (exerciseProgress: ExerciseProgressInput[]): Promise<void> => {
    if (!authSession || !workout || !workoutCourseId) {
      setProgressSaveError('Не удалось сохранить прогресс. Попробуйте ещё раз.')
      throw new Error('Workout course is not available')
    }

    const nextProgressData = exerciseProgress.map((exercise) => exercise.value)

    setIsProgressSaving(true)
    setProgressSaveError('')

    try {
      await saveWorkoutProgress(authSession.token, {
        courseId: workoutCourseId,
        progressData: nextProgressData,
        workoutId: workout.id,
      })

      const nextWorkout = applyProgressDataToWorkout(workout, nextProgressData)

      setProgressData(nextProgressData)
      setWorkout(nextWorkout)
      setIsProgressModalOpen(false)
      onWorkoutProgressChange?.({
        courseId: workoutCourseId,
        workoutId: workout.id,
      })
    } catch {
      setProgressSaveError('Не удалось сохранить прогресс. Попробуйте ещё раз.')
      throw new Error('Workout progress save failed')
    } finally {
      setIsProgressSaving(false)
    }
  }

  if (!authSession) {
    return (
      <main className={styles['workout-page']}>
        <AppHeader
          authSession={authSession}
          className={styles['workout-page__header']}
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
          showSubtitle={false}
        />
        <section className={styles['workout-page__container']}>
          <ErrorState
            title="Войдите, чтобы открыть тренировку"
            description="После входа вы сможете смотреть материалы урока и заполнять прогресс."
          />
          <Link className={styles['workout-page__return-link']} to="/">
            На главную
          </Link>
        </section>
      </main>
    )
  }

  if (!workoutId) {
    return (
      <main className={styles['workout-page']}>
        <AppHeader
          authSession={authSession}
          className={styles['workout-page__header']}
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
          showSubtitle={false}
        />
        <section className={styles['workout-page__container']}>
          <ErrorState title="Тренировка не найдена" />
        </section>
      </main>
    )
  }

  if (status === 'loading') {
    return (
      <main className={styles['workout-page']}>
        <AppHeader
          authSession={authSession}
          className={styles['workout-page__header']}
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
          showSubtitle={false}
        />
        <section className={styles['workout-page__container']}>
          <Loader />
        </section>
      </main>
    )
  }

  if (status === 'error' || !workout) {
    return (
      <main className={styles['workout-page']}>
        <AppHeader
          authSession={authSession}
          className={styles['workout-page__header']}
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
          showSubtitle={false}
        />
        <section className={styles['workout-page__container']}>
          <ErrorState
            title="Не удалось загрузить тренировку"
            description="Проверьте ссылку или попробуйте открыть тренировку позже."
          />
        </section>
      </main>
    )
  }

  return (
    <main className={styles['workout-page']}>
      <AppHeader
        authSession={authSession}
        className={styles['workout-page__header']}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        onProfileDropdownClose={onProfileDropdownClose}
        onProfileNavigate={onProfileNavigate}
        showSubtitle={false}
      />
      <section className={styles['workout-page__container']} aria-labelledby="workout-page-title">
        <div className={styles['workout-page__title-block']}>
          <h1 className={styles['workout-page__title']} id="workout-page-title">
            {workout.courseTitle}
          </h1>
        </div>

        <section className={styles['workout-page__video']} aria-label="Видео тренировки">
          <article className={styles['workout-page__video-preview']}>
            {workout.previewImageUrl ? (
              <img
                alt=""
                className={styles['workout-page__video-image']}
                src={workout.previewImageUrl}
              />
            ) : null}
            <button
              aria-label="Воспроизвести видео тренировки"
              className={styles['workout-page__play-button']}
              type="button"
            >
              <img alt="" className={styles['workout-page__play-icon']} src={playIcon} />
            </button>
          </article>
        </section>

        <article className={styles['workout-page__exercises-card']}>
          <div className={styles['workout-page__exercises-content']}>
            <h2 className={styles['workout-page__exercises-title']}>
              Упражнения {workout.name.toLowerCase()}
            </h2>

            {workout.exercises.length > 0 ? (
              <div className={styles['workout-page__exercises-grid']}>
                {exerciseColumns.map((column, columnIndex) => (
                  <div className={styles['workout-page__exercise-column']} key={columnIndex}>
                    {column.map((exercise) => (
                      <div className={styles['workout-page__exercise']} key={exercise.id}>
                        <p className={styles['workout-page__exercise-text']}>
                          {exercise.name} {exercise.progressPercent}%
                        </p>
                        <div className={styles['workout-page__exercise-track']} aria-hidden="true">
                          <div
                            className={styles['workout-page__exercise-track-fill']}
                            style={getExerciseProgressStyle(exercise.progressPercent)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Для этой тренировки пока нет упражнений." />
            )}

            <button
              className={styles['workout-page__progress-button']}
              onClick={handleProgressClick}
              type="button"
            >
              Заполнить свой прогресс
            </button>
          </div>
        </article>
      </section>
      {isProgressModalOpen ? (
        <WorkoutProgressModal
          exercises={workout.exercises}
          initialProgressData={progressData}
          isSaving={isProgressSaving}
          onClose={handleProgressModalClose}
          onSave={handleProgressSave}
          saveError={progressSaveError}
        />
      ) : null}
    </main>
  )
}

type ExerciseProgressStyle = CSSProperties & {
  '--exercise-progress': string
}

function splitExercisesIntoColumns(
  exercises: WorkoutExercise[],
  columnsCount: number,
): WorkoutExercise[][] {
  const columnSize = Math.ceil(exercises.length / columnsCount)

  return Array.from({ length: columnsCount }, (_, columnIndex) =>
    exercises.slice(columnIndex * columnSize, columnIndex * columnSize + columnSize),
  ).filter((column) => column.length > 0)
}

function getEmptyProgressData(exercises: WorkoutExercise[]): number[] {
  return exercises.map(() => 0)
}

function normalizeProgressData(progressData: number[], exercisesCount: number): number[] {
  return Array.from({ length: exercisesCount }, (_, index) => progressData[index] ?? 0)
}

function applyProgressDataToWorkout(workout: Workout, progressData: number[]): Workout {
  const exerciseProgress = mapExercisesToProgressInputs({
    exercises: workout.exercises,
    progressData,
  })

  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      progressPercent:
        exerciseProgress.find((progress) => progress.exerciseId === exercise.id)?.percent ?? 0,
    })),
  }
}

function getExerciseProgressStyle(progressPercent: number): ExerciseProgressStyle {
  return {
    '--exercise-progress': `${Math.min(100, Math.max(0, progressPercent))}%`,
  }
}
