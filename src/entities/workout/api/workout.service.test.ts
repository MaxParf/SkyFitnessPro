import { createJsonResponse } from '../../../test/fetchMock'
import { loadCourseWorkouts, loadWorkout } from './workout.service'

const workoutDto = {
  _id: 'workout-1',
  exercises: [{ _id: 'exercise-1', name: 'Упражнение 1', quantity: 10 }],
  name: 'Тренировка 1',
  video: 'https://www.youtube.com/embed/video1',
}

describe('workout.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('deduplicates concurrent course workout list requests for the same token and course', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse([workoutDto]))

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(
      Promise.all([
        loadCourseWorkouts('jwt-token', 'course-1'),
        loadCourseWorkouts('jwt-token', 'course-1'),
      ]),
    ).resolves.toEqual([
      [
        expect.objectContaining({
          id: 'workout-1',
          name: 'Тренировка 1',
        }),
      ],
      [
        expect.objectContaining({
          id: 'workout-1',
          name: 'Тренировка 1',
        }),
      ],
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('allows a new course workout list request after the previous one settles', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse([workoutDto]))
      .mockResolvedValueOnce(createJsonResponse([workoutDto]))

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(loadCourseWorkouts('jwt-token', 'course-1')).resolves.toHaveLength(1)
    await expect(loadCourseWorkouts('jwt-token', 'course-1')).resolves.toHaveLength(1)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('deduplicates concurrent single workout requests for the same token and workout', async () => {
    const fetchMock = jest
      .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce(createJsonResponse(workoutDto))

    Object.assign(globalThis, { fetch: fetchMock })

    await expect(
      Promise.all([loadWorkout('jwt-token', 'workout-1'), loadWorkout('jwt-token', 'workout-1')]),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 'workout-1',
        name: 'Тренировка 1',
      }),
      expect.objectContaining({
        id: 'workout-1',
        name: 'Тренировка 1',
      }),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
