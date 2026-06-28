import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import App from '@app/App'

import { LoginModal } from './LoginModal'
import type { LoginModalProps } from './LoginModal'
import {
  createJsonResponse,
  mockFetchError,
  mockFetchResponse,
  mockFetchSuccess,
} from '../../../../test/fetchMock'

const courseDtoItems = [
  {
    _id: 'ab1c3f',
    description: 'Йога',
    directions: [],
    fitting: [],
    nameEN: 'Yoga',
    nameRU: 'Йога',
    workouts: [],
  },
]

function createUserProfileResponse(email: string, selectedCourses?: string[]) {
  return {
    user: {
      email,
      selectedCourses,
    },
  }
}

function createDeferredResponse(body: object | null) {
  let resolveResponse: (response: Response) => void = () => undefined
  const responsePromise = new Promise<Response>((resolve) => {
    resolveResponse = resolve
  })

  return {
    resolve: () => resolveResponse(createJsonResponse(body)),
    responsePromise,
  }
}

function renderLoginModal(props?: Partial<LoginModalProps>) {
  return render(<LoginModal onClose={jest.fn()} onLoginSuccess={jest.fn()} {...props} />)
}

function renderApp(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  )
}

async function loginThroughApp(email = 'ivan@example.com') {
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Войти' }))
  await user.type(screen.getByLabelText('Эл. почта'), email)
  await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
  await user.click(screen.getAllByRole('button', { name: 'Войти' })[1])

  await screen.findByRole('button', { name: 'Открыть меню пользователя' })

  return user
}

describe('LoginModal', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockFetchSuccess(courseDtoItems)
  })

  afterEach(() => {
    window.localStorage.clear()
    jest.restoreAllMocks()
  })

  it('opens after clicking login button on courses page', async () => {
    const user = userEvent.setup()

    renderApp()

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByRole('dialog', { name: 'Вход в SkyFitnessPro' })).toBeInTheDocument()
  })

  it('renders login form fields and actions', () => {
    renderLoginModal()

    expect(screen.getByLabelText('Эл. почта')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument()
  })

  it('shows validation errors after empty login submit', async () => {
    const user = userEvent.setup()

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Введите эл. почту')).toBeInTheDocument()
    expect(screen.getByText('Введите пароль')).toBeInTheDocument()
  })

  it('shows two-line password error after wrong login password', async () => {
    const user = userEvent.setup()

    renderLoginModal()

    mockFetchResponse({ message: 'Неверный пароль' }, 404)

    await user.type(screen.getByLabelText('Эл. почта'), 'sergey.petrov96@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(
      await screen.findByText(
        (_, element) => element?.textContent === 'Пароль введен неверно,попробуйте еще раз.',
      ),
    ).toBeInTheDocument()
  })

  it('passes auth session after successful login', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSuccess({ token: 'jwt-token' })
    const handleLoginSuccess = jest.fn()

    renderLoginModal({ onLoginSuccess: handleLoginSuccess })

    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    await waitFor(() => {
      expect(handleLoginSuccess).toHaveBeenCalledWith({
        displayName: 'new.user',
        email: 'new.user@mail.ru',
        token: 'jwt-token',
        username: 'new.user',
      })
    })
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({
        email: 'new.user@mail.ru',
        password: 'Secure!!',
      }),
    )
  })

  it('sets password invalid state after wrong login credentials', async () => {
    const user = userEvent.setup()
    mockFetchResponse({ message: 'Пользователь с таким email не найден' }, 404)

    renderLoginModal()

    await user.type(screen.getByLabelText('Эл. почта'), 'missing.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(
      await screen.findByText(
        (_, element) => element?.textContent === 'Пароль введен неверно,попробуйте еще раз.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toHaveAttribute('aria-invalid', 'true')
  })

  it('disables login submit while request is pending', async () => {
    const user = userEvent.setup()
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockReturnValue(new Promise<Response>(() => undefined))
    Object.assign(globalThis, { fetch: fetchMock })

    renderLoginModal()

    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByRole('button', { name: 'Войти' })).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('switches to sign in mode after clicking register button', async () => {
    const user = userEvent.setup()

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(screen.getByRole('dialog', { name: 'Регистрация в SkyFitnessPro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Эл. почта')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByLabelText('Повторите пароль')).toBeInTheDocument()
  })

  it('shows registration password mismatch error', async () => {
    const user = userEvent.setup()

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.type(screen.getByLabelText('Повторите пароль'), 'Secure@@')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument()
  })

  it('shows success message after successful registration', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSuccess({ message: 'Регистрация прошла успешно!' })

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.type(screen.getByLabelText('Повторите пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(await screen.findByText('Регистрация прошла успешно!')).toBeInTheDocument()
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({
        email: 'new.user@mail.ru',
        password: 'Secure!!',
      }),
    )
  })

  it('shows duplicate email error in sign in mode', async () => {
    const user = userEvent.setup()
    mockFetchResponse({ message: 'Пользователь с таким email уже существует' }, 400)

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'sergey.petrov96@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.type(screen.getByLabelText('Повторите пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(
      await screen.findByText(
        (_, element) => element?.textContent === 'Данная почта уже используется.Попробуйте войти.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Эл. почта')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows API validation message in sign in mode', async () => {
    const user = userEvent.setup()
    mockFetchResponse({ message: 'Пароль должен содержать минимум 2 специальных символа' }, 400)

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.type(screen.getByLabelText('Повторите пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(
      await screen.findByText('Пароль должен содержать минимум 2 специальных символа'),
    ).toBeInTheDocument()
  })

  it('shows generic fallback only for network errors', async () => {
    const user = userEvent.setup()
    mockFetchError(new Error('Network error'))

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.type(screen.getByLabelText('Повторите пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(
      await screen.findByText('Не удалось зарегистрироваться. Попробуйте позже.'),
    ).toBeInTheDocument()
  })

  it('disables register submit while request is pending', async () => {
    const user = userEvent.setup()
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockReturnValue(new Promise<Response>(() => undefined))
    Object.assign(globalThis, { fetch: fetchMock })

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.type(screen.getByLabelText('Повторите пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('blocks weak registration password before API call', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSuccess({ message: 'Регистрация прошла успешно!' })

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'password')
    await user.type(screen.getByLabelText('Повторите пароль'), 'password')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(
      await screen.findByText('Пароль должен содержать минимум одну заглавную букву'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns to login mode after clicking login button in sign in mode', async () => {
    const user = userEvent.setup()

    renderLoginModal()

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByRole('dialog', { name: 'Вход в SkyFitnessPro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Эл. почта')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    renderLoginModal({ onClose: handleClose })

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('closes after clicking backdrop', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()
    const { container } = renderLoginModal({ onClose: handleClose })
    const backdrop = container.querySelector('.login-modal')

    expect(backdrop).not.toBeNull()

    if (backdrop) {
      await user.click(backdrop)
    }

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  it('closes modal and renders profile trigger after successful login on courses page', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    await loginThroughApp('ivan@example.com')

    expect(await screen.findByText('ivan')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Открыть меню пользователя' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Войти' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('skyfitnesspro.auth')).toBe(
      JSON.stringify({
        email: 'ivan@example.com',
        token: 'jwt-token',
        username: 'ivan',
      }),
    )
  })

  it('keeps modal open and login button state after failed login on courses page', async () => {
    const user = userEvent.setup()
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ message: 'Неверный пароль' }, 404))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()

    await user.click(screen.getByRole('button', { name: 'Войти' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'ivan@example.com')
    await user.type(screen.getByLabelText('Пароль'), 'wrong-password')
    await user.click(screen.getAllByRole('button', { name: 'Войти' })[1])

    expect(await screen.findByRole('dialog', { name: 'Вход в SkyFitnessPro' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Открыть меню пользователя' }),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Войти' }).length).toBeGreaterThan(0)
  })

  it('restores authenticated header and selected courses from localStorage', async () => {
    window.localStorage.setItem(
      'skyfitnesspro.auth',
      JSON.stringify({
        email: 'ivan@example.com',
        token: 'restored-token',
        username: 'ivan',
      }),
    )
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(
        createJsonResponse(createUserProfileResponse('ivan@example.com', ['ab1c3f'])),
      )
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = userEvent.setup()

    expect(
      await screen.findByRole('button', { name: 'Открыть меню пользователя' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://webdev-hw-api.herokuapp.com/api/fitness/users/me',
        expect.objectContaining({
          headers: { Authorization: 'Bearer restored-token' },
        }),
      )
    })
    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(screen.getByRole('button', { name: 'Мой профиль' }))

    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })

  it('does not send add request for course restored from user profile', async () => {
    window.localStorage.setItem(
      'skyfitnesspro.auth',
      JSON.stringify({
        email: 'ivan@example.com',
        token: 'restored-token',
        username: 'ivan',
      }),
    )
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(
        createJsonResponse(createUserProfileResponse('ivan@example.com', ['ab1c3f'])),
      )
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
    await user.click(await screen.findByRole('button', { name: 'Добавить курс: Йога' }))

    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          url === 'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/courses' &&
          init?.method === 'POST',
      ),
    ).toBe(false)
  })

  it('clears broken localStorage JSON and stays unauthenticated', async () => {
    window.localStorage.setItem('skyfitnesspro.auth', '{broken-json')
    mockFetchSuccess(courseDtoItems)

    renderApp()

    expect(window.localStorage.getItem('skyfitnesspro.auth')).toBeNull()
    expect(await screen.findByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('opens profile dropdown after clicking profile trigger', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp('ivan@example.com')
    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))

    expect(screen.getByRole('dialog', { name: 'ivan' })).toBeInTheDocument()
    expect(screen.getByText('ivan@example.com')).toBeInTheDocument()
  })

  it('closes profile dropdown after outside click', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp()
    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(document.body)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'ivan' })).not.toBeInTheDocument()
    })
  })

  it('closes profile dropdown after Escape', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp()
    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'ivan' })).not.toBeInTheDocument()
    })
  })

  it('navigates to profile after clicking profile dropdown action', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp('ivan@example.com')
    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(screen.getByRole('button', { name: 'Мой профиль' }))

    expect(await screen.findByRole('heading', { name: 'Профиль' })).toBeInTheDocument()
    expect(screen.getByText('Логин: ivan')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'ivan' })).not.toBeInTheDocument()
  })

  it('logs out from profile dropdown and restores login button', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp()
    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(
      screen.queryByRole('button', { name: 'Открыть меню пользователя' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
    expect(window.localStorage.getItem('skyfitnesspro.auth')).toBeNull()
  })

  it('clears localStorage after profile page logout', async () => {
    window.localStorage.setItem(
      'skyfitnesspro.auth',
      JSON.stringify({
        email: 'ivan@example.com',
        token: 'restored-token',
        username: 'ivan',
      }),
    )
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(createUserProfileResponse('ivan@example.com', [])))
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp(['/profile'])
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Выйти' }))

    expect(window.localStorage.getItem('skyfitnesspro.auth')).toBeNull()
    expect(await screen.findByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })

  it('adds course to profile after plus button click', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
      .mockResolvedValueOnce(createJsonResponse(createUserProfileResponse('ivan@example.com', [])))
      .mockResolvedValueOnce(createJsonResponse({ message: 'Курс успешно добавлен!' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp('ivan@example.com')

    await user.click(await screen.findByRole('button', { name: 'Добавить курс: Йога' }))

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            url === 'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/courses' &&
            init?.method === 'POST',
        ),
      ).toBe(true)
    })
    const addCourseCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === 'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/courses' &&
        init?.method === 'POST',
    )
    expect(addCourseCall?.[1]).toMatchObject({
      body: JSON.stringify({ courseId: 'ab1c3f' }),
      headers: { Authorization: 'Bearer jwt-token' },
      method: 'POST',
    })

    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(screen.getByRole('button', { name: 'Мой профиль' }))

    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })

  it('keeps added course when initial profile restore resolves after add request', async () => {
    const deferredProfile = createDeferredResponse(
      createUserProfileResponse('ivan@example.com', []),
    )
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
      .mockReturnValueOnce(deferredProfile.responsePromise)
      .mockResolvedValueOnce(createJsonResponse({ message: 'Курс успешно добавлен!' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp('ivan@example.com')

    await user.click(await screen.findByRole('button', { name: 'Добавить курс: Йога' }))
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            url === 'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/courses' &&
            init?.method === 'POST',
        ),
      ).toBe(true)
    })

    deferredProfile.resolve()

    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(screen.getByRole('button', { name: 'Мой профиль' }))

    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()
  })

  it('adds course with token restored from localStorage', async () => {
    window.localStorage.setItem(
      'skyfitnesspro.auth',
      JSON.stringify({
        email: 'ivan@example.com',
        token: 'restored-token',
        username: 'ivan',
      }),
    )
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse(createUserProfileResponse('ivan@example.com', [])))
      .mockResolvedValueOnce(createJsonResponse({ message: 'Курс успешно добавлен!' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Добавить курс: Йога' }))

    await waitFor(() => {
      expect(fetchMock.mock.calls[2]?.[1]).toMatchObject({
        headers: { Authorization: 'Bearer restored-token' },
        method: 'POST',
      })
    })
  })

  it('removes course from profile after minus button click', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
      .mockResolvedValueOnce(
        createJsonResponse(createUserProfileResponse('ivan@example.com', ['ab1c3f'])),
      )
      .mockResolvedValueOnce(createJsonResponse([]))
      .mockResolvedValueOnce(createJsonResponse({ message: 'Курс успешно удален!' }))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp('ivan@example.com')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Открыть меню пользователя' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(screen.getByRole('button', { name: 'Мой профиль' }))

    expect(await screen.findByRole('heading', { name: 'Йога' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Удалить курс Йога' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Йога' })).not.toBeInTheDocument()
    })
    expect(screen.getByText('У вас пока нет приобретённых курсов.')).toBeInTheDocument()
    const removeCourseCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === 'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/courses/ab1c3f' &&
        init?.method === 'DELETE',
    )
    expect(removeCourseCall?.[1]).toMatchObject({
      headers: { Authorization: 'Bearer jwt-token' },
      method: 'DELETE',
    })
  })

  it('keeps profile page stable when API profile response has no selected courses', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(courseDtoItems))
      .mockResolvedValueOnce(createJsonResponse({ token: 'jwt-token' }))
      .mockResolvedValueOnce(createJsonResponse(createUserProfileResponse('ivan@example.com')))
    Object.assign(globalThis, { fetch: fetchMock })

    renderApp()
    const user = await loginThroughApp('ivan@example.com')

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })
    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    await user.click(screen.getByRole('button', { name: 'Мой профиль' }))

    expect(await screen.findByText('У вас пока нет приобретённых курсов.')).toBeInTheDocument()
  })
})
