import type { ReactNode } from 'react'

import styles from './Container.module.scss'

type ContainerTag = 'article' | 'div' | 'main' | 'section'

export type ContainerProps = {
  'aria-label'?: string
  as?: ContainerTag
  children: ReactNode
  className?: string
}

export function Container({
  'aria-label': ariaLabel,
  as: Component = 'div',
  children,
  className = '',
}: ContainerProps) {
  const containerClassName = [styles.container, className].filter(Boolean).join(' ')

  return (
    <Component aria-label={ariaLabel} className={containerClassName}>
      {children}
    </Component>
  )
}
