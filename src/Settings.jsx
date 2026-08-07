import React from 'react'
import { Icon } from './components'
import { clearWatchlist } from './api'

export default function Settings({ open, onClose, onCleared }) {
  if (!open) return null

  const handleClear = () => {
    if (confirm('Clear everything from your watchlist?')) {
      clearWatchlist()
      onCleared?.()
    }
  }

  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet sheet--settings" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__header">
          <h2>Account</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon.close /></button>
        </div>

        <div className="sheet__body">
          <div className="account-card">
            <div className="account-avatar"><Icon.account size={30} /></div>
            <div>
              <div className="account-name">Guest Explorer</div>
              <div className="account-sub">Your picks are saved on this device</div>
            </div>
          </div>

          <div className="settings-list">
            <div className="settings-row">
              <span>App version</span>
              <span className="settings-row__value">1.0.0</span>
            </div>
            <button className="settings-row settings-row--action" onClick={handleClear}>
              <span>Clear watchlist</span>
              <span className="settings-row__value">Reset</span>
            </button>
          </div>

          <p className="attribution">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </div>
  )
}
