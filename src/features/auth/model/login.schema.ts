import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'Введите логин'),
  password: z
    .string()
    .min(1, 'Введите пароль')
    .min(6, 'Пароль введен неверно, попробуйте еще раз.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const loginPasswordErrorMessage = 'Пароль введен неверно, попробуйте еще раз.'
