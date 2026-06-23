import { useCallback, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import type { AuthSession } from '@features/auth/model/auth-session.types'
import { AuthPage } from '@pages/AuthPage/AuthPage'
import { CoursePage } from '@pages/CoursePage/CoursePage'
import { CoursesPage } from '@pages/CoursesPage/CoursesPage'
import { NotFoundPage } from '@pages/NotFoundPage/NotFoundPage'
import { ProfilePage } from '@pages/ProfilePage/ProfilePage'
import { WorkoutPage } from '@pages/WorkoutPage/WorkoutPage'

import { AppRoutes } from './routes'

export function AppRouter() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)

  const handleLoginSuccess = useCallback((session: AuthSession): void => {
    setAuthSession(session)
  }, [])

  const handleLogout = useCallback((): void => {
    setAuthSession(null)
  }, [])

  return (
    <Routes>
      <Route
        path={AppRoutes.courses}
        element={
          <CoursesPage
            authSession={authSession}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        }
      />
      <Route path={AppRoutes.auth} element={<AuthPage />} />
      <Route path={AppRoutes.course} element={<CoursePage />} />
      <Route
        path={AppRoutes.profile}
        element={<ProfilePage authSession={authSession} onLogout={handleLogout} />}
      />
      <Route path={AppRoutes.workout} element={<WorkoutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
