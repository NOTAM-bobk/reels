import React from 'react'
import { Icon } from './components'
import { clearWatchlist, getWatchlist } from './api'

export default function Settings({ onCleared }) {
  const count = getWatchlist().length

  const handleClear = () => {
    if (confirm('Clear everything from your watchlist?')) {
      clearWatchlist()
      onCleared?.()
    }
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Account</h1>
        <p className="screen__sub">Your picks, on this device</p>
      </header>

      <div className="screen__content">
        <div className="account-card">
          <div className="account-avatar"><Icon.account size={30} /></div>
          <div>
            <div className="account-name">Guest Explorer</div>
            <div className="account-sub">{count} title{count === 1 ? '' : 's'} saved</div>
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
  )
}
