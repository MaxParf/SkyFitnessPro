import styles from './EmptyState.module.scss'

type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className={styles.emptyState}>
      <h2 className={styles.emptyState__title}>{title}</h2>
      {description ? <p className={styles.emptyState__description}>{description}</p> : null}
    </section>
  )
}
