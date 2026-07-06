import { AppRouter } from '@app/router/AppRouter'
import { ErrorBoundary } from '@shared/ui/ErrorBoundary/ErrorBoundary'

import styles from './App.module.scss'

function App() {
  return (
    <div className={styles.app}>
      <main className={styles.app__main}>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default App
