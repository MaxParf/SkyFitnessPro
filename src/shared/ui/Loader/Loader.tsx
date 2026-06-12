import styles from './Loader.module.scss'

export function Loader() {
  return (
    <div className={styles.loader} role="status">
      Загрузка...
    </div>
  )
}
