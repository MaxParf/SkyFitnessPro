import { Icon } from '@shared/ui/Icon'

import styles from './MetaBadge.module.scss'

export type MetaBadgeProps = {
  iconAlt?: string
  iconSrc: string
  text: string
}

export function MetaBadge({ iconAlt = '', iconSrc, text }: MetaBadgeProps) {
  return (
    <span className={styles['meta-badge']}>
      {iconAlt ? (
        <Icon alt={iconAlt} size="small" src={iconSrc} />
      ) : (
        <Icon alt="" decorative size="small" src={iconSrc} />
      )}
      <span className={styles['meta-badge__text']}>{text}</span>
    </span>
  )
}
