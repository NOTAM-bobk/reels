import React, { useEffect, useMemo, useRef, useState } from 'react'
import Watchlist from './Watchlist.jsx'
import Settings from './Settings.jsx'
import { Icon, Chip, Row, Grid, BottomSheet, DetailModal } from './components.jsx'
import {
  img, title, year, mediaTypeOf,
  getTrending, getTopRatedMovies, getTopRatedTV, getByGenre,
  getGenres, getProviders, searchMulti, discoverRandom,
} from './api.js'

const DEFAULT_ROWS = [
  { label: 'Action', id: 28 },
  { label: 'Comedy', id: 35 },
  { label: 'Sci-Fi & Fantasy', id: 878 },
  { label: 'Horror', id: 27 },
  { label: 'Animation', id: 16 },
  { label: 'Documentary', id: 99 },
]

const LENGTHS = [
  { id: '', label: 'Any length' },
  { id: 'short', label: 'Under 90 min' },
  { id: 'medium', label: '90–150 min' },
  { id: 'long', label: '150 min +' },
]

export default function App() {
  const [tab, setTab] = useState('explore')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark">reel</span>
        </div>
        <button className="topbar__account" onClick={() => setSettingsOpen(true)} aria-label="Account">
          <Icon.account />
        </button>
      </header>

      <main className="app__content">
        {tab === 'explore' ? (
          <Explore onOpen={setActive} onSaved={() => setRefreshKey((k) => k + 1)} />
        ) : (
          <Watchlist refreshKey={refreshKey} />
        )}
      </main>

      <nav className="bottom-nav">
        <button className={`bottom-nav__item${tab === 'explore' ? ' bottom-nav__item--active' : ''}`} onClick={() => setTab('explore')}>
          <span className="bottom-nav__pill"><Icon.compass /></span>
          <span>Explore</span>
        </button>
        <button className={`bottom-nav__item${tab === 'watchlist' ? ' bottom-nav__item--active' : ''}`} onClick={() => setTab('watchlist')}>
          <span className="bottom-nav__pill"><Icon.bookmarks /></span>
          <span>Watchlist</span>
        </button>
      </nav>

      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} onCleared={() => setRefreshKey((k) => k + 1)} />
      <DetailModal item={active} onClose={() => setActive(null)} />
    </div>
  )
}

// ===================== EXPLORE =====================
function Explore({ onOpen, onSaved }) {
  const [hero, setHero] = useState([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [topMovies, setTopMovies] = useState([])
  const [topShows, setTopShows] = useState([])
  const [genres, setGenres] = useState({ movie: [], tv: [] })
  const [providers, setProviders] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [sort, setSort] = useState('popularity')
  const [categoryRows, setCategoryRows] = useState({})
  const [filteredGrid, setFilteredGrid] = useState(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [fabOpen, setFabOpen] = useState(false)
  const heroTimer = useRef(null)

  useEffect(() => {
    getTrending().then((d) => setHero((d.results || []).filter((r) => r.backdrop_path).slice(0, 8)))
    getTopRatedMovies().then((d) => setTopMovies((d.results || []).slice(0, 10)))
    getTopRatedTV().then((d) => setTopShows((d.results || []).slice(0, 10)))
    getGenres().then(setGenres)
    getProviders().then(setProviders)
    DEFAULT_ROWS.forEach((row) => {
      getByGenre('movie', row.id).then((d) => {
        setCategoryRows((prev) => ({ ...prev, [row.id]: (d.results || []).slice(0, 12) }))
      })
    })
  }, [])

  // Hero auto-rotate every 5s
  useEffect(() => {
    if (!hero.length) return
    heroTimer.current = setInterval(() => {
      setHeroIndex((i) => (i + 1) % hero.length)
    }, 5000)
    return () => clearInterval(heroTimer.current)
  }, [hero.length])

  // genre filter grid
  useEffect(() => {
    if (!selectedGenre) {
      setFilteredGrid(null)
      return
    }
    let cancelled = false
    Promise.all([getByGenre('movie', selectedGenre), getByGenre('tv', selectedGenre)]).then(([m, t]) => {
      if (cancelled) return
      let combined = [...(m.results || []), ...(t.results || [])].filter((r) => r.poster_path)
      if (sort === 'rating') combined.sort((a, b) => b.vote_average - a.vote_average)
      else if (sort === 'newest') combined.sort((a, b) => (year(b) || '0').localeCompare(year(a) || '0'))
      else combined.sort((a, b) => b.popularity - a.popularity)
      setFilteredGrid(combined.slice(0, 24))
    })
    return () => { cancelled = true }
  }, [selectedGenre, sort])

  // search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    const t = setTimeout(() => {
      searchMulti(query.trim()).then((d) => {
        setSearchResults((d.results || []).filter((r) => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path))
      })
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  const allGenres = useMemo(() => {
    const map = new Map()
    ;[...genres.movie, ...genres.tv].forEach((g) => map.set(g.id, g.name))
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [genres])

  const currentHero = hero[heroIndex]

  return (
    <div className="screen">
      <div className="searchbar">
        <Icon.search size={19} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies & shows"
          aria-label="Search movies and shows"
        />
        {query && (
          <button className="searchbar__clear" onClick={() => setQuery('')} aria-label="Clear search"><Icon.close size={16} /></button>
        )}
      </div>

      {searchResults ? (
        <div className="screen__content">
          <h2 className="row__heading">Results for "{query}"</h2>
          <Grid items={searchResults} onOpen={onOpen} empty="No titles found. Try another search." />
        </div>
      ) : (
        <>
          {currentHero && (
            <section className="hero">
              <button className="hero__slide" onClick={() => onOpen(currentHero)}>
                <img src={img(currentHero.backdrop_path, 'w1280')} alt={title(currentHero)} />
                <div className="hero__gradient" />
                <div className="hero__info">
                  <span className="pill-tag pill-tag--hero">{mediaTypeOf(currentHero) === 'tv' ? 'Show' : 'Movie'} · Trending</span>
                  <h1>{title(currentHero)}</h1>
                  <p>{(currentHero.overview || '').slice(0, 110)}{currentHero.overview?.length > 110 ? '…' : ''}</p>
                  <span className="btn btn--hero"><Icon.play size={15} /> View details</span>
                </div>
              </button>
              <div className="hero__dots">
                {hero.map((_, i) => (
                  <button
                    key={i}
                    className={`hero__dot${i === heroIndex ? ' hero__dot--active' : ''}`}
                    onClick={() => setHeroIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="filter-bar">
            <div className="filter-bar__chips">
              <Chip active={!selectedGenre} onClick={() => setSelectedGenre(null)}>All</Chip>
              {allGenres.slice(0, 12).map((g) => (
                <Chip key={g.id} active={selectedGenre === g.id} onClick={() => setSelectedGenre(g.id)}>{g.name}</Chip>
              ))}
            </div>
            {selectedGenre && (
              <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                <option value="popularity">Most popular</option>
                <option value="rating">Top rated</option>
                <option value="newest">Newest</option>
              </select>
            )}
          </div>

          <div className="screen__content">
            {filteredGrid ? (
              <Grid items={filteredGrid} onOpen={onOpen} empty="No titles matched this filter." />
            ) : (
              <>
                <Row heading="Top 10 Movies Today" items={topMovies} onOpen={onOpen} ranked />
                <Row heading="Top 10 Shows Today" items={topShows} onOpen={onOpen} ranked />
                {DEFAULT_ROWS.map((row) => (
                  <Row key={row.id} heading={row.label} items={categoryRows[row.id]} onOpen={onOpen} />
                ))}
              </>
            )}
          </div>
        </>
      )}

      <button className="fab" onClick={() => setFabOpen(true)} aria-label="Surprise me">
        <Icon.dice />
      </button>

      <Questioner
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        genres={genres}
        providers={providers}
        onOpenDetail={onOpen}
      />
    </div>
  )
}

// ===================== QUESTIONER (FAB flow) =====================
function Questioner({ open, onClose, genres, providers, onOpenDetail }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ mediaType: '', genre: '', length: '', provider: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [noMatch, setNoMatch] = useState(false)

  const reset = () => {
    setStep(0)
    setAnswers({ mediaType: '', genre: '', length: '', provider: '' })
    setResult(null)
    setNoMatch(false)
  }

  const close = () => {
    onClose()
    setTimeout(reset, 300)
  }

  const genreOptions = answers.mediaType === 'tv' ? genres.tv : answers.mediaType === 'movie' ? genres.movie : genres.movie

  const runSearch = async () => {
    setLoading(true)
    setNoMatch(false)
    setResult(null)
    try {
      const pick = await discoverRandom(answers)
      if (!pick) setNoMatch(true)
      else setResult(pick)
    } catch {
      setNoMatch(true)
    } finally {
      setLoading(false)
      setStep(4)
    }
  }

  const steps = ['Movie or show?', 'Pick a genre', 'How long?', 'Any streaming service?']

  return (
    <BottomSheet open={open} onClose={close} title={step < 4 ? 'Find me something' : 'Your pick'}>
      {step < 4 && (
        <div className="questioner__progress">
          {steps.map((_, i) => (
            <span key={i} className={`questioner__dot${i <= step ? ' questioner__dot--on' : ''}`} />
          ))}
        </div>
      )}

      {step === 0 && (
        <div className="qstep">
          <p className="qstep__label">{steps[0]}</p>
          <div className="qstep__options">
            {[{ id: '', l: 'Surprise me with either' }, { id: 'movie', l: 'Movie' }, { id: 'tv', l: 'Show' }].map((o) => (
              <button key={o.id} className={`option-tile${answers.mediaType === o.id ? ' option-tile--active' : ''}`} onClick={() => { setAnswers((a) => ({ ...a, mediaType: o.id })); setStep(1) }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="qstep">
          <p className="qstep__label">{steps[1]}</p>
          <div className="qstep__chipgrid">
            <button className={`option-tile option-tile--sm${answers.genre === '' ? ' option-tile--active' : ''}`} onClick={() => { setAnswers((a) => ({ ...a, genre: '' })); setStep(2) }}>Any genre</button>
            {genreOptions.map((g) => (
              <button key={g.id} className={`option-tile option-tile--sm${answers.genre === g.id ? ' option-tile--active' : ''}`} onClick={() => { setAnswers((a) => ({ ...a, genre: g.id })); setStep(2) }}>{g.name}</button>
            ))}
          </div>
          <button className="btn btn--text" onClick={() => setStep(0)}><Icon.chevronL size={16} /> Back</button>
        </div>
      )}

      {step === 2 && (
        <div className="qstep">
          <p className="qstep__label">{steps[2]}</p>
          <div className="qstep__options">
            {LENGTHS.map((l) => (
              <button key={l.id} className={`option-tile${answers.length === l.id ? ' option-tile--active' : ''}`} onClick={() => { setAnswers((a) => ({ ...a, length: l.id })); setStep(3) }}>{l.label}</button>
            ))}
          </div>
          <button className="btn btn--text" onClick={() => setStep(1)}><Icon.chevronL size={16} /> Back</button>
        </div>
      )}

      {step === 3 && (
        <div className="qstep">
          <p className="qstep__label">{steps[3]}</p>
          <div className="qstep__chipgrid">
            <button className={`option-tile option-tile--sm${answers.provider === '' ? ' option-tile--active' : ''}`} onClick={() => setAnswers((a) => ({ ...a, provider: '' }))}>Any service</button>
            {providers.map((p) => (
              <button key={p.provider_id} className={`option-tile option-tile--sm${answers.provider === p.provider_id ? ' option-tile--active' : ''}`} onClick={() => setAnswers((a) => ({ ...a, provider: p.provider_id }))}>{p.provider_name}</button>
            ))}
          </div>
          <div className="qstep__actions">
            <button className="btn btn--text" onClick={() => setStep(2)}><Icon.chevronL size={16} /> Back</button>
            <button className="btn btn--primary" onClick={runSearch}><Icon.dice size={18} /> Find my title</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="qresult">
          {loading && <p className="qstep__label">Rolling the dice…</p>}
          {!loading && noMatch && (
            <>
              <p className="qstep__label">No matches for that combo — try loosening a filter.</p>
              <button className="btn btn--primary" onClick={reset}>Start over</button>
            </>
          )}
          {!loading && result && (
            <>
              <button className="qresult__card" onClick={() => onOpenDetail(result)}>
                {result.poster_path && <img src={img(result.poster_path, 'w342')} alt={title(result)} />}
                <div>
                  <h3>{title(result)}</h3>
                  <p>{year(result)} · {mediaTypeOf(result) === 'tv' ? 'Show' : 'Movie'}</p>
                  <p className="qresult__overview">{(result.overview || '').slice(0, 130)}{result.overview?.length > 130 ? '…' : ''}</p>
                </div>
              </button>
              <div className="qstep__actions">
                <button className="btn btn--text" onClick={runSearch}><Icon.dice size={16} /> Try again</button>
                <button className="btn btn--primary" onClick={close}>Done</button>
              </div>
            </>
          )}
        </div>
      )}
    </BottomSheet>
  )
}
