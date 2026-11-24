
/*
 * Project: Fundoo Notes Frontend
 * Module: NoteCard
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Displays an individual note and its pin action.
 */

function NoteCard({ note, onTogglePin }) {
  return (
    <article className={`note-card ${note.pinned ? 'pinned' : ''}`}>
      <div className="note-card-header">
        <h3>{note.title}</h3>

        <button
          type="button"
          className="pin-button"
          onClick={() => onTogglePin(note.id)}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          {note.pinned ? '📌' : '📍'}
        </button>
      </div>

      <p>{note.description}</p>

      <span className="note-date">{note.date}</span>
    </article>
  )
}

export default NoteCard
