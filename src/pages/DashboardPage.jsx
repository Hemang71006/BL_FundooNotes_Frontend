import { useEffect, useState } from 'react'
import NoteList from '../components/NoteList'
import Sidebar from '../components/Sidebar'
import NoteEditor from '../components/NoteEditor'
import NoteModal from '../components/NoteModal'
import LabelManager from '../components/LabelManager'
import {
  archiveNote,
  createNote,
  deleteNote,
  getAllNotes,
  getArchivedNotes,
  getNotesByLabel,
  getTrashedNotes,
  pinNote,
  restoreNote,
  trashNote,
  unarchiveNote,
  unpinNote,
} from '../services/noteService'
import {
  assignLabelToNote,
  createLabel,
  deleteLabel,
  getLabels,
  removeLabelFromNote,
  updateLabel,
} from '../services/labelService'
import { getApiErrorDetails } from '../utils/apiError'

function fetchNotesForView(view, selectedLabel) {
  if (view === 'Archive') return getArchivedNotes()
  if (view === 'Trash') return getTrashedNotes()
  if (view === 'Label' && selectedLabel) return getNotesByLabel(selectedLabel.id)
  return getAllNotes()
}

/*
 * Project: Fundoo Notes Frontend
 * Module: Dashboard Page
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Fetches and displays the authenticated user's active notes.
 */

function DashboardPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [creating, setCreating] = useState(false)
  const [openNoteId, setOpenNoteId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeView, setActiveView] = useState('Notes')
  const [selectedLabel, setSelectedLabel] = useState(null)
  const [labels, setLabels] = useState([])
  const [labelsLoading, setLabelsLoading] = useState(true)
  const [labelsError, setLabelsError] = useState('')
  const [labelsRetryKey, setLabelsRetryKey] = useState(0)
  const [managingLabels, setManagingLabels] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchNotes() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchNotesForView(activeView, selectedLabel)
        if (!cancelled) setNotes(Array.isArray(response.data) ? response.data : [])
      } catch (requestError) {
        if (!cancelled) setError(getApiErrorDetails(requestError).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchNotes()

    return () => {
      cancelled = true
    }
  }, [activeView, retryKey, selectedLabel])

  useEffect(() => {
    let cancelled = false

    async function fetchLabels() {
      setLabelsLoading(true)
      setLabelsError('')

      try {
        const response = await getLabels()
        if (!cancelled) setLabels(Array.isArray(response.data) ? response.data : [])
      } catch (requestError) {
        if (!cancelled) setLabelsError(getApiErrorDetails(requestError).message)
      } finally {
        if (!cancelled) setLabelsLoading(false)
      }
    }

    fetchLabels()

    return () => {
      cancelled = true
    }
  }, [labelsRetryKey])

  useEffect(() => {
    if (!creating) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setCreating(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [creating])

  const handleRetry = () => {
    setRetryKey((current) => current + 1)
  }

  const refreshLabels = async () => {
    setLabelsError('')
    try {
      const response = await getLabels()
      const nextLabels = Array.isArray(response.data) ? response.data : []
      setLabels(nextLabels)
      if (selectedLabel) {
        const refreshedLabel = nextLabels.find((label) => label.id === selectedLabel.id)
        if (refreshedLabel) {
          setSelectedLabel(refreshedLabel)
        } else {
          setSelectedLabel(null)
          setActiveView((view) => view === 'Label' ? 'Notes' : view)
        }
      }
    } catch (requestError) {
      setLabelsError(getApiErrorDetails(requestError).message)
    }
  }

  const refreshNotes = async () => {
    try {
      const response = await fetchNotesForView(activeView, selectedLabel)
      setNotes(Array.isArray(response.data) ? response.data : [])
      setError('')
    } catch (requestError) {
      setError(getApiErrorDetails(requestError).message)
    }
  }

  const handleLabelMutation = async (mutation, ...args) => {
    try {
      await mutation(...args)
      await refreshLabels()
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, {
        cause: requestError,
      })
    }
  }

  const handleNoteLabelAction = async (noteId, labelId, action) => {
    try {
      if (action === 'assign') {
        await assignLabelToNote(noteId, labelId)
      } else {
        await removeLabelFromNote(noteId, labelId)
      }
      await refreshNotes()
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, {
        cause: requestError,
      })
    }
  }

  const handleAction = async (note, actionName) => {
    if (actionName === 'delete' && !window.confirm('Permanently delete this note? This action cannot be undone.')) {
      return
    }

    const actions = {
      pin: pinNote,
      unpin: unpinNote,
      archive: archiveNote,
      unarchive: unarchiveNote,
      trash: trashNote,
      restore: restoreNote,
      delete: deleteNote,
    }

    try {
      await actions[actionName](note.id)
      await refreshNotes()
      const successMessages = {
        pin: 'Note pinned',
        unpin: 'Note unpinned',
        archive: 'Note archived',
        unarchive: 'Note unarchived',
        trash: 'Note moved to trash',
        restore: 'Note restored',
        delete: 'Note permanently deleted',
      }
      setSuccessMessage(successMessages[actionName])
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, {
        cause: requestError,
      })
    }
  }

  const handleCreate = async (noteData) => {
    try {
      await createNote(noteData)
      setCreating(false)
      setSuccessMessage('Note created successfully')
      await refreshNotes()
    } catch (requestError) {
      throw new Error(getApiErrorDetails(requestError).message, {
        cause: requestError,
      })
    }
  }

  const handleUpdated = async () => {
    setSuccessMessage('Note updated successfully')
    await refreshNotes()
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeItem={activeView}
        selectedLabelId={selectedLabel?.id}
        labels={labels}
        labelsLoading={labelsLoading}
        labelsError={labelsError}
        onNavigate={(view) => {
          setSelectedLabel(null)
          setActiveView(view)
        }}
        onSelectLabel={(label) => {
          setSelectedLabel(label)
          setActiveView('Label')
        }}
        onManageLabels={() => setManagingLabels(true)}
        onRetryLabels={() => setLabelsRetryKey((current) => current + 1)}
      />
      <section className="dashboard-content" aria-labelledby="notes-heading">
        <div className="dashboard-heading">
          <div>
            <h1 id="notes-heading">
              {activeView === 'Notes' ? 'Your Notes' : activeView === 'Label' ? selectedLabel?.name : activeView}
            </h1>
            <p>
              {activeView === 'Notes'
                ? 'Keep your thoughts organized in one place.'
                : activeView === 'Archive'
                  ? 'Notes you have archived.'
                  : activeView === 'Trash'
                    ? 'Notes you have moved to trash.'
                    : `Notes with the ${selectedLabel?.name || 'selected'} label.`}
            </p>
          </div>
          {activeView === 'Notes' && (
            <button type="button" className="create-note-button" onClick={() => setCreating(true)}>
              Create note
            </button>
          )}
        </div>

        {successMessage && (
          <p className="dashboard-success" role="status">{successMessage}</p>
        )}

        {loading && (
          <p className="dashboard-status" role="status">Loading your notes...</p>
        )}

        {!loading && error && (
          <div className="dashboard-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>Try again</button>
          </div>
        )}

        {!loading && !error && notes.length === 0 && (
          <div className="dashboard-empty">
            <h2>
              {activeView === 'Notes'
                ? 'No notes yet'
                : activeView === 'Archive'
                  ? 'No archived notes'
                  : activeView === 'Trash'
                    ? 'Trash is empty'
                    : 'No notes with this label'}
            </h2>
            <p>
              {activeView === 'Notes'
                ? 'Your active notes will appear here when you create them.'
                : activeView === 'Archive'
                  ? 'Archived notes will appear here.'
                  : activeView === 'Trash'
                    ? 'Notes moved to trash will appear here.'
                    : 'Notes assigned this label will appear here.'}
            </p>
          </div>
        )}

        {!loading && !error && notes.length > 0 && (
          <NoteList
            notes={notes}
            onOpenNote={setOpenNoteId}
            onAction={handleAction}
            view={activeView}
          />
        )}
      </section>

      {creating && (
        <div className="note-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCreating(false)
        }}>
          <section className="note-modal" role="dialog" aria-modal="true" aria-label="Create note">
            <NoteEditor mode="create" onSave={handleCreate} onCancel={() => setCreating(false)} />
          </section>
        </div>
      )}

      {openNoteId !== null && (
        <NoteModal
          noteId={openNoteId}
          labels={labels}
          labelsLoading={labelsLoading}
          labelsError={labelsError}
          onRetryLabels={() => setLabelsRetryKey((current) => current + 1)}
          onLabelAction={handleNoteLabelAction}
          onClose={() => setOpenNoteId(null)}
          onUpdated={handleUpdated}
        />
      )}
      {managingLabels && (
        <LabelManager
          labels={labels}
          loading={labelsLoading}
          error={labelsError}
          onRetry={() => setLabelsRetryKey((current) => current + 1)}
          onCreate={(labelData) => handleLabelMutation(createLabel, labelData)}
          onUpdate={(labelId, labelData) => handleLabelMutation(updateLabel, labelId, labelData)}
          onDelete={(labelId) => handleLabelMutation(deleteLabel, labelId)}
          onClose={() => setManagingLabels(false)}
        />
      )}
    </div>
  )
}

export default DashboardPage
