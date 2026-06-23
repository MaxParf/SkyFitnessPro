import avatarIcon from '@image/Icon_ava.svg'
import { forwardRef } from 'react'

import styles from './UserProfileTrigger.module.scss'

export type UserProfileTriggerProps = {
  'aria-controls'?: string
  'aria-expanded': boolean
  onClick: () => void
  userName: string
}

export const UserProfileTrigger = forwardRef<HTMLButtonElement, UserProfileTriggerProps>(
  function UserProfileTrigger(
    { 'aria-controls': ariaControls, 'aria-expanded': ariaExpanded, onClick, userName },
    ref,
  ) {
    return (
      <button
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        aria-label="Открыть меню пользователя"
        className={styles['user-profile-trigger']}
        onClick={onClick}
        ref={ref}
        type="button"
      >
        <span className={styles['user-profile-trigger__avatar']} aria-hidden="true">
          <img alt="" className={styles['user-profile-trigger__avatar-icon']} src={avatarIcon} />
        </span>
        <span className={styles['user-profile-trigger__content']}>
          <span className={styles['user-profile-trigger__name']}>{userName}</span>
          <span className={styles['user-profile-trigger__chevron']} aria-hidden="true" />
        </span>
      </button>
    )
  },
)
