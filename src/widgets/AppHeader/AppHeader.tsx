import logoIcon from '@image/Logo.svg'
import skyFitnessLogo from '@image/SkyFitnessPro.svg'
import { useId, useRef } from 'react'

import type { AuthSession } from '@features/auth/model/auth-session.types'
import { ProfileDropdown } from '@features/auth/ui/ProfileDropdown'
import { UserProfileTrigger } from '@features/auth/ui/UserProfileTrigger'
import { Button } from '@shared/ui/Button'
import { Container } from '@shared/ui/Container'
import { Icon } from '@shared/ui/Icon'

import styles from './AppHeader.module.scss'

export type AppHeaderProps = {
  authSession: AuthSession | null
  isProfileDropdownOpen: boolean
  onLoginClick: () => void
  onLogout: () => void
  onProfileClick: () => void
  onProfileNavigate: () => void
  onProfileDropdownClose: () => void
}

export function AppHeader({
  authSession,
  isProfileDropdownOpen,
  onLoginClick,
  onLogout,
  onProfileClick,
  onProfileNavigate,
  onProfileDropdownClose,
}: AppHeaderProps) {
  const profileDropdownId = useId()
  const profileTriggerRef = useRef<HTMLButtonElement | null>(null)

  return (
    <header className={styles['app-header']}>
      <Container className={styles['app-header__container']}>
        <div className={styles['app-header__inner']}>
          <div className={styles['app-header__brand-group']}>
            <a className={styles['app-header__brand']} href="/" aria-label="SkyFitnessPro">
              <Icon alt="" className={styles['app-header__logo']} decorative src={logoIcon} />
              <img
                className={styles['app-header__brand-text']}
                src={skyFitnessLogo}
                alt="SkyFitnessPro"
              />
            </a>
            <p className={styles['app-header__subtitle']}>Онлайн-тренировки для занятий дома</p>
          </div>
          <div className={styles['app-header__auth']}>
            {authSession ? (
              <>
                <UserProfileTrigger
                  aria-controls={isProfileDropdownOpen ? profileDropdownId : undefined}
                  aria-expanded={isProfileDropdownOpen}
                  onClick={onProfileClick}
                  ref={profileTriggerRef}
                  userName={authSession.displayName}
                />
                {isProfileDropdownOpen ? (
                  <ProfileDropdown
                    className={styles['app-header__profile-dropdown']}
                    id={profileDropdownId}
                    onClose={onProfileDropdownClose}
                    onLogout={onLogout}
                    onProfileClick={onProfileNavigate}
                    session={authSession}
                    triggerRef={profileTriggerRef}
                  />
                ) : null}
              </>
            ) : (
              <Button className={styles['app-header__login-button']} onClick={onLoginClick}>
                Войти
              </Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
