import { requestFitnessApi } from '@shared/api/fitnessApi'
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '@shared/api/types/auth.dto'

export function registerUser(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
  return requestFitnessApi<RegisterResponseDto>('/auth/register', {
    body: payload,
    method: 'POST',
  })
}

export function loginUser(payload: LoginRequestDto): Promise<LoginResponseDto> {
  return requestFitnessApi<LoginResponseDto>('/auth/login', {
    body: payload,
    method: 'POST',
  })
}
