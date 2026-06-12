import styles from './CoursesPage.module.scss'

export function CoursesPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.page__title}>Курсы</h1>
      <p className={styles.page__text}>Стартовая страница каталога курсов.</p>
    </section>
  )
}
