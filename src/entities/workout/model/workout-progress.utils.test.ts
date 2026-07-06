import {
  calculateCourseProgressByCompletedWorkouts,
  calculateCourseProgressPercent,
  calculateExerciseProgressPercent,
  calculateWorkoutProgressPercent,
  isWorkoutFullyCompleted,
} from './workout-progress.utils'

describe('workout-progress.utils', () => {
  it('calculates exercise progress percent from repetitions and quantity', () => {
    expect(
      calculateExerciseProgressPercent({
        difficultyLevel: 1,
        maxValue: 10,
        value: 5,
      }),
    ).toBe(50)
  })

  it('returns 0% when zero of five workouts are complete', () => {
    expect(
      calculateCourseProgressPercent({
        workouts: [
          { exercises: [{ quantity: 10 }], progressData: [5] },
          { exercises: [{ quantity: 10 }] },
          { exercises: [{ quantity: 10 }] },
          { exercises: [{ quantity: 10 }] },
          { exercises: [{ quantity: 10 }] },
        ],
      }),
    ).toBe(0)
  })

  it('returns 20% when one of five workouts is complete', () => {
    expect(
      calculateCourseProgressPercent({
        workouts: [
          { exercises: [{ quantity: 10 }], progressData: [10] },
          { exercises: [{ quantity: 10 }] },
          { exercises: [{ quantity: 10 }] },
          { exercises: [{ quantity: 10 }] },
          { exercises: [{ quantity: 10 }] },
        ],
      }),
    ).toBe(20)
  })

  it('returns 40% when two of five workouts are complete', () => {
    expect(
      calculateCourseProgressPercent({
        workouts: [
          { exercises: [{ quantity: 10 }], progressData: [10] },
          { exercises: [{ quantity: 10 }], progressData: [10] },
          { exercises: [{ quantity: 10 }] },
          { exercises: [{ quantity: 10 }] },
          { exercises: [{ quantity: 10 }] },
        ],
      }),
    ).toBe(40)
  })

  it('returns 100% when five of five workouts are complete', () => {
    expect(
      calculateCourseProgressPercent({
        workouts: [
          { exercises: [{ quantity: 10 }], progressData: [10] },
          { exercises: [{ quantity: 10 }], progressData: [10] },
          { exercises: [{ quantity: 10 }], progressData: [10] },
          { exercises: [{ quantity: 10 }], progressData: [10] },
          { exercises: [{ quantity: 10 }], progressData: [10] },
        ],
      }),
    ).toBe(100)
  })

  it('does not count partial workout progress as completed course progress', () => {
    expect(
      calculateCourseProgressPercent({
        workouts: [
          { exercises: [{ quantity: 10 }, { quantity: 10 }], progressData: [10, 5] },
          { exercises: [{ quantity: 10 }], progressData: [5] },
        ],
      }),
    ).toBe(0)
  })

  it('returns 0% when total workouts count is zero', () => {
    expect(calculateCourseProgressPercent({ workouts: [] })).toBe(0)
  })

  it('calculates course progress from completed workouts count', () => {
    expect(
      calculateCourseProgressByCompletedWorkouts({
        completedWorkoutsCount: 2,
        totalWorkoutsCount: 5,
      }),
    ).toBe(40)
  })

  it('counts missing progress items inside progressData as zero and ignores extra values', () => {
    expect(
      calculateWorkoutProgressPercent({
        exercises: [{ quantity: 10 }, { quantity: 10 }],
        progressData: [10, 10, 10],
      }),
    ).toBe(100)
    expect(
      calculateWorkoutProgressPercent({
        exercises: [{ quantity: 10 }, { quantity: 10 }],
        progressData: [10],
      }),
    ).toBe(50)
  })

  it('returns 100 only when all exercises in all workouts are complete', () => {
    expect(
      calculateCourseProgressPercent({
        workouts: [
          { exercises: [{ quantity: 10 }, { quantity: 5 }], progressData: [10, 5] },
          { exercises: [{ quantity: 20 }], progressData: [20] },
        ],
      }),
    ).toBe(100)
  })

  it('can use API workoutCompleted flag as completed workout data', () => {
    expect(
      isWorkoutFullyCompleted({
        exercises: [{ quantity: 10 }],
        progressData: [],
        workoutCompleted: true,
      }),
    ).toBe(true)
  })
})
