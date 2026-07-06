import { mockFetchSuccess } from '../../../test/fetchMock'
import { loginUser, registerUser } from './auth.service'

describe('auth.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sends registration request with email and password only', async () => {
    const fetchMock = mockFetchSuccess({ message: 'Регистрация прошла успешно!' })

    await expect(
      registerUser({
        email: 'user@example.com',
        password: 'Secure!!',
      }),
    ).resolves.toEqual({ message: 'Регистрация прошла успешно!' })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/auth/register',
      {
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Secure!!',
        }),
        method: 'POST',
        signal: undefined,
      },
    )
    expect(fetchMock.mock.calls[0]?.[1]?.body).not.toContain('repeatPassword')
  })

  it('sends login request with email and password only', async () => {
    const fetchMock = mockFetchSuccess({ token: 'jwt-token' })

    await expect(
      loginUser({
        email: 'user@example.com',
        password: 'Secure!!',
      }),
    ).resolves.toEqual({ token: 'jwt-token' })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/auth/login',
      {
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'Secure!!',
        }),
        method: 'POST',
        signal: undefined,
      },
    )
  })
})
