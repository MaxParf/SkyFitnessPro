import avatarIcon from '@image/Icon_ava.svg'

import styles from './UserProfileTrigger.module.scss'

export type UserProfileTriggerProps = {
  userName: string
}

export function UserProfileTrigger({ userName }: UserProfileTriggerProps) {
  return (
    <button
      className={styles['user-profile-trigger']}
      type="button"
      aria-label="Открыть меню пользователя"
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
}
