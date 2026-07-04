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

function getRuleBlock(stylesheet: string, selector: string): string {
  const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const ruleBlock = stylesheet.match(new RegExp(`${selectorPattern} \\{[\\s\\S]*?\\n\\}`))?.[0]

  expect(ruleBlock).toBeDefined()

  return ruleBlock ?? ''
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
  showSubtitle?: boolean,
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
        showSubtitle={showSubtitle}
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

  it('renders subtitle by default', () => {
    renderAppHeader()

    expect(screen.getByText('Онлайн-тренировки для занятий дома')).toBeInTheDocument()
  })

  it('does not render subtitle when disabled', () => {
    renderAppHeader(null, false, undefined, false)

    expect(screen.queryByText('Онлайн-тренировки для занятий дома')).not.toBeInTheDocument()
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

  it('keeps mobile brand source styles with viewport-edge sizing', () => {
    const stylesheet = getAppHeaderStylesheet()
    const mobileContainerBlock = getMobileRuleBlock(stylesheet, '.app-header__container')
    const mobileBrandGroupBlock = getMobileRuleBlock(stylesheet, '.app-header__brand-group')
    const mobileBrandBlock = getMobileRuleBlock(stylesheet, '.app-header__brand')
    const mobileLogoBlock = getMobileRuleBlock(stylesheet, '.app-header__logo')
    const mobileBrandTextBlock = getMobileRuleBlock(stylesheet, '.app-header__brand-text')

    expect(mobileContainerBlock).toContain('width: calc(100% - 32px);')
    expect(mobileContainerBlock).toContain('max-width: none;')
    expect(mobileContainerBlock).toContain('margin-inline: auto;')
    expect(mobileContainerBlock).toContain('padding-inline: 0;')
    expect(mobileContainerBlock).not.toContain('max-width: 343px;')
    expect(mobileBrandGroupBlock).toContain('width: 220px;')
    expect(mobileBrandGroupBlock).toContain('height: 35px;')
    expect(mobileBrandGroupBlock).toContain('flex-direction: row;')
    expect(mobileBrandGroupBlock).toContain('gap: 10px;')
    expect(mobileBrandBlock).toContain('width: 220px;')
    expect(mobileBrandBlock).toContain('height: 35px;')
    expect(mobileBrandBlock).toContain('gap: 10px;')
    expect(mobileLogoBlock).toContain('width: 28.9px;')
    expect(mobileLogoBlock).toContain('height: 20px;')
    expect(mobileLogoBlock).toContain('margin-top: 9px;')
    expect(mobileBrandTextBlock).toContain('max-width: 182.96px;')
    expect(mobileBrandTextBlock).toContain('height: 28.56px;')
    expect(mobileBrandTextBlock).toContain('margin-top: 6.72px;')
    expect(mobileBrandBlock).not.toContain('margin-top: 40px;')
    expect(stylesheet).not.toMatch(/AppHeader-module__/)
    expect(stylesheet).not.toMatch(/(^|})\s*#[A-Za-z_-]/)
  })

  it('keeps desktop header source layout stable', () => {
    const stylesheet = getAppHeaderStylesheet()
    const headerBlock = getRuleBlock(stylesheet, '.app-header')
    const innerBlock = getRuleBlock(stylesheet, '.app-header__inner')
    const brandBlock = getRuleBlock(stylesheet, '.app-header__brand')

    expect(headerBlock).toContain('margin-bottom: 60px;')
    expect(headerBlock).not.toContain('margin-bottom: 74px;')
    expect(innerBlock).toContain('height: 50px;')
    expect(innerBlock).toContain('align-items: center;')
    expect(brandBlock).toContain('width: 220px;')
    expect(brandBlock).toContain('height: 35px;')
    expect(brandBlock).toContain('align-items: center;')
    expect(stylesheet).not.toMatch(/AppHeader-module__/)
    expect(stylesheet).not.toMatch(/(^|})\s*#[A-Za-z_-]/)
  })

  it('keeps mobile inner header as a single 36px row', () => {
    const stylesheet = getAppHeaderStylesheet()
    const mobileInnerBlock = getMobileRuleBlock(stylesheet, '.app-header__inner')
    const mobileAuthBlock = getMobileRuleBlock(stylesheet, '.app-header__auth')
    const mobileLoginButtonBlock = getMobileRuleBlock(stylesheet, '.app-header__login-button')

    expect(mobileInnerBlock).toContain('display: flex;')
    expect(mobileInnerBlock).toContain('flex-direction: row;')
    expect(mobileInnerBlock).toContain('align-items: center;')
    expect(mobileInnerBlock).toContain('justify-content: space-between;')
    expect(mobileInnerBlock).toContain('width: 100%;')
    expect(mobileInnerBlock).toContain('height: 36px;')
    expect(mobileInnerBlock).toContain('min-height: 36px;')
    expect(mobileInnerBlock).not.toContain('max-height: 35px;')
    expect(mobileInnerBlock).toContain('gap: 0;')
    expect(mobileInnerBlock).toContain('box-sizing: border-box;')
    expect(mobileInnerBlock).toContain('overflow: visible;')
    expect(mobileInnerBlock).not.toContain('align-items: flex-start;')
    expect(mobileInnerBlock).not.toContain('gap: 16px;')
    expect(mobileLoginButtonBlock).toContain('min-width: 83px;')
    expect(mobileLoginButtonBlock).toContain('height: 36px;')
    expect(mobileLoginButtonBlock).toContain('border-radius: 46px;')
    expect(mobileLoginButtonBlock).toContain('padding: 8px 16px;')
    expect(mobileAuthBlock).not.toContain('margin-top: 40px;')
  })
})
