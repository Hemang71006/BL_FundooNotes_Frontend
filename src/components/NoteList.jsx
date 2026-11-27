
import NoteCard from './NoteCard'

/*
 * Project: Fundoo Notes Frontend
 * Module: NoteList
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Renders a collection of notes.
 */

function NoteList({ notes, onOpenNote, onAction, view = 'Notes' }) {
  if (notes.length === 0) {
    return <p className="empty-message">No notes found.</p>
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onOpen={onOpenNote}
          onAction={onAction}
          view={view}
        />
      ))}
    </div>
  )
}

export default NoteList
