import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CoursesPage } from '@pages/CoursesPage/CoursesPage'

import { LoginModal } from './LoginModal'
import { mockFetchError, mockFetchResponse, mockFetchSuccess } from '../../../../test/fetchMock'

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

describe('LoginModal', () => {
  beforeEach(() => {
    mockFetchSuccess(courseDtoItems)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('opens after clicking login button on courses page', async () => {
    const user = userEvent.setup()

    render(<CoursesPage />)

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByRole('dialog', { name: 'Вход в SkyFitnessPro' })).toBeInTheDocument()
  })

  it('renders login form fields and actions', () => {
    render(<LoginModal onClose={jest.fn()} />)

    expect(screen.getByLabelText('Эл. почта')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument()
  })

  it('shows validation errors after empty login submit', async () => {
    const user = userEvent.setup()

    render(<LoginModal onClose={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Введите эл. почту')).toBeInTheDocument()
    expect(screen.getByText('Введите пароль')).toBeInTheDocument()
  })

  it('shows two-line password error after wrong login password', async () => {
    const user = userEvent.setup()

    render(<LoginModal onClose={jest.fn()} />)

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

  it('shows success message after successful login', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchSuccess({ token: 'jwt-token' })

    render(<LoginModal onClose={jest.fn()} />)

    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Вход выполнен успешно!')).toBeInTheDocument()
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

    render(<LoginModal onClose={jest.fn()} />)

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

    render(<LoginModal onClose={jest.fn()} />)

    await user.type(screen.getByLabelText('Эл. почта'), 'new.user@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'Secure!!')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByRole('button', { name: 'Войти' })).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('switches to sign in mode after clicking register button', async () => {
    const user = userEvent.setup()

    render(<LoginModal onClose={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(screen.getByRole('dialog', { name: 'Регистрация в SkyFitnessPro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Эл. почта')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByLabelText('Повторите пароль')).toBeInTheDocument()
  })

  it('shows registration password mismatch error', async () => {
    const user = userEvent.setup()

    render(<LoginModal onClose={jest.fn()} />)

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

    render(<LoginModal onClose={jest.fn()} />)

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

    render(<LoginModal onClose={jest.fn()} />)

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

    render(<LoginModal onClose={jest.fn()} />)

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

    render(<LoginModal onClose={jest.fn()} />)

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

    render(<LoginModal onClose={jest.fn()} />)

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

    render(<LoginModal onClose={jest.fn()} />)

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

    render(<LoginModal onClose={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByRole('dialog', { name: 'Вход в SkyFitnessPro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Эл. почта')).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(<LoginModal onClose={handleClose} />)

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('closes after clicking backdrop', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()
    const { container } = render(<LoginModal onClose={handleClose} />)
    const backdrop = container.querySelector('.login-modal')

    expect(backdrop).not.toBeNull()

    if (backdrop) {
      await user.click(backdrop)
    }

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })
})
