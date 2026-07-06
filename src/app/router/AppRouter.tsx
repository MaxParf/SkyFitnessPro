import { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import {
  addUserCourse,
  loadUserProfile,
  removeUserCourse,
} from '@entities/course/api/user-course.service'
import type { CourseId } from '@entities/course/model/course.types'
import { loadCourseProgressPercent } from '@entities/workout/api/workout-progress.service'
import { FitnessApiError } from '@shared/api/fitnessApi'
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '@features/auth/model/auth-session.storage'
import type { AuthSession } from '@features/auth/model/auth-session.types'
import { LoginModal } from '@features/auth/ui/LoginModal'
import { AuthPage } from '@pages/AuthPage/AuthPage'
import { CoursePage } from '@pages/CoursePage/CoursePage'
import { CoursesPage } from '@pages/CoursesPage/CoursesPage'
import { NotFoundPage } from '@pages/NotFoundPage/NotFoundPage'
import { ProfilePage } from '@pages/ProfilePage/ProfilePage'
import { WorkoutPage } from '@pages/WorkoutPage/WorkoutPage'

import { AppRoutes } from './routes'

type CourseProgressById = Partial<Record<CourseId, number>>

export function AppRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => loadAuthSession())
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [selectedCourseIds, setSelectedCourseIds] = useState<CourseId[]>([])
  const [courseProgressById, setCourseProgressById] = useState<CourseProgressById>({})
  const courseProgressRequestVersionRef = useRef<Partial<Record<CourseId, number>>>({})

  const clearSession = useCallback((): void => {
    clearAuthSession()
    setAuthSession(null)
    setSelectedCourseIds([])
    setCourseProgressById({})
    courseProgressRequestVersionRef.current = {}
  }, [])

  const restoreCourseProgress = useCallback((token: string, courseId: CourseId): void => {
    const requestVersion = (courseProgressRequestVersionRef.current[courseId] ?? 0) + 1

    courseProgressRequestVersionRef.current = {
      ...courseProgressRequestVersionRef.current,
      [courseId]: requestVersion,
    }

    void loadCourseProgressPercent(token, courseId)
      .then((progressPercent) => {
        if (courseProgressRequestVersionRef.current[courseId] !== requestVersion) {
          return
        }

        setCourseProgressById((currentProgress) => ({
          ...currentProgress,
          [courseId]: progressPercent,
        }))
      })
      .catch(() => {
        if (courseProgressRequestVersionRef.current[courseId] !== requestVersion) {
          return
        }

        setCourseProgressById((currentProgress) => ({
          ...currentProgress,
          [courseId]: 0,
        }))
      })
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

  useEffect(() => {
    if (!authSession || location.pathname !== AppRoutes.profile) {
      return
    }

    selectedCourseIds.forEach((courseId) => {
      if (
        courseProgressById[courseId] === undefined &&
        courseProgressRequestVersionRef.current[courseId] === undefined
      ) {
        restoreCourseProgress(authSession.token, courseId)
      }
    })
  }, [authSession, courseProgressById, location.pathname, restoreCourseProgress, selectedCourseIds])

  const handleLoginSuccess = useCallback((session: AuthSession): void => {
    saveAuthSession(session)
    setAuthSession(session)
    setIsLoginModalOpen(false)
  }, [])

  const handleLogout = useCallback((): void => {
    clearSession()
    setIsProfileDropdownOpen(false)
  }, [clearSession])

  const handleLoginModalOpen = useCallback((): void => {
    setIsLoginModalOpen(true)
  }, [])

  const handleLoginModalClose = useCallback((): void => {
    setIsLoginModalOpen(false)
  }, [])

  const handleProfileDropdownToggle = useCallback((): void => {
    setIsProfileDropdownOpen((isOpen) => !isOpen)
  }, [])

  const handleProfileDropdownClose = useCallback((): void => {
    setIsProfileDropdownOpen(false)
  }, [])

  const handleProfileNavigate = useCallback((): void => {
    setIsProfileDropdownOpen(false)
    navigate(AppRoutes.profile)
  }, [navigate])

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
    async (courseId: CourseId): Promise<void> => {
      if (!authSession) {
        return
      }

      await removeUserCourse(authSession.token, courseId)
      setSelectedCourseIds((currentIds) => currentIds.filter((id) => id !== courseId))
      const { [courseId]: removedRequestVersion, ...nextRequestVersions } =
        courseProgressRequestVersionRef.current

      void removedRequestVersion
      courseProgressRequestVersionRef.current = nextRequestVersions

      setCourseProgressById((currentProgress) => {
        const { [courseId]: removedProgress, ...nextProgress } = currentProgress

        void removedProgress

        return nextProgress
      })
    },
    [authSession],
  )

  const handleWorkoutProgressChange = useCallback(
    (params: { courseId: CourseId; workoutId: string }): void => {
      if (!authSession) {
        return
      }

      restoreCourseProgress(authSession.token, params.courseId)
    },
    [authSession, restoreCourseProgress],
  )

  const appHeaderProps = {
    authSession,
    isProfileDropdownOpen,
    onLoginClick: handleLoginModalOpen,
    onLogout: handleLogout,
    onProfileClick: handleProfileDropdownToggle,
    onProfileDropdownClose: handleProfileDropdownClose,
    onProfileNavigate: handleProfileNavigate,
  }

  return (
    <>
      <Routes>
        <Route
          path={AppRoutes.courses}
          element={
            <CoursesPage
              {...appHeaderProps}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              selectedCourseIds={selectedCourseIds}
            />
          }
        />
        <Route path={AppRoutes.auth} element={<AuthPage />} />
        <Route
          path={AppRoutes.course}
          element={
            <CoursePage
              {...appHeaderProps}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              selectedCourseIds={selectedCourseIds}
            />
          }
        />
        <Route
          path={AppRoutes.profile}
          element={
            <ProfilePage
              {...appHeaderProps}
              courseProgressById={courseProgressById}
              onRemoveCourse={handleRemoveCourse}
              selectedCourseIds={selectedCourseIds}
            />
          }
        />
        <Route
          path={AppRoutes.workout}
          element={
            <WorkoutPage
              {...appHeaderProps}
              onWorkoutProgressChange={handleWorkoutProgressChange}
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isLoginModalOpen ? (
        <LoginModal onClose={handleLoginModalClose} onLoginSuccess={handleLoginSuccess} />
      ) : null}
    </>
  )
}
