import { z } from 'zod'

export const duplicateEmailErrorMessage = 'Данная почта уже используется. Попробуйте войти.'

const specialCharactersPattern = /[^A-Za-zА-Яа-яЁё0-9]/g
const uppercaseLetterPattern = /[A-ZА-ЯЁ]/

export const registerSchema = z
  .object({
    email: z.string().trim().min(1, 'Введите эл. почту').email('Введите корректную эл. почту'),
    password: z
      .string()
      .min(1, 'Введите пароль')
      .min(6, 'Пароль должен содержать не менее 6 символов')
      .refine((password) => uppercaseLetterPattern.test(password), {
        message: 'Пароль должен содержать минимум одну заглавную букву',
      })
      .refine((password) => (password.match(specialCharactersPattern) ?? []).length >= 2, {
        message: 'Пароль должен содержать минимум два специальных символа',
      }),
    repeatPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Пароли не совпадают',
    path: ['repeatPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
