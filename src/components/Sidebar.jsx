/*
 * Project: Fundoo Notes Frontend
 * Module: Dashboard Sidebar
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Displays dashboard navigation items without invoking future feature APIs.
 */

function Sidebar({ activeItem = 'Notes', onNavigate }) {
  const items = ['Notes', 'Reminders', 'Archive', 'Trash']

  return (
    <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
      <nav>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={item === activeItem ? 'sidebar-item active' : 'sidebar-item'}
            aria-current={item === activeItem ? 'page' : undefined}
            disabled={item === 'Reminders'}
            onClick={() => onNavigate?.(item)}
          >
            <span aria-hidden="true">{item === 'Notes' ? '▣' : '○'}</span>
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
