
/*
 * Project: Fundoo Notes Frontend
 * Module: SearchBar
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides a reusable search input component.
 */

function SearchBar({ searchQuery, onSearchChange }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search your notes..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search notes"
      />
    </div>
  )
}

export default SearchBar
