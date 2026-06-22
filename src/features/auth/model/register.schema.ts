import { z } from 'zod'

export const duplicateEmail = 'sergey.petrov96@mail.ru'

export const duplicateEmailErrorMessage = 'Данная почта уже используется. Попробуйте войти.'

export const registerSchema = z
  .object({
    email: z.string().trim().min(1, 'Введите эл. почту').email('Введите корректную эл. почту'),
    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(6, 'Пароль должен содержать не менее 6 символов'),
    repeatPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Пароли не совпадают',
    path: ['repeatPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
