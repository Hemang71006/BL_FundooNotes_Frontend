
/*
 * Project: Fundoo Notes Frontend
 * Module: NoteCard
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Displays an individual note and its pinned status.
 */

function NoteCard({ note }) {
  const title = note.title?.trim() || 'Untitled note'
  const description = note.description?.trim() || 'No description'

  return (
    <article className={`note-card ${note.pinned ? 'pinned' : ''}`}>
      <div className="note-card-header">
        <h3>{title}</h3>
        {note.pinned && <span className="pin-indicator" title="Pinned note" aria-label="Pinned note">Pinned</span>}
      </div>

      <p>{description}</p>
    </article>
  )
}

export default NoteCard
