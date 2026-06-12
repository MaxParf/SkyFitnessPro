import { Component, type ErrorInfo, type ReactNode } from 'react'

import styles from './ErrorBoundary.module.scss'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application error boundary caught an error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className={styles.errorBoundary} role="alert">
          <h1 className={styles.errorBoundary__title}>Что-то пошло не так</h1>
          <p className={styles.errorBoundary__text}>Обновите страницу или попробуйте позже.</p>
        </section>
      )
    }

    return this.props.children
  }
}
