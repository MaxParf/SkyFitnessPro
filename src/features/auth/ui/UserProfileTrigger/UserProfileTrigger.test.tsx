import { readFileSync } from 'node:fs'

import { render, screen } from '@testing-library/react'

import { UserProfileTrigger } from './UserProfileTrigger'

describe('UserProfileTrigger', () => {
  function getUserProfileTriggerStylesheet(): string {
    return readFileSync(
      'src/features/auth/ui/UserProfileTrigger/UserProfileTrigger.module.scss',
      'utf8',
    )
  }

  function getMobileMediaBlock(stylesheet: string): string {
    const mobileMediaBlock = stylesheet.match(
      /@media \(max-width: 767px\) \{[\s\S]*?\n\}(?=\n\n@media|\n*$)/,
    )?.[0]

    expect(mobileMediaBlock).toBeDefined()

    return mobileMediaBlock ?? ''
  }

  function expectChevronPseudoElementStructure(stylesheet: string): void {
    expect(stylesheet).toMatch(
      /\.user-profile-trigger__chevron::before,\n\.user-profile-trigger__chevron::after \{[\s\S]*width: 6px;[\s\S]*height: 2px;[\s\S]*content: '';[\s\S]*\}/,
    )
    expect(stylesheet).toMatch(
      /\.user-profile-trigger__chevron::before \{[\s\S]*transform: rotate\(45deg\);[\s\S]*\}/,
    )
    expect(stylesheet).toMatch(
      /\.user-profile-trigger__chevron::after \{[\s\S]*transform: rotate\(-45deg\);[\s\S]*\}/,
    )
  }

  it('renders username, avatar and chevron', () => {
    const { container } = render(
      <UserProfileTrigger aria-expanded={false} onClick={jest.fn()} userName="ivan" />,
    )

    expect(screen.getByRole('button', { name: 'Открыть меню пользователя' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Открыть меню пользователя' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByText('ivan')).toBeInTheDocument()
    expect(container.querySelector('.user-profile-trigger__avatar')).toBeInTheDocument()
    expect(container.querySelector('.user-profile-trigger__chevron')).toBeInTheDocument()
  })

  it('keeps username in the DOM for desktop behavior', () => {
    render(<UserProfileTrigger aria-expanded={false} onClick={jest.fn()} userName="ivan" />)

    expect(screen.getByText('ivan')).toBeInTheDocument()
  })

  it('keeps mobile source selectors and sizing rules stable', () => {
    const stylesheet = getUserProfileTriggerStylesheet()
    const mobileMediaBlock = getMobileMediaBlock(stylesheet)

    expectChevronPseudoElementStructure(stylesheet)
    expect(mobileMediaBlock).toMatch(/\.user-profile-trigger \{[\s\S]*gap: 10px;[\s\S]*\}/)
    expect(mobileMediaBlock).toMatch(
      /\.user-profile-trigger__name \{[\s\S]*display: none;[\s\S]*\}/,
    )
    expect(mobileMediaBlock).toMatch(
      /\.user-profile-trigger__avatar-icon \{[\s\S]*width: 30px;[\s\S]*height: 30px;[\s\S]*\}/,
    )
    expect(mobileMediaBlock).toMatch(
      /\.user-profile-trigger__chevron \{[\s\S]*width: 8px;[\s\S]*height: 4px;[\s\S]*background: url\('\.\.\/\.\.\/\.\.\/\.\.\/image\/chevron\.svg'\) center \/ 8px 4px no-repeat;[\s\S]*color: #000000;[\s\S]*\}/,
    )
    expect(mobileMediaBlock).toMatch(
      /\.user-profile-trigger__chevron::before,\n\s{2}\.user-profile-trigger__chevron::after \{[\s\S]*display: none;[\s\S]*\}/,
    )
    expect(mobileMediaBlock).not.toMatch(
      /\.user-profile-trigger__chevron \{[\s\S]*(border-bottom|border-left|transform):/,
    )
    expect(stylesheet).not.toMatch(/UserProfileTrigger-module__/)
    expect(stylesheet).not.toMatch(/(^|})\s*#[A-Za-z_-]/)
  })
})
