/*
 * Project: Fundoo Notes Frontend
 * Module: Dashboard Sidebar
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Displays dashboard navigation items without invoking future feature APIs.
 */

function Sidebar({
  activeItem = 'Notes',
  selectedLabelId,
  labels = [],
  labelsLoading = false,
  labelsError = '',
  onNavigate,
  onSelectLabel,
  onManageLabels,
  onRetryLabels,
}) {
  const items = ['Notes', 'Reminders', 'Archive', 'Trash']

  return (
    <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
      <nav>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={item === activeItem && !selectedLabelId ? 'sidebar-item active' : 'sidebar-item'}
            aria-current={item === activeItem ? 'page' : undefined}
            disabled={item === 'Reminders'}
            onClick={() => {
              onNavigate?.(item)
            }}
          >
            <span aria-hidden="true">{item === 'Notes' ? '▣' : '○'}</span>
            {item}
          </button>
        ))}
      </nav>

      <section className="sidebar-label-section" aria-labelledby="sidebar-label-heading">
        <div className="sidebar-label-heading">
          <h2 id="sidebar-label-heading">Labels</h2>
          <button type="button" onClick={onManageLabels} aria-label="Manage labels">
            Manage
          </button>
        </div>
        {labelsLoading && <p className="sidebar-label-message" role="status">Loading labels...</p>}
        {labelsError && (
          <div className="sidebar-label-error" role="alert">
            <span>{labelsError}</span>
            <button type="button" onClick={onRetryLabels}>Retry</button>
          </div>
        )}
        {!labelsLoading && !labelsError && labels.length === 0 && (
          <p className="sidebar-label-message">No labels yet</p>
        )}
        {!labelsLoading && !labelsError && labels.length > 0 && (
          <ul className="sidebar-label-list">
            {labels.map((label) => (
              <li key={label.id}>
                <button
                  type="button"
                  className={selectedLabelId === label.id ? 'sidebar-label active' : 'sidebar-label'}
                  aria-current={selectedLabelId === label.id ? 'page' : undefined}
                  onClick={() => onSelectLabel?.(label)}
                >
                  <span className="sidebar-label-dot" aria-hidden="true">●</span>
                  <span>{label.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}

export default Sidebar
