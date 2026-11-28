
import SearchBar from './SearchBar'

/*
 * Project: Fundoo Notes Frontend
 * Module: Navbar
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Displays the application navigation header.
 */

function Navbar({ authActions, searchQuery = '', onSearchChange, onClearSearch }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">F</span>
        <h2>Fundoo Notes</h2>
      </div>
      <SearchBar
        className="navbar-search"
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onClear={onClearSearch}
      />
      {authActions?.onLogout ? (
        <div className="navbar-auth-actions">
          <button type="button" className="navbar-register" onClick={authActions.onLogout}>
            Log out
          </button>
        </div>
      ) : authActions ? (
        <div className="navbar-auth-actions">
          <button type="button" onClick={authActions.onLogin}>Log in</button>
          <button type="button" className="navbar-register" onClick={authActions.onRegister}>Register</button>
        </div>
      ) : (
        <span className="navbar-tagline">Capture your thoughts</span>
      )}
    </header>
  )
}

export default Navbar
