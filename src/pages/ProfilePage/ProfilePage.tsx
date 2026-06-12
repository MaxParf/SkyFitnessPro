import styles from './ProfilePage.module.scss'

export function ProfilePage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.page__title}>Профиль</h1>
      <p className={styles.page__text}>Личный кабинет пользователя будет реализован позже.</p>
    </section>
  )
}
