import { useEffect, useId, useRef, type RefObject } from 'react'

import type { AuthSession } from '../../model/auth-session.types'
import styles from './ProfileDropdown.module.scss'

export type ProfileDropdownProps = {
  className?: string
  id: string
  onClose: () => void
  onLogout: () => void
  onProfileClick: () => void
  session: AuthSession
  triggerRef: RefObject<HTMLButtonElement | null>
}

export function ProfileDropdown({
  className = '',
  id,
  onClose,
  onLogout,
  onProfileClick,
  session,
  triggerRef,
}: ProfileDropdownProps) {
  const titleId = useId()
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const profileButtonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownClassName = [styles['profile-dropdown'], className].filter(Boolean).join(' ')

  useEffect(() => {
    profileButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (dropdownRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return
      }

      onClose()
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, triggerRef])

  return (
    <div
      aria-labelledby={titleId}
      className={dropdownClassName}
      id={id}
      ref={dropdownRef}
      role="dialog"
    >
      <div className={styles['profile-dropdown__user']}>
        <p className={styles['profile-dropdown__name']} id={titleId}>
          {session.displayName}
        </p>
        <p className={styles['profile-dropdown__email']}>{session.email}</p>
      </div>

      <div className={styles['profile-dropdown__actions']}>
        <button
          className={styles['profile-dropdown__button']}
          onClick={onProfileClick}
          ref={profileButtonRef}
          type="button"
        >
          Мой профиль
        </button>
        <button
          className={`${styles['profile-dropdown__button']} ${styles['profile-dropdown__button--secondary']}`}
          onClick={onLogout}
          type="button"
        >
          Выйти
        </button>
      </div>
    </div>
  )
}
