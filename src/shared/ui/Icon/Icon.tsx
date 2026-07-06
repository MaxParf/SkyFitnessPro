import styles from './Icon.module.scss'

type IconSize = 'small' | 'medium' | 'large'

type IconBaseProps = {
  className?: string
  size?: IconSize
  src: string
}

type InformativeIconProps = IconBaseProps & {
  alt: string
  decorative?: false
}

type DecorativeIconProps = IconBaseProps & {
  alt?: ''
  decorative: true
}

export type IconProps = InformativeIconProps | DecorativeIconProps

export function Icon({
  alt = '',
  className = '',
  decorative = false,
  size = 'medium',
  src,
}: IconProps) {
  const iconClassName = [styles.icon, styles[`icon--${size}`], className].filter(Boolean).join(' ')

  return <img alt={alt} aria-hidden={decorative} className={iconClassName} src={src} />
}
