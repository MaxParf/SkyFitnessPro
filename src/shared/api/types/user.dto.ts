export type UserProfileDto = {
  email: string
  selectedCourses: string[]
}

export type UserProfileResponseDto = {
  user?: {
    email?: string
    selectedCourses?: string[]
  }
}

export type UserCourseMutationResponseDto = {
  message: string
}
