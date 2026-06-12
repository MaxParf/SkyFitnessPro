import styles from './ErrorState.module.scss'

type ErrorStateProps = {
  title: string
  description?: string
}

export function ErrorState({ title, description }: ErrorStateProps) {
  return (
    <section className={styles.errorState} role="alert">
      <h2 className={styles.errorState__title}>{title}</h2>
      {description ? <p className={styles.errorState__description}>{description}</p> : null}
    </section>
  )
}
