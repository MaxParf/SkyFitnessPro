import playIcon from '@image/play.svg'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { loadWorkout } from '@entities/workout/api/workout.service'
import type { Workout, WorkoutExercise } from '@entities/workout/model/workout.types'
import type { AuthSession } from '@features/auth/model/auth-session.types'
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
}: WorkoutPageProps) {
  const { workoutId } = useParams()
  const [status, setStatus] = useState<WorkoutStatus>('loading')
  const [workout, setWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    if (!authSession || !workoutId) {
      return
    }

    const abortController = new AbortController()

    void loadWorkout(authSession.token, workoutId, abortController.signal)
      .then((loadedWorkout) => {
        setWorkout(loadedWorkout)
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
  }, [authSession, workoutId])

  const exerciseColumns = useMemo(
    () => splitExercisesIntoColumns(workout?.exercises ?? [], 3),
    [workout],
  )

  const handleProgressClick = (): void => undefined

  if (!authSession) {
    return (
      <main className={styles['workout-page']}>
        <AppHeader
          authSession={authSession}
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
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
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
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
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
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
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
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
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        onProfileDropdownClose={onProfileDropdownClose}
        onProfileNavigate={onProfileNavigate}
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
                      <div className={styles['workout-page__exercise-track']} aria-hidden="true" />
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
        </article>
      </section>
    </main>
  )
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
