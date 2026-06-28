import type { ApiErrorResponseDto } from './types/auth.dto'

const fitnessApiBaseUrl = 'https://webdev-hw-api.herokuapp.com/api/fitness'

type RequestOptions = {
  body?: object
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST'
  signal?: AbortSignal
  token?: string
}

export class FitnessApiError extends Error {
  hasServerMessage: boolean
  status: number

  constructor(message: string, status: number, hasServerMessage: boolean) {
    super(message)
    this.hasServerMessage = hasServerMessage
    this.name = 'FitnessApiError'
    this.status = status
  }
}

export async function requestFitnessApi<TResponse>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${fitnessApiBaseUrl}${endpoint}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
    method: options.method ?? 'GET',
    signal: options.signal,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    const errorResponse = parseApiErrorResponse(errorText)
    const serverMessage = errorResponse?.message ?? errorResponse?.error ?? errorText
    const message = serverMessage || `Fitness API request failed with status ${response.status}`

    throw new FitnessApiError(message, response.status, Boolean(serverMessage))
  }

  const responseText = await response.text()

  if (!responseText) {
    return {} as TResponse
  }

  return JSON.parse(responseText) as TResponse
}

function parseApiErrorResponse(errorText: string): ApiErrorResponseDto | null {
  if (!errorText) {
    return null
  }

  try {
    return JSON.parse(errorText) as ApiErrorResponseDto
  } catch {
    return null
  }
}
