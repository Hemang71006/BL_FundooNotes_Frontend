
/*
 * Project: Fundoo Notes Frontend
 * Module: SearchBar
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides a reusable controlled search input with an explicit clear action.
 */

function SearchBar({
  searchQuery = '',
  onSearchChange,
  onClear,
  className = 'search-container',
}) {
  return (
    <div className={className}>
      <input
        type="search"
        placeholder="Search your notes..."
        value={searchQuery}
        onChange={(event) => onSearchChange?.(event.target.value)}
        aria-label="Search notes"
      />
      {searchQuery && (
        <button
          type="button"
          className="search-clear-button"
          onClick={() => onClear?.()}
          aria-label="Clear search"
          title="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SearchBar
