import circleIcon from '@image/circle.svg'
import semicircleIcon from '@image/semicircle.svg'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { courseMockItems } from '@entities/course/model/course.mock'
import type { CourseId } from '@entities/course/model/course.types'
import { ProfileCourseCard } from '@entities/course/ui/ProfileCourseCard'
import type { AuthSession } from '@features/auth/model/auth-session.types'
import { SelectWorkoutModal } from '@features/workout/ui/SelectWorkoutModal'
import { Button } from '@shared/ui/Button'
import { Container } from '@shared/ui/Container'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { AppHeader } from '@widgets/AppHeader'

import styles from './ProfilePage.module.scss'

export type ProfilePageProps = {
  authSession: AuthSession | null
  courseProgressById?: Partial<Record<CourseId, number>>
  isProfileDropdownOpen: boolean
  onLoginClick: () => void
  onLogout: () => void
  onProfileClick: () => void
  onProfileDropdownClose: () => void
  onProfileNavigate: () => void
  onRemoveCourse: (courseId: CourseId) => void
  selectedCourseIds: CourseId[]
}

export function ProfilePage({
  authSession,
  courseProgressById = {},
  isProfileDropdownOpen,
  onLoginClick,
  onLogout,
  onProfileClick,
  onProfileDropdownClose,
  onProfileNavigate,
  onRemoveCourse,
  selectedCourseIds = [],
}: ProfilePageProps) {
  const navigate = useNavigate()
  const [selectedWorkoutCourseId, setSelectedWorkoutCourseId] = useState<CourseId | null>(null)
  const userName = authSession?.displayName || authSession?.email.split('@')[0] || ''

  const handleCoursesClick = (): void => {
    navigate('/')
  }

  const handleLogout = (): void => {
    onLogout()
    navigate('/')
  }

  const handleOpenWorkouts = (courseId: CourseId): void => {
    setSelectedWorkoutCourseId(courseId)
  }

  const handleCloseWorkouts = (): void => {
    setSelectedWorkoutCourseId(null)
  }

  const handleScrollTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!authSession) {
    return (
      <section className={styles['profile-page']} aria-labelledby="profile-page-title">
        <AppHeader
          authSession={authSession}
          isProfileDropdownOpen={isProfileDropdownOpen}
          onLoginClick={onLoginClick}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onProfileDropdownClose={onProfileDropdownClose}
          onProfileNavigate={onProfileNavigate}
        />
        <Container className={styles['profile-page__container']}>
          <div className={styles['profile-page__empty']}>
            <h1 className={styles['profile-page__title']} id="profile-page-title">
              Профиль
            </h1>
            <p className={styles['profile-page__text']}>
              Войдите, чтобы посмотреть данные профиля и приобретённые курсы.
            </p>
            <Button className={styles['profile-page__button']} onClick={handleCoursesClick}>
              На главную
            </Button>
          </div>
        </Container>
      </section>
    )
  }

  const profileCourseItems = courseMockItems
    .filter((course) => selectedCourseIds.includes(course.id))
    .map((course) => ({
      course,
      progressPercent: courseProgressById[course.id] ?? 0,
    }))

  return (
    <section className={styles['profile-page']} aria-labelledby="profile-page-title">
      <AppHeader
        authSession={authSession}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        onProfileDropdownClose={onProfileDropdownClose}
        onProfileNavigate={onProfileNavigate}
      />
      <Container className={styles['profile-page__container']}>
        <section className={styles['profile-page__section']} aria-labelledby="profile-page-title">
          <h1 className={styles['profile-page__title']} id="profile-page-title">
            Профиль
          </h1>

          <article className={styles['profile-page__card']}>
            <div className={styles['profile-page__user-layout']}>
              <div className={styles['profile-page__avatar']} aria-hidden="true">
                <img alt="" className={styles['profile-page__avatar-circle']} src={circleIcon} />
                <img
                  alt=""
                  className={styles['profile-page__avatar-semicircle']}
                  src={semicircleIcon}
                />
              </div>

              <div className={styles['profile-page__user-content']}>
                <div className={styles['profile-page__user-info']}>
                  <p className={styles['profile-page__name']}>{userName}</p>
                  <p className={styles['profile-page__login']}>Логин: {userName}</p>
                </div>
                <div className={styles['profile-page__logout']}>
                  <Button
                    className={`${styles['profile-page__button']} ${styles['profile-page__button--secondary']}`}
                    onClick={handleLogout}
                    variant="secondary"
                  >
                    Выйти
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section
          className={`${styles['profile-page__section']} ${styles['profile-page__courses']}`}
          aria-labelledby="profile-courses-title"
        >
          <div className={styles['profile-page__courses-title-block']}>
            <h2 className={styles['profile-page__title']} id="profile-courses-title">
              Мои курсы
            </h2>
          </div>
          <div className={styles['profile-page__courses-grid']}>
            {profileCourseItems.length > 0 ? (
              profileCourseItems.map(({ course, progressPercent }) => (
                <ProfileCourseCard
                  course={course}
                  key={course.id}
                  onActionClick={handleOpenWorkouts}
                  onCardClick={handleOpenWorkouts}
                  onRemoveClick={onRemoveCourse}
                  progressPercent={progressPercent}
                />
              ))
            ) : (
              <div className={styles['profile-page__empty']}>
                <EmptyState title="У вас пока нет приобретённых курсов." />
              </div>
            )}
          </div>
        </section>

        <footer className={styles['profile-page__footer']}>
          <Button
            aria-label="Вернуться к началу страницы"
            className={styles['profile-page__back-to-top']}
            onClick={handleScrollTop}
          >
            Наверх ↑
          </Button>
        </footer>
      </Container>

      {selectedWorkoutCourseId ? (
        <SelectWorkoutModal
          courseId={selectedWorkoutCourseId}
          key={selectedWorkoutCourseId}
          onClose={handleCloseWorkouts}
          token={authSession.token}
        />
      ) : null}
    </section>
  )
}
