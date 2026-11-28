import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardPage from './DashboardPage'
import {
  archiveNote,
  createNote,
  deleteNote,
  getAllNotes,
  pinNote,
  restoreNote,
  searchNotes,
  trashNote,
  unarchiveNote,
  unpinNote,
} from '../services/noteService'
import { getLabels } from '../services/labelService'

vi.mock('../services/noteService', () => ({
  archiveNote: vi.fn(),
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  getAllNotes: vi.fn(),
  pinNote: vi.fn(),
  restoreNote: vi.fn(),
  searchNotes: vi.fn(),
  trashNote: vi.fn(),
  unarchiveNote: vi.fn(),
  unpinNote: vi.fn(),
}))

vi.mock('../services/labelService', () => ({
  assignLabelToNote: vi.fn(),
  createLabel: vi.fn(),
  deleteLabel: vi.fn(),
  getLabels: vi.fn(),
  removeLabelFromNote: vi.fn(),
  updateLabel: vi.fn(),
}))

vi.mock('../components/NoteModal', () => ({ default: () => <div>note modal</div> }))
vi.mock('../components/LabelManager', () => ({ default: () => <div>label manager</div> }))
vi.mock('../components/RemindersPage', () => ({ default: () => <div>reminders view</div> }))

function createDeferred() {
  let resolve
  const promise = new Promise((res) => { resolve = res })
  return { promise, resolve }
}

const sampleNote = {
  id: 1,
  title: 'Alpha note',
  description: 'Alpha description',
  pinned: false,
  archived: false,
  trashed: false,
}

describe('DashboardPage', () => {
  beforeEach(() => {
    getAllNotes.mockReset().mockResolvedValue({ data: [sampleNote] })
    searchNotes.mockReset().mockResolvedValue({ data: [] })
    getLabels.mockReset().mockResolvedValue({ data: [] })
    createNote.mockReset().mockResolvedValue({ data: sampleNote })
    pinNote.mockReset().mockResolvedValue({ data: sampleNote })
    unpinNote.mockReset().mockResolvedValue({ data: sampleNote })
    archiveNote.mockReset().mockResolvedValue({ data: sampleNote })
    unarchiveNote.mockReset().mockResolvedValue({ data: sampleNote })
    trashNote.mockReset().mockResolvedValue({ data: sampleNote })
    restoreNote.mockReset().mockResolvedValue({ data: sampleNote })
    deleteNote.mockReset().mockResolvedValue({ data: undefined })
  })

  it('loads notes and shows a distinct empty state', async () => {
    getAllNotes.mockResolvedValueOnce({ data: [] })
    render(<DashboardPage />)

    expect(await screen.findByText('No notes yet')).toBeInTheDocument()
    expect(getAllNotes).toHaveBeenCalledTimes(1)
  })

  it('recovers from a failed list request with Try again', async () => {
    getAllNotes
      .mockRejectedValueOnce(new Error('Backend note list failed'))
      .mockResolvedValueOnce({ data: [sampleNote] })
    render(<DashboardPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Backend note list failed')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Alpha note')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('searches through the search endpoint and clears back to all notes', async () => {
    const onClearSearch = vi.fn()
    searchNotes.mockResolvedValue({ data: [{ ...sampleNote, id: 2, title: 'Work note' }] })
    render(<DashboardPage searchQuery="work" onClearSearch={onClearSearch} />)

    expect(await screen.findByText('Work note')).toBeInTheDocument()
    await waitFor(() => {
      expect(searchNotes).toHaveBeenCalledWith('work', 'ACTIVE', undefined)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(onClearSearch).toHaveBeenCalled()
    await waitFor(() => expect(getAllNotes).toHaveBeenCalled())
  })

  it('shows create success only after the refreshed list confirms the new note', async () => {
    getAllNotes
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [{ ...sampleNote, id: 9, title: 'Created note' }] })
    render(<DashboardPage />)

    fireEvent.click(await screen.findByRole('button', { name: 'Create note' }))
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Created note' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Note created successfully')).toBeInTheDocument()
    expect(await screen.findByText('Created note')).toBeInTheDocument()
  })

  it('keeps the editor open with an error when creation fails', async () => {
    createNote.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Backend create failed' } },
    })
    render(<DashboardPage />)

    fireEvent.click(await screen.findByRole('button', { name: 'Create note' }))
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Created note' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Backend create failed')
    expect(screen.getByRole('heading', { name: 'Create note' })).toBeInTheDocument()
  })

  it('shows note-action failures without removing the note', async () => {
    pinNote.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'Backend pin failed' } },
    })
    render(<DashboardPage />)

    fireEvent.click(await screen.findByRole('button', { name: 'Pin note' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Backend pin failed')
    expect(screen.getByText('Alpha note')).toBeInTheDocument()
    expect(screen.queryByText('Note pinned')).not.toBeInTheDocument()
  })

  it('prevents duplicate note actions while the first is in flight', async () => {
    const pending = createDeferred()
    pinNote.mockReturnValueOnce(pending.promise)
    render(<DashboardPage />)

    const pinButton = await screen.findByRole('button', { name: 'Pin note' })
    fireEvent.click(pinButton)
    fireEvent.click(pinButton)

    expect(pinNote).toHaveBeenCalledTimes(1)
    expect(pinButton).toBeDisabled()

    await act(async () => {
      pending.resolve({ data: sampleNote })
      await pending.promise
    })
  })

  it('shows a label loading error and recovers with Retry', async () => {
    getLabels
      .mockRejectedValueOnce(new Error('Backend labels failed'))
      .mockResolvedValueOnce({ data: [{ id: 3, name: 'Personal' }] })
    render(<DashboardPage />)

    expect(await screen.findByText('Backend labels failed')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Personal')).toBeInTheDocument()
  })
})
