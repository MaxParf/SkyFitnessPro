import { render, screen } from '@testing-library/react'

import { UserProfileTrigger } from './UserProfileTrigger'

describe('UserProfileTrigger', () => {
  it('renders username, avatar and chevron', () => {
    const { container } = render(<UserProfileTrigger userName="ivan" />)

    expect(screen.getByRole('button', { name: 'Открыть меню пользователя' })).toBeInTheDocument()
    expect(screen.getByText('ivan')).toBeInTheDocument()
    expect(container.querySelector('.user-profile-trigger__avatar')).toBeInTheDocument()
    expect(container.querySelector('.user-profile-trigger__chevron')).toBeInTheDocument()
  })
})
