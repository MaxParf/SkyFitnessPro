import type { CourseDto } from '@shared/api/types/course.dto'

import { loadCourses } from './course.service'
import { createJsonResponse, mockFetchSuccess } from '../../../test/fetchMock'

const courseDtoItems: CourseDto[] = [
  {
    _id: 'ab1c3f',
    description: 'Описание курса',
    directions: [],
    fitting: [],
    nameEN: 'Yoga',
    nameRU: 'Йога',
    workouts: ['17oz5f'],
  },
]

describe('course.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('loads and maps courses from API', async () => {
    const fetchMock = mockFetchSuccess(courseDtoItems)

    await expect(loadCourses()).resolves.toMatchObject([
      {
        id: 'ab1c3f',
        title: 'Йога',
      },
    ])
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/courses',
      {
        body: undefined,
        headers: undefined,
        method: 'GET',
        signal: undefined,
      },
    )
  })

  it('throws when API response is not ok', async () => {
    Object.assign(globalThis, {
      fetch: jest
        .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
        .mockResolvedValue(createJsonResponse(null, 500)),
    })

    await expect(loadCourses()).rejects.toThrow('Fitness API request failed with status 500')
  })
})
