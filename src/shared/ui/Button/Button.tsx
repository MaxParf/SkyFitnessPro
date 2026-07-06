import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'secondary'

type ButtonBaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  children?: ReactNode
  className?: string
}

type ButtonTextProps = ButtonBaseProps & {
  variant?: ButtonVariant
}

type ButtonIconProps = ButtonBaseProps & {
  'aria-label': string
  variant: 'icon'
}

export type ButtonProps = ButtonTextProps | ButtonIconProps

export function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const buttonClassName = [
    styles.button,
    styles[`button--${variant}`],
    props.disabled ? styles['button--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={buttonClassName} type={type} {...props}>
      {children}
    </button>
  )
}
