import { readFileSync } from 'node:fs'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { AuthSession } from '@features/auth/model/auth-session.types'

import { AppHeader } from './AppHeader'

const authSession: AuthSession = {
  displayName: 'ivan',
  email: 'ivan@example.com',
  token: 'jwt-token',
  username: 'ivan',
}

function getAppHeaderStylesheet(): string {
  return readFileSync('src/widgets/AppHeader/AppHeader.module.scss', 'utf8')
}

function getMobileMediaBlock(stylesheet: string): string {
  const mobileMediaBlock = stylesheet.match(
    /@media \(max-width: 767px\) \{[\s\S]*?\n\}(?=\n\n@media|\n*$)/,
  )?.[0]

  expect(mobileMediaBlock).toBeDefined()

  return mobileMediaBlock ?? ''
}

function getMobileRuleBlock(stylesheet: string, selector: string): string {
  const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const mobileRuleBlock = getMobileMediaBlock(stylesheet).match(
    new RegExp(`${selectorPattern} \\{[\\s\\S]*?\\n  \\}`),
  )?.[0]

  expect(mobileRuleBlock).toBeDefined()

  return mobileRuleBlock ?? ''
}

function renderAppHeader(
  session: AuthSession | null = null,
  isProfileDropdownOpen = false,
  handlers = {
    onLoginClick: jest.fn(),
    onLogout: jest.fn(),
    onProfileClick: jest.fn(),
    onProfileDropdownClose: jest.fn(),
    onProfileNavigate: jest.fn(),
  },
) {
  return {
    handlers,
    ...render(
      <AppHeader
        authSession={session}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLoginClick={handlers.onLoginClick}
        onLogout={handlers.onLogout}
        onProfileClick={handlers.onProfileClick}
        onProfileDropdownClose={handlers.onProfileDropdownClose}
        onProfileNavigate={handlers.onProfileNavigate}
      />,
    ),
  }
}

describe('AppHeader', () => {
  it('renders brand and opens login from unauthenticated header', async () => {
    const user = userEvent.setup()
    const { handlers } = renderAppHeader()

    expect(screen.getByLabelText('SkyFitnessPro')).toBeInTheDocument()
    expect(screen.getByText('Онлайн-тренировки для занятий дома')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(handlers.onLoginClick).toHaveBeenCalledTimes(1)
  })

  it('renders user trigger and profile dropdown actions', async () => {
    const user = userEvent.setup()
    const { handlers } = renderAppHeader(authSession, true)

    await user.click(screen.getByRole('button', { name: 'Открыть меню пользователя' }))
    expect(handlers.onProfileClick).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Мой профиль' }))
    expect(handlers.onProfileNavigate).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Выйти' }))
    expect(handlers.onLogout).toHaveBeenCalledTimes(1)
  })

  it('keeps mobile brand source styles without duplicated top spacing', () => {
    const stylesheet = getAppHeaderStylesheet()
    const mobileBrandBlock = getMobileRuleBlock(stylesheet, '.app-header__brand')

    expect(mobileBrandBlock).toContain('width: 220px;')
    expect(mobileBrandBlock).toContain('height: 35px;')
    expect(mobileBrandBlock).not.toContain('margin-top: 40px;')
    expect(stylesheet).not.toMatch(/AppHeader-module__/)
    expect(stylesheet).not.toMatch(/(^|})\s*#[A-Za-z_-]/)
  })

  it('keeps mobile inner header as a single 35px row', () => {
    const stylesheet = getAppHeaderStylesheet()
    const mobileInnerBlock = getMobileRuleBlock(stylesheet, '.app-header__inner')
    const mobileAuthBlock = getMobileRuleBlock(stylesheet, '.app-header__auth')

    expect(mobileInnerBlock).toContain('display: flex;')
    expect(mobileInnerBlock).toContain('flex-direction: row;')
    expect(mobileInnerBlock).toContain('align-items: center;')
    expect(mobileInnerBlock).toContain('justify-content: space-between;')
    expect(mobileInnerBlock).toContain('width: 100%;')
    expect(mobileInnerBlock).toContain('height: 35px;')
    expect(mobileInnerBlock).toContain('min-height: 35px;')
    expect(mobileInnerBlock).toContain('max-height: 35px;')
    expect(mobileInnerBlock).toContain('gap: 0;')
    expect(mobileInnerBlock).toContain('box-sizing: border-box;')
    expect(mobileInnerBlock).toContain('overflow: visible;')
    expect(mobileInnerBlock).not.toContain('align-items: flex-start;')
    expect(mobileInnerBlock).not.toContain('gap: 16px;')
    expect(mobileAuthBlock).not.toContain('margin-top: 40px;')
  })
})
