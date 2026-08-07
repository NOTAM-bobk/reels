import React, { useMemo, useState } from 'react'
import { Chip, Grid, DetailModal } from './components'
import { getWatchlist } from './api'

export default function Watchlist({ refreshKey }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [active, setActive] = useState(null)

  const items = useMemo(() => getWatchlist(), [refreshKey])

  const filtered = useMemo(() => {
    let list = items
    if (filter === 'movie') list = list.filter((i) => i.media_type === 'movie')
    if (filter === 'tv') list = list.filter((i) => i.media_type === 'tv')
    list = [...list]
    if (sort === 'recent') list.sort((a, b) => b.savedAt - a.savedAt)
    if (sort === 'rating') list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title))
    return list
  }, [items, filter, sort])

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Your Watchlist</h1>
        <p className="screen__sub">{items.length} saved title{items.length === 1 ? '' : 's'}</p>
      </header>

      <div className="filter-bar">
        <div className="filter-bar__chips">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>All</Chip>
          <Chip active={filter === 'movie'} onClick={() => setFilter('movie')}>Movies</Chip>
          <Chip active={filter === 'tv'} onClick={() => setFilter('tv')}>Shows</Chip>
        </div>
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="recent">Recently added</option>
          <option value="rating">Top rated</option>
          <option value="az">A–Z</option>
        </select>
      </div>

      <div className="screen__content">
        <Grid items={filtered} onOpen={setActive} empty="Nothing saved yet — bookmark titles from Explore to see them here." />
      </div>

      <DetailModal item={active} onClose={() => setActive(null)} />
    </div>
  )
}
