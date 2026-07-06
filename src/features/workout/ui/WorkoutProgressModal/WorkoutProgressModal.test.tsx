import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import type { ComponentProps } from 'react'

import type { WorkoutExercise } from '@entities/workout/model/workout.types'

import { WorkoutProgressModal } from './WorkoutProgressModal'

type WorkoutProgressModalOnSave = ComponentProps<typeof WorkoutProgressModal>['onSave']

const exercises: WorkoutExercise[] = [
  {
    id: 'exercise-1',
    name: 'Наклоны вперед',
    progressPercent: 0,
    quantity: 15,
  },
  {
    id: 'exercise-2',
    name: 'Наклоны назад',
    progressPercent: 0,
    quantity: 12,
  },
]

function renderWorkoutProgressModal(
  modalExercises: WorkoutExercise[] = exercises,
  onSave = jest.fn<
    ReturnType<WorkoutProgressModalOnSave>,
    Parameters<WorkoutProgressModalOnSave>
  >(),
  onClose = jest.fn(),
) {
  return {
    onClose,
    onSave,
    ...render(
      <WorkoutProgressModal
        exercises={modalExercises}
        initialProgressData={[]}
        onClose={onClose}
        onSave={onSave}
      />,
    ),
  }
}

describe('WorkoutProgressModal', () => {
  it('renders title, dynamic exercise inputs, and save button', () => {
    renderWorkoutProgressModal()

    expect(screen.getByRole('dialog', { name: 'Мой прогресс' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Мой прогресс' })).toBeInTheDocument()
    expect(screen.getByLabelText('Сколько раз вы сделали наклоны вперед?')).toBeInTheDocument()
    expect(screen.getByLabelText('Сколько раз вы сделали наклоны назад?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument()
  })

  it('uses neutral input focus styles without blue glow', () => {
    const stylesheet = readFileSync(
      'src/features/workout/ui/WorkoutProgressModal/WorkoutProgressModal.module.scss',
      'utf8',
    )

    expect(stylesheet).toContain('.workout-progress-modal__input:focus-visible')
    expect(stylesheet).toContain('border-color: #000000')
    expect(stylesheet).toContain('box-shadow: none')
    expect(stylesheet).not.toContain('var(--color-blue-accent)')
  })

  it('renders long exercise label above its input without fixed field height', () => {
    renderWorkoutProgressModal([
      {
        id: 'long-exercise',
        name: 'Сесть на пятки с носками от себя (5 повторений)',
        progressPercent: 0,
        quantity: 5,
      },
    ])
    const stylesheet = readFileSync(
      'src/features/workout/ui/WorkoutProgressModal/WorkoutProgressModal.module.scss',
      'utf8',
    )

    expect(
      screen.getByText('Сколько раз вы сделали сесть на пятки с носками от себя (5 повторений)?'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        'Сколько раз вы сделали сесть на пятки с носками от себя (5 повторений)?',
      ),
    ).toBeInTheDocument()
    expect(stylesheet).not.toMatch(/^\s*height:\s*102px;/m)
    expect(stylesheet).toContain('min-height: 102px')
    expect(stylesheet).toContain('line-height: 20px')
    expect(stylesheet).toMatch(/\.workout-progress-modal__input\s*\{[\s\S]*?margin-top:\s*10px;/)
    expect(stylesheet).not.toMatch(/WorkoutProgressModal-module__/)
    expect(stylesheet).not.toMatch(/#progress-[\w-]+/)
  })

  it('submits entered progress values', async () => {
    const user = userEvent.setup()
    const { onSave } = renderWorkoutProgressModal()

    await user.clear(screen.getByLabelText('Сколько раз вы сделали наклоны вперед?'))
    await user.type(screen.getByLabelText('Сколько раз вы сделали наклоны вперед?'), '3')
    await user.clear(screen.getByLabelText('Сколько раз вы сделали наклоны назад?'))
    await user.type(screen.getByLabelText('Сколько раз вы сделали наклоны назад?'), '6')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(onSave).toHaveBeenCalledWith([
      expect.objectContaining({
        exerciseId: 'exercise-1',
        percent: 20,
        value: 3,
      }),
      expect.objectContaining({
        exerciseId: 'exercise-2',
        percent: 50,
        value: 6,
      }),
    ])
  })

  it('caps calculated percent at 100', async () => {
    const user = userEvent.setup()
    const { onSave } = renderWorkoutProgressModal()

    await user.clear(screen.getByLabelText('Сколько раз вы сделали наклоны вперед?'))
    await user.type(screen.getByLabelText('Сколько раз вы сделали наклоны вперед?'), '150')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          exerciseId: 'exercise-1',
          percent: 100,
        }),
      ]),
    )
  })

  it('renders empty state and disables save when there are no exercises', () => {
    renderWorkoutProgressModal([])

    expect(screen.getByText('Для этой тренировки пока нет упражнений.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled()
  })

  it('closes on Escape and backdrop click', async () => {
    const user = userEvent.setup()
    const { onClose } = renderWorkoutProgressModal()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Закрыть заполнение прогресса' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('keeps modal open and shows inline error when save fails', async () => {
    const user = userEvent.setup()
    const onSave = jest.fn<
      ReturnType<WorkoutProgressModalOnSave>,
      Parameters<WorkoutProgressModalOnSave>
    >()
    onSave.mockRejectedValue(new Error('API error'))

    renderWorkoutProgressModal(exercises, onSave)

    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось сохранить прогресс')
    expect(screen.getByRole('dialog', { name: 'Мой прогресс' })).toBeInTheDocument()
  })
})
