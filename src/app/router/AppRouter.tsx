import { useCallback, useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import {
  addUserCourse,
  loadUserProfile,
  removeUserCourse,
} from '@entities/course/api/user-course.service'
import type { CourseId } from '@entities/course/model/course.types'
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
  const [selectedCourseIds, setSelectedCourseIds] = useState<CourseId[]>([])

  const handleLoginSuccess = useCallback((session: AuthSession): void => {
    setAuthSession(session)
    void loadUserProfile(session.token)
      .then((profile) => {
        setSelectedCourseIds(Array.isArray(profile.selectedCourses) ? profile.selectedCourses : [])
      })
      .catch(() => {
        setSelectedCourseIds([])
      })
  }, [])

  const handleLogout = useCallback((): void => {
    setAuthSession(null)
    setSelectedCourseIds([])
  }, [])

  const handleAddCourse = useCallback(
    (courseId: CourseId): void => {
      if (!authSession) {
        return
      }

      void addUserCourse(authSession.token, courseId)
        .then(() => {
          setSelectedCourseIds((currentIds) =>
            currentIds.includes(courseId) ? currentIds : [...currentIds, courseId],
          )
        })
        .catch(() => undefined)
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
