import {
  calculateCourseProgressPercent,
  calculateExerciseProgressPercent,
  calculateWorkoutProgressPercent,
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

  it('calculates 20% for a five-workout course when only one workout is complete', () => {
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

  it('weights course progress by exercise count rather than workout count', () => {
    expect(
      calculateCourseProgressPercent({
        workouts: [
          { exercises: [{ quantity: 10 }], progressData: [10] },
          {
            exercises: [{ quantity: 10 }, { quantity: 10 }, { quantity: 10 }],
            progressData: [0, 0, 0],
          },
        ],
      }),
    ).toBe(25)
  })

  it('counts missing workout progressData as zero', () => {
    expect(
      calculateCourseProgressPercent({
        workouts: [
          { exercises: [{ quantity: 10 }], progressData: [10] },
          { exercises: [{ quantity: 10 }] },
        ],
      }),
    ).toBe(50)
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
})
