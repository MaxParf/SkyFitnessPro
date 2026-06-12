import styles from './NotFoundPage.module.scss'

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.page__title}>Страница не найдена</h1>
      <p className={styles.page__text}>Проверьте адрес или вернитесь к списку курсов.</p>
    </section>
  )
}
