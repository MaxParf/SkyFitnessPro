import { NavLink } from 'react-router-dom'

import { AppRouter } from '@app/router/AppRouter'
import { ErrorBoundary } from '@shared/ui/ErrorBoundary/ErrorBoundary'

import styles from './App.module.scss'

const getLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  isActive ? `${styles.app__link} ${styles['app__link--active']}` : styles.app__link

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.app__header}>
        <NavLink to="/" className={styles.app__brand}>
          SkyFitnessPro
        </NavLink>
        <nav className={styles.app__nav} aria-label="Основная навигация">
          <NavLink to="/" end className={getLinkClassName}>
            Курсы
          </NavLink>
          <NavLink to="/auth" className={getLinkClassName}>
            Вход
          </NavLink>
          <NavLink to="/profile" className={getLinkClassName}>
            Профиль
          </NavLink>
        </nav>
      </header>

      <main className={styles.app__main}>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default App
