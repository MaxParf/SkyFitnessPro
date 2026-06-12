import { Route, Routes } from 'react-router-dom'

import { AuthPage } from '@pages/AuthPage/AuthPage'
import { CoursePage } from '@pages/CoursePage/CoursePage'
import { CoursesPage } from '@pages/CoursesPage/CoursesPage'
import { NotFoundPage } from '@pages/NotFoundPage/NotFoundPage'
import { ProfilePage } from '@pages/ProfilePage/ProfilePage'
import { WorkoutPage } from '@pages/WorkoutPage/WorkoutPage'

import { AppRoutes } from './routes'

export function AppRouter() {
  return (
    <Routes>
      <Route path={AppRoutes.courses} element={<CoursesPage />} />
      <Route path={AppRoutes.auth} element={<AuthPage />} />
      <Route path={AppRoutes.course} element={<CoursePage />} />
      <Route path={AppRoutes.profile} element={<ProfilePage />} />
      <Route path={AppRoutes.workout} element={<WorkoutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
