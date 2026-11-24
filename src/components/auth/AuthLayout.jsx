/*
 * Project: Fundoo Notes Frontend
 * Module: Authentication Layout
 * Author: Hemang
 * Date: 24-11-2026
 * Description: Provides a consistent responsive shell for Fundoo Notes authentication pages.
 */

function AuthLayout({ title, subtitle, children, onNavigate }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <button
          type="button"
          className="auth-brand"
          onClick={() => onNavigate('dashboard')}
          aria-label="Return to Fundoo Notes"
        >
          <span className="auth-logo">F</span>
          <span>Fundoo Notes</span>
        </button>

        <div className="auth-heading">
          <h1 id="auth-title">{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {children}
      </section>
    </main>
  )
}

export default AuthLayout
