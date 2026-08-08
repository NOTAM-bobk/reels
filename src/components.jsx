import React, { useEffect, useState } from 'react'
import { img, title, year, mediaTypeOf, isSaved, toggleSave, formatCount } from './api'

// ---------------- Icons (inline SVG, no deps) ----------------
export const Icon = {
  search: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 22} height={p?.size || 22} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
  ),
  mic: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2.5" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0" /><path d="M12 17.5v3.2M9 20.7h6" /></svg>
  ),
  bookmark: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 20} height={p?.size || 20} fill={p?.filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" strokeLinejoin="round" /></svg>
  ),
  home: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 24} height={p?.size || 24} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11.5 12 4l8 7.5" /><path d="M6 9.8V20h12V9.8" /></svg>
  ),
  diamond: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 22} height={p?.size || 22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4.5 9.5 9 4h6l4.5 5.5L12 21 4.5 9.5Z" /><path d="M4.5 9.5h15M9 4l1.5 5.5L12 21M15 4l-1.5 5.5L12 21" /></svg>
  ),
  compass: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 24} height={p?.size || 24} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-4 2 2-6 4-2Z" strokeLinejoin="round" /></svg>
  ),
  bookmarks: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 24} height={p?.size || 24} fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3.5h9a1 1 0 0 1 1 1V21l-5.5-3.5L5 21V4.5a1 1 0 0 1 1-1Z" strokeLinejoin="round" /></svg>
  ),
  account: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 22} height={p?.size || 22} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8.2" r="3.6" /><path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" /></svg>
  ),
  dice: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 26} height={p?.size || 26} fill="none" stroke="currentColor" strokeWidth="2"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="8.3" cy="8.3" r="1.15" fill="currentColor" stroke="none" /><circle cx="15.7" cy="8.3" r="1.15" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" /><circle cx="8.3" cy="15.7" r="1.15" fill="currentColor" stroke="none" /><circle cx="15.7" cy="15.7" r="1.15" fill="currentColor" stroke="none" /></svg>
  ),
  arrowUpRight: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 16} height={p?.size || 16} fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 22} height={p?.size || 22} fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  chevronL: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 22} height={p?.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
  ),
  chevronR: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 22} height={p?.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 14} height={p?.size || 14} fill="currentColor" stroke="none"><path d="M12 2.8l2.9 6 6.6.8-4.8 4.6 1.2 6.5L12 17.6l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.8L12 2.8Z" /></svg>
  ),
  play: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="currentColor" stroke="none"><path d="M7 4.5v15l13-7.5-13-7.5Z" /></svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" width={p?.size || 18} height={p?.size || 18} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5.5 5.5L20 6" /></svg>
  ),
}

// ---------------- Chip ----------------
export function Chip({ active, onClick, children }) {
  return (
    <button className={`chip${active ? ' chip--active' : ''}`} onClick={onClick} type="button">
      {children}
    </button>
  )
}

// ---------------- Poster Card ----------------
export function Card({ item, onOpen }) {
  const [saved, setSaved] = useState(() => isSaved(item.id, mediaTypeOf(item)))

  useEffect(() => {
    setSaved(isSaved(item.id, mediaTypeOf(item)))
  }, [item])

  const handleSave = (e) => {
    e.stopPropagation()
    toggleSave(item)
    setSaved((s) => !s)
  }

  return (
    <button className="card" onClick={() => onOpen?.(item)} type="button">
      <div className="card__poster-wrap">
        {item.poster_path ? (
          <img className="card__poster" src={img(item.poster_path, 'w342')} alt={title(item)} loading="lazy" />
        ) : (
          <div className="card__poster card__poster--empty">{title(item)}</div>
        )}
        <button className={`card__save${saved ? ' card__save--on' : ''}`} onClick={handleSave} type="button" aria-label="Save">
          <Icon.bookmark size={16} filled={saved} />
        </button>
        {item.vote_average > 0 && (
          <div className="card__rating">
            <Icon.star size={11} /> {item.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <div className="card__title">{title(item)}</div>
      <div className="card__meta">{year(item)} · {mediaTypeOf(item) === 'tv' ? 'Show' : 'Movie'}</div>
    </button>
  )
}

// ---------------- Feature Card (stacked, overlapping — hero-adjacent row) ----------------
export function FeatureCard({ item, onOpen, genreName }) {
  const [saved, setSaved] = useState(() => isSaved(item.id, mediaTypeOf(item)))
  const count = formatCount(item.vote_count)

  const handleSave = (e) => {
    e.stopPropagation()
    toggleSave(item)
    setSaved((s) => !s)
  }

  return (
    <button className="feature-card" onClick={() => onOpen?.(item)} type="button">
      {item.poster_path ? (
        <img className="feature-card__img" src={img(item.poster_path, 'w500')} alt={title(item)} loading="lazy" />
      ) : (
        <div className="feature-card__img feature-card__img--empty" />
      )}
      <div className="feature-card__scrim" />
      {count && (
        <span className="feature-card__badge"><Icon.star size={11} /> {count}</span>
      )}
      <button className={`feature-card__save${saved ? ' feature-card__save--on' : ''}`} onClick={handleSave} type="button" aria-label="Save">
        <Icon.bookmark size={14} filled={saved} />
      </button>
      <div className="feature-card__info">
        <span className="feature-card__tag">{genreName || (mediaTypeOf(item) === 'tv' ? 'Show' : 'Movie')}</span>
        <h3>{title(item)}</h3>
      </div>
      <span className="feature-card__arrow"><Icon.arrowUpRight size={16} /></span>
    </button>
  )
}

export function FeatureRow({ items, onOpen }) {
  if (!items?.length) return null
  return (
    <div className="feature-row">
      {items.map((item) => (
        <FeatureCard item={item} onOpen={onOpen} key={`${item.id}-${mediaTypeOf(item)}`} />
      ))}
    </div>
  )
}


export function Row({ heading, items, onOpen, ranked }) {
  if (!items?.length) return null
  return (
    <section className="row">
      {heading && <h2 className="row__heading">{heading}</h2>}
      <div className="row__scroll">
        {items.map((item, i) => (
          ranked ? (
            <div className="rank-item" key={`${item.id}-${mediaTypeOf(item)}`}>
              <span className="rank-item__num">{i + 1}</span>
              <Card item={item} onOpen={onOpen} />
            </div>
          ) : (
            <Card item={item} onOpen={onOpen} key={`${item.id}-${mediaTypeOf(item)}`} />
          )
        ))}
      </div>
    </section>
  )
}

// ---------------- Grid ----------------
export function Grid({ items, onOpen, empty }) {
  if (!items?.length) return <p className="empty-msg">{empty || 'Nothing here yet.'}</p>
  return (
    <div className="grid">
      {items.map((item) => (
        <Card item={item} onOpen={onOpen} key={`${item.id}-${mediaTypeOf(item)}`} />
      ))}
    </div>
  )
}

// ---------------- Bottom Sheet ----------------
export function BottomSheet({ open, onClose, title: sheetTitle, children }) {
  if (!open) return null
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__header">
          <h2>{sheetTitle}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon.close /></button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  )
}

// ---------------- Detail Modal ----------------
export function DetailModal({ item, onClose }) {
  if (!item) return null
  const [saved, setSaved] = useState(isSaved(item.id, mediaTypeOf(item)))
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="detail" onClick={(e) => e.stopPropagation()}>
        <button className="detail__close" onClick={onClose} aria-label="Close"><Icon.close /></button>
        <div className="detail__backdrop">
          {(item.backdrop_path || item.poster_path) && (
            <img src={img(item.backdrop_path || item.poster_path, 'w780')} alt="" />
          )}
          <div className="detail__gradient" />
        </div>
        <div className="detail__body">
          <h2>{title(item)}</h2>
          <div className="detail__meta">
            {item.vote_average > 0 && <span className="detail__rating"><Icon.star size={13} /> {item.vote_average.toFixed(1)}</span>}
            <span>{year(item)}</span>
            <span className="pill-tag">{mediaTypeOf(item) === 'tv' ? 'Show' : 'Movie'}</span>
          </div>
          <p className="detail__overview">{item.overview || 'No description available.'}</p>
          <button
            className={`btn btn--primary${saved ? ' btn--saved' : ''}`}
            onClick={() => {
              toggleSave(item)
              setSaved((s) => !s)
            }}
          >
            {saved ? (<><Icon.check size={16} /> Saved to Watchlist</>) : (<><Icon.bookmark size={16} /> Save to Watchlist</>)}
          </button>
        </div>
      </div>
    </div>
  )
}
