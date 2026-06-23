import { zodResolver } from '@hookform/resolvers/zod'
import logoIcon from '@image/Logo.svg'
import skyFitnessLogo from '@image/SkyFitnessPro.svg'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@shared/ui/Button'
import { FitnessApiError } from '@shared/api/fitnessApi'
import { Icon } from '@shared/ui/Icon'

import { loginUser, registerUser } from '../../api/auth.service'
import type { AuthModalMode } from '../../model/auth-modal.types'
import {
  loginPasswordErrorMessage,
  loginSchema,
  type LoginFormValues,
} from '../../model/login.schema'
import {
  duplicateEmailErrorMessage,
  registerSchema,
  type RegisterFormValues,
} from '../../model/register.schema'
import styles from './LoginModal.module.scss'

export type LoginModalProps = {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [mode, setMode] = useState<AuthModalMode>('login')
  const [loginFormError, setLoginFormError] = useState('')
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('')
  const [registerFormError, setRegisterFormError] = useState('')
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState('')
  const titleId = useId()
  const loginInputId = useId()
  const loginPasswordInputId = useId()
  const emailInputId = useId()
  const registerPasswordInputId = useId()
  const repeatPasswordInputId = useId()
  const loginErrorId = useId()
  const loginPasswordErrorId = useId()
  const emailErrorId = useId()
  const registerPasswordErrorId = useId()
  const repeatPasswordErrorId = useId()
  const firstInputRef = useRef<HTMLInputElement | null>(null)

  const {
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    handleSubmit: handleLoginSubmit,
    register: registerLoginField,
    reset: resetLoginForm,
    setError: setLoginError,
  } = useForm<LoginFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(loginSchema),
  })

  const {
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
    handleSubmit: handleRegisterSubmit,
    register: registerRegisterField,
    reset: resetRegisterForm,
    setError: setRegisterError,
  } = useForm<RegisterFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(registerSchema),
  })

  const { ref: loginFieldRef, ...loginFieldProps } = registerLoginField('login')
  const loginPasswordFieldProps = registerLoginField('password')
  const { ref: emailFieldRef, ...emailFieldProps } = registerRegisterField('email')
  const registerPasswordFieldProps = registerRegisterField('password')
  const repeatPasswordFieldProps = registerRegisterField('repeatPassword')

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [mode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleLoginValidSubmit = async (values: LoginFormValues): Promise<void> => {
    setLoginFormError('')
    setLoginSuccessMessage('')

    try {
      await loginUser({
        email: values.login,
        password: values.password,
      })

      setLoginSuccessMessage('Вход выполнен успешно!')
    } catch (error) {
      const message =
        error instanceof FitnessApiError && error.hasServerMessage
          ? error.message
          : 'Не удалось войти. Попробуйте позже.'

      if (message === 'Неверный пароль' || message === 'Пользователь с таким email не найден') {
        setLoginError('password', {
          message: loginPasswordErrorMessage,
          type: 'validate',
        })
        return
      }

      setLoginFormError(message)
    }
  }

  const handleRegisterValidSubmit = async (values: RegisterFormValues): Promise<void> => {
    setRegisterFormError('')
    setRegisterSuccessMessage('')

    try {
      const response = await registerUser({
        email: values.email,
        password: values.password,
      })

      setRegisterSuccessMessage(response.message)
    } catch (error) {
      const message =
        error instanceof FitnessApiError && error.hasServerMessage
          ? error.message
          : 'Не удалось зарегистрироваться. Попробуйте позже.'

      if (message === 'Пользователь с таким email уже существует') {
        setRegisterError('email', {
          message: duplicateEmailErrorMessage,
          type: 'validate',
        })
        return
      }

      setRegisterFormError(message)
    }
  }

  const handleModeChange = (nextMode: AuthModalMode): void => {
    resetLoginForm()
    resetRegisterForm()
    setLoginFormError('')
    setLoginSuccessMessage('')
    setRegisterFormError('')
    setRegisterSuccessMessage('')
    setMode(nextMode)
  }

  const dialogTitle = mode === 'login' ? 'Вход в SkyFitnessPro' : 'Регистрация в SkyFitnessPro'

  return (
    <div className={styles['login-modal']} onMouseDown={onClose}>
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles['login-modal__dialog']}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className={styles['login-modal__title']} id={titleId}>
          {dialogTitle}
        </h2>
        <div className={styles['login-modal__brand']} aria-hidden="true">
          <Icon alt="" className={styles['login-modal__brand-icon']} decorative src={logoIcon} />
          <img alt="" className={styles['login-modal__brand-text']} src={skyFitnessLogo} />
        </div>

        {mode === 'login' ? (
          <form
            className={styles['login-modal__form']}
            noValidate
            onSubmit={handleLoginSubmit(handleLoginValidSubmit)}
          >
            <div className={styles['login-modal__fields']}>
              <div className={styles['login-modal__field']}>
                <label className={styles['login-modal__label']} htmlFor={loginInputId}>
                  Эл. почта
                </label>
                <input
                  aria-describedby={loginErrors.login ? loginErrorId : undefined}
                  aria-invalid={Boolean(loginErrors.login)}
                  className={styles['login-modal__input']}
                  id={loginInputId}
                  placeholder="Эл. почта"
                  type="email"
                  {...loginFieldProps}
                  ref={(element) => {
                    loginFieldRef(element)
                    firstInputRef.current = element
                  }}
                />
                {loginErrors.login ? (
                  <p className={styles['login-modal__error']} id={loginErrorId}>
                    {loginErrors.login.message}
                  </p>
                ) : null}
              </div>

              <div className={styles['login-modal__field']}>
                <label className={styles['login-modal__label']} htmlFor={loginPasswordInputId}>
                  Пароль
                </label>
                <input
                  aria-describedby={loginErrors.password ? loginPasswordErrorId : undefined}
                  aria-invalid={Boolean(loginErrors.password)}
                  className={styles['login-modal__input']}
                  id={loginPasswordInputId}
                  placeholder="Пароль"
                  type="password"
                  {...loginPasswordFieldProps}
                />
                {loginErrors.password ? (
                  <p className={styles['login-modal__error']} id={loginPasswordErrorId}>
                    {loginErrors.password.message === loginPasswordErrorMessage ? (
                      <>
                        Пароль введен неверно,
                        <br />
                        попробуйте еще раз.
                      </>
                    ) : (
                      loginErrors.password.message
                    )}
                  </p>
                ) : null}
              </div>
            </div>

            <div className={styles['login-modal__actions']}>
              <Button
                className={styles['login-modal__submit']}
                disabled={isLoginSubmitting}
                type="submit"
              >
                Войти
              </Button>
              <Button
                className={styles['login-modal__register-button']}
                onClick={() => handleModeChange('register')}
                type="button"
                variant="secondary"
              >
                Зарегистрироваться
              </Button>
            </div>
            {loginSuccessMessage ? (
              <p className={styles['login-modal__success']} role="status">
                {loginSuccessMessage}
              </p>
            ) : null}
            {loginFormError ? (
              <p className={styles['login-modal__form-error']} role="alert">
                {loginFormError}
              </p>
            ) : null}
          </form>
        ) : (
          <form
            className={styles['login-modal__form']}
            noValidate
            onSubmit={handleRegisterSubmit(handleRegisterValidSubmit)}
          >
            <div className={styles['login-modal__fields']}>
              <div className={styles['login-modal__field']}>
                <label className={styles['login-modal__label']} htmlFor={emailInputId}>
                  Эл. почта
                </label>
                <input
                  aria-describedby={registerErrors.email ? emailErrorId : undefined}
                  aria-invalid={Boolean(registerErrors.email)}
                  className={styles['login-modal__input']}
                  id={emailInputId}
                  placeholder="Эл. почта"
                  type="email"
                  {...emailFieldProps}
                  ref={(element) => {
                    emailFieldRef(element)
                    firstInputRef.current = element
                  }}
                />
                {registerErrors.email ? (
                  <p className={styles['login-modal__error']} id={emailErrorId}>
                    {registerErrors.email.message === duplicateEmailErrorMessage ? (
                      <>
                        Данная почта уже используется.
                        <br />
                        Попробуйте войти.
                      </>
                    ) : (
                      registerErrors.email.message
                    )}
                  </p>
                ) : null}
              </div>

              <div className={styles['login-modal__field']}>
                <label className={styles['login-modal__label']} htmlFor={registerPasswordInputId}>
                  Пароль
                </label>
                <input
                  aria-describedby={registerErrors.password ? registerPasswordErrorId : undefined}
                  aria-invalid={Boolean(registerErrors.password)}
                  className={styles['login-modal__input']}
                  id={registerPasswordInputId}
                  placeholder="Пароль"
                  type="password"
                  {...registerPasswordFieldProps}
                />
                {registerErrors.password ? (
                  <p className={styles['login-modal__error']} id={registerPasswordErrorId}>
                    {registerErrors.password.message}
                  </p>
                ) : null}
              </div>

              <div className={styles['login-modal__field']}>
                <label className={styles['login-modal__label']} htmlFor={repeatPasswordInputId}>
                  Повторите пароль
                </label>
                <input
                  aria-describedby={
                    registerErrors.repeatPassword ? repeatPasswordErrorId : undefined
                  }
                  aria-invalid={Boolean(registerErrors.repeatPassword)}
                  className={styles['login-modal__input']}
                  id={repeatPasswordInputId}
                  placeholder="Повторите пароль"
                  type="password"
                  {...repeatPasswordFieldProps}
                />
                {registerErrors.repeatPassword ? (
                  <p className={styles['login-modal__error']} id={repeatPasswordErrorId}>
                    {registerErrors.repeatPassword.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className={styles['login-modal__actions']}>
              <Button
                className={styles['login-modal__submit']}
                disabled={isRegisterSubmitting}
                type="submit"
              >
                Зарегистрироваться
              </Button>
              <Button
                className={styles['login-modal__register-button']}
                onClick={() => handleModeChange('login')}
                type="button"
                variant="secondary"
              >
                Войти
              </Button>
            </div>
            {registerSuccessMessage ? (
              <p className={styles['login-modal__success']} role="status">
                {registerSuccessMessage}
              </p>
            ) : null}
            {registerFormError ? (
              <p className={styles['login-modal__form-error']} role="alert">
                {registerFormError}
              </p>
            ) : null}
          </form>
        )}
      </section>
    </div>
  )
}
