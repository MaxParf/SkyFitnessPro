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

  it('loads all course workouts and calculates progress from completed workouts only', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(
        createJsonResponse([
          {
            _id: 'workout-1',
            exercises: [{ _id: 'exercise-1', name: 'Упражнение 1', quantity: 10 }],
            name: 'Тренировка 1',
            video: 'https://www.youtube.com/embed/video1',
          },
          {
            _id: 'workout-2',
            exercises: [
              { _id: 'exercise-2', name: 'Упражнение 2', quantity: 10 },
              { _id: 'exercise-3', name: 'Упражнение 3', quantity: 10 },
              { _id: 'exercise-4', name: 'Упражнение 4', quantity: 10 },
            ],
            name: 'Тренировка 2',
            video: 'https://www.youtube.com/embed/video2',
          },
        ]),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          progressData: [10],
          workoutCompleted: true,
          workoutId: 'workout-1',
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          progressData: [],
          workoutCompleted: false,
          workoutId: 'workout-2',
        }),
      )

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(loadCourseProgressPercent('jwt-token', 'course-1')).resolves.toBe(50)
  })

  it('deduplicates concurrent course progress requests for the same token and course', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(
        createJsonResponse([
          {
            _id: 'workout-1',
            exercises: [{ _id: 'exercise-1', name: 'Упражнение 1', quantity: 10 }],
            name: 'Тренировка 1',
            video: 'https://www.youtube.com/embed/video1',
          },
        ]),
      )
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
        loadCourseProgressPercent('jwt-token', 'course-1'),
        loadCourseProgressPercent('jwt-token', 'course-1'),
      ]),
    ).resolves.toEqual([100, 100])

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/workouts'))).toHaveLength(
      1,
    )
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/progress'))).toHaveLength(
      1,
    )
  })
})
