import { useState } from 'react'
import { useSubmitGuard } from '../hooks/useSubmitGuard'

/*
 * Project: Fundoo Notes Frontend
 * Module: NoteCard
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Displays a note and the actions available in its current view.
 */

function NoteCard({ note, onOpen, onAction, view = 'Notes' }) {
  const guard = useSubmitGuard()
  const [pendingAction, setPendingAction] = useState('')
  const [actionError, setActionError] = useState('')
  const title = note.title?.trim() || 'Untitled note'
  const description = note.description?.trim() || 'No description'
  const isTrashView = view === 'Trash'
  const isArchiveView = view === 'Archive'

  const handleAction = async (event, actionName) => {
    event.stopPropagation()
    if (pendingAction) return

    const requestId = guard.begin()
    if (requestId === null) return

    setPendingAction(actionName)
    setActionError('')

    try {
      await onAction(note, actionName)
    } catch (error) {
      if (!guard.isCurrent(requestId)) return
      setActionError(error.message || 'Unable to update this note.')
    } finally {
      if (guard.isCurrent(requestId)) setPendingAction('')
      guard.end(requestId)
    }
  }

  return (
    <article className={`note-card ${note.pinned ? 'pinned' : ''}`} aria-busy={Boolean(pendingAction)}>
      <button
        type="button"
        className="note-card-content"
        onClick={() => onOpen?.(note.id)}
        disabled={Boolean(pendingAction)}
        aria-label={`Open note ${title}`}
      >
        <span className="note-card-header">
          <span className="note-card-title">{title}</span>
          {note.pinned && <span className="pin-indicator" aria-label="Pinned note">Pinned</span>}
        </span>
        <span className="note-card-description">{description}</span>
      </button>

      <div className="note-card-actions" aria-label={`Actions for ${title}`}>
        {!isTrashView && (
          <button
            type="button"
            onClick={(event) => handleAction(event, note.pinned ? 'unpin' : 'pin')}
            disabled={Boolean(pendingAction)}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            {pendingAction === 'pin' || pendingAction === 'unpin'
              ? 'Saving...'
              : note.pinned ? 'Unpin' : 'Pin'}
          </button>
        )}
        {isTrashView ? (
          <>
            <button
              type="button"
              onClick={(event) => handleAction(event, 'restore')}
              disabled={Boolean(pendingAction)}
              aria-label="Restore note"
            >
              {pendingAction === 'restore' ? 'Restoring...' : 'Restore'}
            </button>
            <button
              type="button"
              className="note-delete-action"
              onClick={(event) => handleAction(event, 'delete')}
              disabled={Boolean(pendingAction)}
              aria-label="Permanently delete note"
            >
              {pendingAction === 'delete' ? 'Deleting...' : 'Delete permanently'}
            </button>
          </>
        ) : isArchiveView ? (
          <>
            <button
              type="button"
              onClick={(event) => handleAction(event, 'unarchive')}
              disabled={Boolean(pendingAction)}
              aria-label="Unarchive note"
            >
              {pendingAction === 'unarchive' ? 'Unarchiving...' : 'Unarchive'}
            </button>
            <button
              type="button"
              onClick={(event) => handleAction(event, 'trash')}
              disabled={Boolean(pendingAction)}
              aria-label="Move note to trash"
            >
              {pendingAction === 'trash' ? 'Moving...' : 'Move to trash'}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={(event) => handleAction(event, 'archive')}
              disabled={Boolean(pendingAction)}
              aria-label="Archive note"
            >
              {pendingAction === 'archive' ? 'Archiving...' : 'Archive'}
            </button>
            <button
              type="button"
              onClick={(event) => handleAction(event, 'trash')}
              disabled={Boolean(pendingAction)}
              aria-label="Move note to trash"
            >
              {pendingAction === 'trash' ? 'Moving...' : 'Move to trash'}
            </button>
          </>
        )}
      </div>
      {actionError && <p className="note-action-error" role="alert">{actionError}</p>}
    </article>
  )
}

export default NoteCard
