import React, { useEffect, useState } from 'react'
import { Grid, Chip } from './components.jsx'
import { getByGenre, year } from './api.js'

export default function Categories({ genres, onOpen }) {
  const [rows, setRows] = useState({})
  const [focused, setFocused] = useState(null) // { id, name }
  const [sort, setSort] = useState('popularity')
  const [grid, setGrid] = useState(null)

  const list = genres?.movie?.length ? genres.movie : []

  useEffect(() => {
    list.forEach((g) => {
      if (rows[g.id]) return
      getByGenre('movie', g.id).then((d) => {
        setRows((prev) => ({ ...prev, [g.id]: (d.results || []).slice(0, 12) }))
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genres])

  useEffect(() => {
    if (!focused) {
      setGrid(null)
      return
    }
    let cancelled = false
    Promise.all([getByGenre('movie', focused.id), getByGenre('tv', focused.id)]).then(([m, t]) => {
      if (cancelled) return
      let combined = [...(m.results || []), ...(t.results || [])].filter((r) => r.poster_path)
      if (sort === 'rating') combined.sort((a, b) => b.vote_average - a.vote_average)
      else if (sort === 'newest') combined.sort((a, b) => (year(b) || '0').localeCompare(year(a) || '0'))
      else combined.sort((a, b) => b.popularity - a.popularity)
      setGrid(combined.slice(0, 30))
    })
    return () => { cancelled = true }
  }, [focused, sort])

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>Categories</h1>
        <p className="screen__sub">{focused ? focused.name : 'Browse everything, one genre at a time'}</p>
      </header>

      {focused ? (
        <>
          <div className="filter-bar">
            <div className="filter-bar__chips">
              <Chip active onClick={() => setFocused(null)}>← All categories</Chip>
            </div>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="popularity">Most popular</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className="screen__content">
            <Grid items={grid} onOpen={onOpen} empty="Loading…" />
          </div>
        </>
      ) : (
        <div className="screen__content">
          {list.map((g) => (
            <div className="row" key={g.id}>
              <button className="row__heading row__heading--link" onClick={() => setFocused({ id: g.id, name: g.name })}>
                {g.name} <span>See all →</span>
              </button>
              <div className="row__scroll">
                {(rows[g.id] || []).map((item) => (
                  <button key={item.id} className="mini-card" onClick={() => onOpen(item)}>
                    {item.poster_path && (
                      <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt="" loading="lazy" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
