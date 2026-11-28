import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NoteModal from './NoteModal'
import { getNoteById, updateNote } from '../services/noteService'
import {
  cancelReminder,
  completeReminder,
  createReminder,
  deleteReminder,
  getNoteReminders,
  updateReminder,
} from '../services/reminderService'

vi.mock('../services/noteService', () => ({
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
}))

vi.mock('../services/reminderService', () => ({
  cancelReminder: vi.fn(),
  completeReminder: vi.fn(),
  createReminder: vi.fn(),
  deleteReminder: vi.fn(),
  getNoteReminders: vi.fn(),
  updateReminder: vi.fn(),
}))

const note = {
  id: 1,
  title: 'Detail note',
  description: 'Detail description',
  trashed: false,
}

function createDeferred() {
  let resolve
  const promise = new Promise((res) => { resolve = res })
  return { promise, resolve }
}

describe('NoteModal', () => {
  beforeEach(() => {
    getNoteById.mockReset().mockResolvedValue({ data: note })
    updateNote.mockReset().mockResolvedValue({ data: note })
    getNoteReminders.mockReset().mockResolvedValue({ data: [] })
    createReminder.mockReset().mockResolvedValue({ data: 'Reminder request accepted for processing' })
    updateReminder.mockReset().mockResolvedValue({ data: {} })
    cancelReminder.mockReset().mockResolvedValue({ data: {} })
    completeReminder.mockReset().mockResolvedValue({ data: {} })
    deleteReminder.mockReset().mockResolvedValue({ data: undefined })
  })

  const renderModal = (onLabelAction = vi.fn()) => render(
    <NoteModal
      noteId={1}
      labels={[{ id: 5, name: 'Work' }]}
      labelsLoading={false}
      labelsError=""
      onRetryLabels={vi.fn()}
      onLabelAction={onLabelAction}
      onClose={vi.fn()}
      onUpdated={vi.fn()}
      onReminderChanged={vi.fn()}
    />,
  )

  it('retries a failed note fetch', async () => {
    getNoteById
      .mockRejectedValueOnce(new Error('Backend note failed'))
      .mockResolvedValueOnce({ data: note })
    renderModal()

    expect(await screen.findByText('Backend note failed')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry note' }))

    expect(await screen.findByText('Detail note')).toBeInTheDocument()
  })

  it('does not claim label success when the refreshed notes request fails', async () => {
    const onLabelAction = vi.fn().mockResolvedValueOnce(false)
    renderModal(onLabelAction)

    fireEvent.change(await screen.findByLabelText('Choose a label'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Assign label' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Label updated, but the latest notes')
    expect(screen.queryByText('Label assigned')).not.toBeInTheDocument()
    expect(onLabelAction).toHaveBeenCalledWith(1, 5, 'assign')
  })

  it('blocks duplicate label requests while one is in flight', async () => {
    const pending = createDeferred()
    const onLabelAction = vi.fn().mockReturnValueOnce(pending.promise)
    renderModal(onLabelAction)

    fireEvent.change(await screen.findByLabelText('Choose a label'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Assign label' }))
    fireEvent.click(screen.getByRole('button', { name: 'Adding...' }))

    expect(onLabelAction).toHaveBeenCalledTimes(1)

    await act(async () => {
      pending.resolve(true)
      await pending.promise
    })

    expect(await screen.findByText('Label assigned')).toBeInTheDocument()
  })

  it('reports reminder creation as accepted for processing, not delivered', async () => {
    renderModal()

    fireEvent.click(await screen.findByRole('button', { name: 'Set reminder' }))
    fireEvent.change(await screen.findByLabelText('Date'), { target: { value: '2999-01-01' } })
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '10:30' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Set reminder' })[1])

    expect(await screen.findByRole('status')).toHaveTextContent('Reminder request accepted for processing')
    expect(screen.queryByText('Reminder scheduled')).not.toBeInTheDocument()
  })
})
