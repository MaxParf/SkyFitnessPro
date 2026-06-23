import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import logoIcon from '@image/Logo.svg'
import skyFitnessLogo from '@image/SkyFitnessPro.svg'
import { loadCourses } from '@entities/course/api/course.service'
import type { Course, CourseId } from '@entities/course/model/course.types'
import { CourseCard } from '@entities/course/ui/CourseCard'
import type { AuthSession } from '@features/auth/model/auth-session.types'
import { LoginModal } from '@features/auth/ui/LoginModal'
import { ProfileDropdown } from '@features/auth/ui/ProfileDropdown'
import { UserProfileTrigger } from '@features/auth/ui/UserProfileTrigger'
import { Button } from '@shared/ui/Button'
import { Container } from '@shared/ui/Container'
import { EmptyState } from '@shared/ui/EmptyState/EmptyState'
import { ErrorState } from '@shared/ui/ErrorState/ErrorState'
import { Icon } from '@shared/ui/Icon'
import { Loader } from '@shared/ui/Loader/Loader'

import styles from './CoursesPage.module.scss'

export type CoursesPageProps = {
  authSession: AuthSession | null
  onAddCourse: (courseId: CourseId) => void
  onLoginSuccess: (session: AuthSession) => void
  onLogout: () => void
  selectedCourseIds: CourseId[]
}

export function CoursesPage({
  authSession,
  onAddCourse,
  onLoginSuccess,
  onLogout,
}: CoursesPageProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesStatus, setCoursesStatus] = useState<'empty' | 'error' | 'loading' | 'success'>(
    'loading',
  )
  const navigate = useNavigate()
  const profileDropdownId = useId()
  const profileTriggerRef = useRef<HTMLButtonElement | null>(null)

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

  const handleLoginModalOpen = (): void => {
    setIsLoginModalOpen(true)
  }

  const handleLoginModalClose = useCallback((): void => {
    setIsLoginModalOpen(false)
  }, [])

  const handleLoginSuccess = useCallback(
    (session: AuthSession): void => {
      onLoginSuccess(session)
      setIsLoginModalOpen(false)
    },
    [onLoginSuccess],
  )

  const handleProfileDropdownToggle = (): void => {
    setIsProfileDropdownOpen((isOpen) => !isOpen)
  }

  const handleProfileDropdownClose = useCallback((): void => {
    setIsProfileDropdownOpen(false)
  }, [])

  const handleProfileClick = (): void => {
    setIsProfileDropdownOpen(false)
    navigate('/profile')
  }

  const handleLogout = (): void => {
    onLogout()
    setIsProfileDropdownOpen(false)
  }

  return (
    <section className={styles['courses-page']} aria-labelledby="courses-page-title">
      <Container className={styles['courses-page__container']}>
        <header className={styles['courses-page__header']}>
          <div className={styles['courses-page__brand-group']}>
            <a className={styles['courses-page__brand']} href="/" aria-label="SkyFitnessPro">
              <Icon
                alt=""
                className={styles['courses-page__brand-icon']}
                decorative
                src={logoIcon}
              />
              <img
                className={styles['courses-page__brand-text']}
                src={skyFitnessLogo}
                alt="SkyFitnessPro"
              />
            </a>
            <p className={styles['courses-page__subtitle']}>Онлайн-тренировки для занятий дома</p>
          </div>
          <div className={styles['courses-page__auth']}>
            {authSession ? (
              <>
                <UserProfileTrigger
                  aria-controls={isProfileDropdownOpen ? profileDropdownId : undefined}
                  aria-expanded={isProfileDropdownOpen}
                  onClick={handleProfileDropdownToggle}
                  ref={profileTriggerRef}
                  userName={authSession.displayName}
                />
                {isProfileDropdownOpen ? (
                  <ProfileDropdown
                    className={styles['courses-page__profile-dropdown']}
                    id={profileDropdownId}
                    onClose={handleProfileDropdownClose}
                    onLogout={handleLogout}
                    onProfileClick={handleProfileClick}
                    session={authSession}
                    triggerRef={profileTriggerRef}
                  />
                ) : null}
              </>
            ) : (
              <Button
                className={styles['courses-page__login-button']}
                onClick={handleLoginModalOpen}
              >
                Войти
              </Button>
            )}
          </div>
        </header>

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
              <CourseCard key={course.id} course={course} onAddClick={onAddCourse} />
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
      {isLoginModalOpen ? (
        <LoginModal onClose={handleLoginModalClose} onLoginSuccess={handleLoginSuccess} />
      ) : null}
    </section>
  )
}
