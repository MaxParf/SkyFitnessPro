import { useParams } from 'react-router-dom'

import styles from './WorkoutPage.module.scss'

export function WorkoutPage() {
  const { workoutId } = useParams()

  return (
    <section className={styles.page}>
      <h1 className={styles.page__title}>Тренировка</h1>
      <p className={styles.page__text}>Идентификатор тренировки: {workoutId}</p>
    </section>
  )
}
