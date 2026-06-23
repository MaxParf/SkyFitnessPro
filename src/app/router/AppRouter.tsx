import { useCallback, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import {
  addUserCourse,
  loadUserProfile,
  removeUserCourse,
} from '@entities/course/api/user-course.service'
import type { CourseId } from '@entities/course/model/course.types'
import { FitnessApiError } from '@shared/api/fitnessApi'
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '@features/auth/model/auth-session.storage'
import type { AuthSession } from '@features/auth/model/auth-session.types'
import { AuthPage } from '@pages/AuthPage/AuthPage'
import { CoursePage } from '@pages/CoursePage/CoursePage'
import { CoursesPage } from '@pages/CoursesPage/CoursesPage'
import { NotFoundPage } from '@pages/NotFoundPage/NotFoundPage'
import { ProfilePage } from '@pages/ProfilePage/ProfilePage'
import { WorkoutPage } from '@pages/WorkoutPage/WorkoutPage'

import { AppRoutes } from './routes'

export function AppRouter() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => loadAuthSession())
  const [selectedCourseIds, setSelectedCourseIds] = useState<CourseId[]>([])

  const clearSession = useCallback((): void => {
    clearAuthSession()
    setAuthSession(null)
    setSelectedCourseIds([])
  }, [])

  const restoreSelectedCourses = useCallback(
    (session: AuthSession): void => {
      void loadUserProfile(session.token)
        .then((profile) => {
          const restoredCourseIds = Array.isArray(profile.selectedCourses)
            ? profile.selectedCourses
            : []

          setSelectedCourseIds((currentIds) =>
            Array.from(new Set([...currentIds, ...restoredCourseIds])),
          )
        })
        .catch((error) => {
          setSelectedCourseIds([])

          if (error instanceof FitnessApiError && (error.status === 401 || error.status === 403)) {
            clearSession()
          }
        })
    },
    [clearSession],
  )

  useEffect(() => {
    if (authSession) {
      restoreSelectedCourses(authSession)
    }
  }, [authSession, restoreSelectedCourses])

  const handleLoginSuccess = useCallback((session: AuthSession): void => {
    saveAuthSession(session)
    setAuthSession(session)
  }, [])

  const handleLogout = useCallback((): void => {
    clearSession()
  }, [clearSession])

  const handleAddCourse = useCallback(
    async (courseId: CourseId): Promise<void> => {
      if (!authSession) {
        return
      }

      await addUserCourse(authSession.token, courseId)
      setSelectedCourseIds((currentIds) =>
        currentIds.includes(courseId) ? currentIds : [...currentIds, courseId],
      )
    },
    [authSession],
  )

  const handleRemoveCourse = useCallback(
    (courseId: CourseId): void => {
      if (!authSession) {
        return
      }

      void removeUserCourse(authSession.token, courseId)
        .then(() => {
          setSelectedCourseIds((currentIds) => currentIds.filter((id) => id !== courseId))
        })
        .catch(() => undefined)
    },
    [authSession],
  )

  return (
    <Routes>
      <Route
        path={AppRoutes.courses}
        element={
          <CoursesPage
            authSession={authSession}
            onAddCourse={handleAddCourse}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            selectedCourseIds={selectedCourseIds}
          />
        }
      />
      <Route path={AppRoutes.auth} element={<AuthPage />} />
      <Route path={AppRoutes.course} element={<CoursePage />} />
      <Route
        path={AppRoutes.profile}
        element={
          <ProfilePage
            authSession={authSession}
            onLogout={handleLogout}
            onRemoveCourse={handleRemoveCourse}
            selectedCourseIds={selectedCourseIds}
          />
        }
      />
      <Route path={AppRoutes.workout} element={<WorkoutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
