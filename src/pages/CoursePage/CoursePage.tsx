import { useParams } from 'react-router-dom'

import type { AuthSession } from '@features/auth/model/auth-session.types'
import { AppHeader } from '@widgets/AppHeader'

import styles from './CoursePage.module.scss'

export type CoursePageProps = {
  authSession: AuthSession | null
  isProfileDropdownOpen: boolean
  onLoginClick: () => void
  onLogout: () => void
  onProfileClick: () => void
  onProfileDropdownClose: () => void
  onProfileNavigate: () => void
}

export function CoursePage({
  authSession,
  isProfileDropdownOpen,
  onLoginClick,
  onLogout,
  onProfileClick,
  onProfileDropdownClose,
  onProfileNavigate,
}: CoursePageProps) {
  const { courseId } = useParams()

  return (
    <section className={styles.page}>
      <AppHeader
        authSession={authSession}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        onProfileDropdownClose={onProfileDropdownClose}
        onProfileNavigate={onProfileNavigate}
      />
      <div className={styles.page__content}>
        <h1 className={styles.page__title}>Курс</h1>
        <p className={styles.page__text}>Идентификатор курса: {courseId}</p>
      </div>
    </section>
  )
}
