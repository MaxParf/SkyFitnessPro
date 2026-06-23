import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from './App'
import { mockFetchSuccess } from '../test/fetchMock'

const courseDtoItems = [
  {
    _id: 'ab1c3f',
    description: 'Йога',
    directions: [],
    fitting: [],
    nameEN: 'Yoga',
    nameRU: 'Йога',
    workouts: [],
  },
]

describe('App', () => {
  beforeEach(() => {
    mockFetchSuccess(courseDtoItems)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the app shell', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /Начните заниматься спортом/i })).toBeInTheDocument()
    expect(await screen.findAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
  })
})
