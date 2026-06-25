import { useEffect, useState } from 'react'

import { loadCourses } from '@entities/course/api/course.service'
import type { Course, CourseId } from '@entities/course/model/course.types'
import { CourseCard } from '@entities/course/ui/CourseCard'
import type { AuthSession } from '@features/auth/model/auth-session.types'
import { Button } from '@shared/ui/Button'
import { Container } from '@shared/ui/Container'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { ErrorState } from '@shared/ui/ErrorState/ErrorState'
import { Loader } from '@shared/ui/Loader/Loader'
import { AppHeader } from '@widgets/AppHeader'

import styles from './CoursesPage.module.scss'

export type CoursesPageProps = {
  authSession: AuthSession | null
  isProfileDropdownOpen: boolean
  onAddCourse: (courseId: CourseId) => Promise<void>
  onLoginClick: () => void
  onLogout: () => void
  onProfileClick: () => void
  onProfileDropdownClose: () => void
  onProfileNavigate: () => void
  selectedCourseIds: CourseId[]
}

export function CoursesPage({
  authSession,
  isProfileDropdownOpen,
  onAddCourse,
  onLoginClick,
  onLogout,
  onProfileClick,
  onProfileDropdownClose,
  onProfileNavigate,
  selectedCourseIds,
}: CoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesStatus, setCoursesStatus] = useState<'empty' | 'error' | 'loading' | 'success'>(
    'loading',
  )

  useEffect(() => {
    const abortController = new AbortController()

    loadCourses(abortController.signal)
      .then((loadedCourses) => {
        setCourses(loadedCourses)
        setCoursesStatus(loadedCourses.length > 0 ? 'success' : 'empty')
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setCoursesStatus('error')
        }
      })

    return () => {
      abortController.abort()
    }
  }, [])

  const handleScrollTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddCourse = async (courseId: CourseId): Promise<void> => {
    if (!authSession) {
      onLoginClick()
      return
    }

    if (selectedCourseIds.includes(courseId)) {
      return
    }

    try {
      await onAddCourse(courseId)
    } catch {
      return
    }
  }

  return (
    <section className={styles['courses-page']} aria-labelledby="courses-page-title">
      <AppHeader
        authSession={authSession}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        onProfileDropdownClose={onProfileDropdownClose}
        onProfileNavigate={onProfileNavigate}
      />
      <Container className={styles['courses-page__container']}>
        <div className={styles['courses-page__hero']}>
          <h1 className={styles['courses-page__title']} id="courses-page-title">
            Начните заниматься спортом
            <br />и улучшите качество жизни
          </h1>
          <p className={styles['courses-page__bubble']}>
            Измени своё
            <br />
            тело за полгода!
          </p>
        </div>

        {coursesStatus === 'loading' ? (
          <div className={styles['courses-page__state']}>
            <Loader />
          </div>
        ) : null}

        {coursesStatus === 'error' ? (
          <div className={styles['courses-page__state']}>
            <ErrorState
              title="Не удалось загрузить курсы"
              description="Проверьте подключение и попробуйте обновить страницу."
            />
          </div>
        ) : null}

        {coursesStatus === 'empty' ? (
          <div className={styles['courses-page__state']}>
            <EmptyState title="Курсы пока не добавлены" />
          </div>
        ) : null}

        {coursesStatus === 'success' ? (
          <div className={styles['courses-page__grid']} aria-label="Список курсов">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onAddClick={handleAddCourse} />
            ))}
          </div>
        ) : null}

        <footer className={styles['courses-page__footer']}>
          <Button
            aria-label="Вернуться к началу страницы"
            className={styles['courses-page__scroll-button']}
            onClick={handleScrollTop}
          >
            Наверх ↑
          </Button>
        </footer>
      </Container>
    </section>
  )
}
