import { addUserCourse, loadUserProfile, removeUserCourse } from './user-course.service'
import { mockFetchSuccess } from '../../../test/fetchMock'

describe('user-course.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('loads user profile with bearer token', async () => {
    const fetchMock = mockFetchSuccess({
      email: 'ivan@example.com',
      selectedCourses: ['ab1c3f'],
    })

    await expect(loadUserProfile('jwt-token')).resolves.toEqual({
      email: 'ivan@example.com',
      selectedCourses: ['ab1c3f'],
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/users/me',
      {
        body: undefined,
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'GET',
        signal: undefined,
      },
    )
  })

  it('adds user course with bearer token', async () => {
    const fetchMock = mockFetchSuccess({ message: 'Курс успешно добавлен!' })

    await expect(addUserCourse('jwt-token', 'ab1c3f')).resolves.toEqual({
      message: 'Курс успешно добавлен!',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/courses',
      {
        body: JSON.stringify({ courseId: 'ab1c3f' }),
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'POST',
        signal: undefined,
      },
    )
  })

  it('removes user course with bearer token', async () => {
    const fetchMock = mockFetchSuccess({ message: 'Курс успешно удален!' })

    await expect(removeUserCourse('jwt-token', 'ab1c3f')).resolves.toEqual({
      message: 'Курс успешно удален!',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/courses/ab1c3f',
      {
        body: undefined,
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'DELETE',
        signal: undefined,
      },
    )
  })
})
