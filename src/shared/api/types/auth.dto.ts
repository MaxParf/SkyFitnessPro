export type RegisterRequestDto = {
  email: string
  password: string
}

export type RegisterResponseDto = {
  message: string
}

export type LoginRequestDto = {
  email: string
  password: string
}

export type LoginResponseDto = {
  token: string
}

export type ApiErrorResponseDto = {
  error?: string
  message?: string
}
