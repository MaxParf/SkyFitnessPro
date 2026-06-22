import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CoursesPage } from '@pages/CoursesPage/CoursesPage'

import { LoginModal } from './LoginModal'

describe('LoginModal', () => {
  it('opens after clicking login button on courses page', async () => {
    const user = userEvent.setup()

    render(<CoursesPage />)

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByRole('dialog', { name: 'Вход в SkyFitnessPro' })).toBeInTheDocument()
  })

  it('renders login form fields and actions', () => {
    render(<LoginModal onClose={jest.fn()} />)

    expect(screen.getByLabelText('Логин')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument()
  })

  it('shows validation errors after empty login submit', async () => {
    const user = userEvent.setup()

    render(<LoginModal onClose={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Введите логин')).toBeInTheDocument()
    expect(screen.getByText('Введите пароль')).toBeInTheDocument()
  })

  it('shows two-line password error after wrong login password', async () => {
    const user = userEvent.setup()

    render(<LoginModal onClose={jest.fn()} />)

    await user.type(screen.getByLabelText('Логин'), 'sergey.petrov96@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(
      await screen.findByText(
        (_, element) => element?.textContent === 'Пароль введен неверно,попробуйте еще раз.',
      ),
    ).toBeInTheDocument()
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
    await user.type(screen.getByLabelText('Пароль'), 'password1')
    await user.type(screen.getByLabelText('Повторите пароль'), 'password2')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument()
  })

  it('shows duplicate email error in sign in mode', async () => {
    const user = userEvent.setup()

    render(<LoginModal onClose={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.type(screen.getByLabelText('Эл. почта'), 'sergey.petrov96@mail.ru')
    await user.type(screen.getByLabelText('Пароль'), 'password1')
    await user.type(screen.getByLabelText('Повторите пароль'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(
      await screen.findByText(
        (_, element) => element?.textContent === 'Данная почта уже используется.Попробуйте войти.',
      ),
    ).toBeInTheDocument()
  })

  it('returns to login mode after clicking login button in sign in mode', async () => {
    const user = userEvent.setup()

    render(<LoginModal onClose={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByRole('dialog', { name: 'Вход в SkyFitnessPro' })).toBeInTheDocument()
    expect(screen.getByLabelText('Логин')).toBeInTheDocument()
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
