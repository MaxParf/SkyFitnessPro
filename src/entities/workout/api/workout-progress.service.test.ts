import { createJsonResponse, mockFetchSuccess } from '../../../test/fetchMock'
import {
  loadCourseProgressPercent,
  loadWorkoutProgress,
  saveWorkoutProgress,
} from './workout-progress.service'

describe('workout-progress.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('loads workout progress with courseId and workoutId query params', async () => {
    const fetchMock = mockFetchSuccess({
      progressData: [20, 0, 0],
      workoutCompleted: false,
      workoutId: 'workout-1',
    })

    await expect(loadWorkoutProgress('jwt-token', 'course-1', 'workout-1')).resolves.toEqual({
      courseId: 'course-1',
      progressData: [20, 0, 0],
      workoutCompleted: false,
      workoutId: 'workout-1',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/progress?courseId=course-1&workoutId=workout-1',
      {
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'GET',
        signal: undefined,
      },
    )
  })

  it('saves numeric progressData to the official workout progress endpoint', async () => {
    const fetchMock = mockFetchSuccess({ message: 'Прогресс сохранён!' })

    await expect(
      saveWorkoutProgress('jwt-token', {
        courseId: 'course-1',
        progressData: [20, 0, 0],
        workoutId: 'workout-1',
      }),
    ).resolves.toEqual({ message: 'Прогресс сохранён!' })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/courses/course-1/workouts/workout-1',
      {
        body: JSON.stringify({ progressData: [20, 0, 0] }),
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'PATCH',
        signal: undefined,
      },
    )
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      progressData: [20, 0, 0],
    })
  })

  it('treats an empty successful PATCH response as a successful save', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValue(createJsonResponse(null))

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(
      saveWorkoutProgress('jwt-token', {
        courseId: 'course-1',
        progressData: [20, 0, 0],
        workoutId: 'workout-1',
      }),
    ).resolves.toEqual({})
  })

  it('loads course progress once and calculates progress from completed workout flags only', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(
        createJsonResponse({
          courseId: 'ab1c3f',
          workoutsProgress: [
            {
              progressData: [10],
              workoutCompleted: true,
              workoutId: '3yvozj',
            },
            {
              progressData: [10],
              workoutCompleted: false,
              workoutId: 'hfgxlo',
            },
          ],
        }),
      )

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(loadCourseProgressPercent('jwt-token', 'ab1c3f')).resolves.toBe(20)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://webdev-hw-api.herokuapp.com/api/fitness/users/me/progress?courseId=ab1c3f',
      {
        headers: { Authorization: 'Bearer jwt-token' },
        method: 'GET',
        signal: undefined,
      },
    )
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/workouts'))).toBe(false)
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('workoutId='))).toBe(false)
  })

  it('deduplicates concurrent course progress requests for the same token and course', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(
        createJsonResponse({
          courseId: 'ab1c3f',
          workoutsProgress: [
            {
              progressData: [10],
              workoutCompleted: true,
              workoutId: '3yvozj',
            },
          ],
        }),
      )

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(
      Promise.all([
        loadCourseProgressPercent('jwt-token', 'course-1'),
        loadCourseProgressPercent('jwt-token', 'course-1'),
      ]),
    ).resolves.toEqual([100, 100])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/workouts'))).toHaveLength(
      0,
    )
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/progress'))).toHaveLength(
      1,
    )
  })

  it('deduplicates concurrent workout progress requests for the same token, course and workout', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(
        createJsonResponse({
          progressData: [10],
          workoutCompleted: true,
          workoutId: 'workout-1',
        }),
      )

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(
      Promise.all([
        loadWorkoutProgress('jwt-token', 'course-1', 'workout-1'),
        loadWorkoutProgress('jwt-token', 'course-1', 'workout-1'),
      ]),
    ).resolves.toEqual([
      {
        courseId: 'course-1',
        progressData: [10],
        workoutCompleted: true,
        workoutId: 'workout-1',
      },
      {
        courseId: 'course-1',
        progressData: [10],
        workoutCompleted: true,
        workoutId: 'workout-1',
      },
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('allows a new workout progress request after the previous one settles', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(
        createJsonResponse({
          progressData: [10],
          workoutCompleted: true,
          workoutId: 'workout-1',
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          progressData: [0],
          workoutCompleted: false,
          workoutId: 'workout-1',
        }),
      )

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(loadWorkoutProgress('jwt-token', 'course-1', 'workout-1')).resolves.toMatchObject({
      progressData: [10],
    })
    await expect(loadWorkoutProgress('jwt-token', 'course-1', 'workout-1')).resolves.toMatchObject({
      progressData: [0],
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
