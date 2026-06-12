import { useParams } from 'react-router-dom'

import styles from './CoursePage.module.scss'

export function CoursePage() {
  const { courseId } = useParams()

  return (
    <section className={styles.page}>
      <h1 className={styles.page__title}>Курс</h1>
      <p className={styles.page__text}>Идентификатор курса: {courseId}</p>
    </section>
  )
}
