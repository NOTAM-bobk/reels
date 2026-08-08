import React, { useEffect, useMemo, useRef, useState } from 'react'
import Watchlist from './Watchlist.jsx'
import Settings from './Settings.jsx'
import Categories from './Categories.jsx'
import { Icon, Chip, Row, FeatureRow, Grid, BottomSheet, DetailModal } from './components.jsx'
import {
  img, title, year, mediaTypeOf,
  getTrending, getTopRatedMovies, getTopRatedTV, getByGenre,
  getPopularMovies, getPopularTV, getNowPlayingMovies,
  getGenres, getProviders, searchMulti, discoverRandom,
} from './api.js'

const DEFAULT_ROWS = [
  { label: 'Action', id: 28 },
  { label: 'Comedy', id: 35 },
  { label: 'Sci-Fi & Fantasy', id: 878 },
  { label: 'Horror', id: 27 },
  { label: 'Documentary', id: 99 },
]

const FEATURE_TABS = [
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
  { id: 'movies', label: 'Movies' },
  { id: 'shows', label: 'TV Shows' },
]

const LENGTHS = [
  { id: '', label: 'Any length' },
  { id: 'short', label: 'Under 90 min' },
  { id: 'medium', label: '90–150 min' },
  { id: 'long', label: '150 min +' },
]

const NAV_ITEMS = [
  { id: 'explore', label: 'Home', icon: 'home' },
  { id: 'categories', label: 'Categories', icon: 'diamond' },
  { id: 'watchlist', label: 'Watchlist', icon: 'bookmarks' },
  { id: 'account', label: 'Account', icon: 'account' },
]

export default function App() {
  const [tab, setTab] = useState('explore')
  const [active, setActive] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [questionerOpen, setQuestionerOpen] = useState(false)
  const [genres, setGenres] = useState({ movie: [], tv: [] })
  const [providers, setProviders] = useState([])

  useEffect(() => {
    getGenres().then(setGenres)
    getProviders().then(setProviders)
  }, [])

  // global search (works across every tab)
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

  const bump = () => setRefreshKey((k) => k + 1)

  return (
    <div className="app">
      <header className="topbar">
        <button className="topbar__avatar" onClick={() => setTab('account')} aria-label="Account">
          <Icon.account size={19} />
        </button>

        <div className="searchbar">
          <Icon.search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & shows"
            aria-label="Search movies and shows"
          />
          {query ? (
            <button className="searchbar__clear" onClick={() => setQuery('')} aria-label="Clear search"><Icon.close size={15} /></button>
          ) : (
            <span className="searchbar__mic"><Icon.mic size={17} /></span>
          )}
        </div>

        <button className="topbar__shuffle" onClick={() => setQuestionerOpen(true)} aria-label="Surprise me — random title generator">
          <Icon.dice size={20} />
        </button>
      </header>

      <main className="app__content">
        {query.trim() ? (
          <div className="screen">
            <div className="screen__content" style={{ paddingTop: 4 }}>
              <h2 className="row__heading">Results for "{query}"</h2>
              <Grid items={searchResults} onOpen={setActive} empty="No titles found. Try another search." />
            </div>
          </div>
        ) : tab === 'explore' ? (
          <Explore onOpen={setActive} />
        ) : tab === 'categories' ? (
          <Categories genres={genres} onOpen={setActive} />
        ) : tab === 'watchlist' ? (
          <Watchlist refreshKey={refreshKey} />
        ) : (
          <Settings onCleared={bump} />
        )}
      </main>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            className={`bottom-nav__item${tab === n.id ? ' bottom-nav__item--active' : ''}`}
            onClick={() => setTab(n.id)}
          >
            <span className="bottom-nav__pill">{Icon[n.icon]({ size: 21 })}</span>
            {tab === n.id && <span>{n.label}</span>}
          </button>
        ))}
      </nav>

      <Questioner
        open={questionerOpen}
        onClose={() => setQuestionerOpen(false)}
        genres={genres}
        providers={providers}
        onOpenDetail={setActive}
      />
      <DetailModal item={active} onClose={() => setActive(null)} />
    </div>
  )
}

// ===================== EXPLORE (Home) =====================
function Explore({ onOpen }) {
  const [trending, setTrending] = useState([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [popularMovies, setPopularMovies] = useState([])
  const [popularTV, setPopularTV] = useState([])
  const [topMovies, setTopMovies] = useState([])
  const [topShows, setTopShows] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [categoryRows, setCategoryRows] = useState({})
  const [featureTab, setFeatureTab] = useState('popular')
  const heroTimer = useRef(null)

  useEffect(() => {
    getTrending().then((d) => setTrending(d.results || []))
    getPopularMovies().then((d) => setPopularMovies((d.results || []).slice(0, 12)))
    getPopularTV().then((d) => setPopularTV((d.results || []).slice(0, 12)))
    getTopRatedMovies().then((d) => setTopMovies((d.results || []).slice(0, 10)))
    getTopRatedTV().then((d) => setTopShows((d.results || []).slice(0, 10)))
    getNowPlayingMovies().then((d) => setNowPlaying((d.results || []).slice(0, 12)))
    DEFAULT_ROWS.forEach((row) => {
      getByGenre('movie', row.id).then((d) => {
        setCategoryRows((prev) => ({ ...prev, [row.id]: (d.results || []).slice(0, 12) }))
      })
    })
  }, [])

  const heroItems = useMemo(() => trending.filter((r) => r.backdrop_path).slice(0, 8), [trending])

  useEffect(() => {
    if (!heroItems.length) return
    heroTimer.current = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroItems.length)
    }, 5000)
    return () => clearInterval(heroTimer.current)
  }, [heroItems.length])

  const featureItems = useMemo(() => {
    if (featureTab === 'trending') return trending.filter((r) => r.poster_path).slice(0, 10)
    if (featureTab === 'movies') return popularMovies
    if (featureTab === 'shows') return popularTV
    // popular: interleave movies + shows
    const out = []
    for (let i = 0; i < 6; i++) {
      if (popularMovies[i]) out.push(popularMovies[i])
      if (popularTV[i]) out.push(popularTV[i])
    }
    return out
  }, [featureTab, trending, popularMovies, popularTV])

  const currentHero = heroItems[heroIndex]

  return (
    <div className="screen">
      {currentHero && (
        <section className="hero">
          <button className="hero__slide" onClick={() => onOpen(currentHero)}>
            <img src={img(currentHero.backdrop_path, 'w1280')} alt={title(currentHero)} />
            <div className="hero__gradient" />
            <div className="hero__info">
              <span className="pill-tag pill-tag--hero">{mediaTypeOf(currentHero) === 'tv' ? 'Show' : 'Movie'} · Trending</span>
              <h1>{title(currentHero)}</h1>
            </div>
          </button>
          <div className="hero__dots">
            {heroItems.map((_, i) => (
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
          {FEATURE_TABS.map((t) => (
            <Chip key={t.id} active={featureTab === t.id} onClick={() => setFeatureTab(t.id)}>{t.label}</Chip>
          ))}
        </div>
      </div>

      <FeatureRow items={featureItems} onOpen={onOpen} />

      <div className="screen__content">
        <Row heading="New Releases" items={nowPlaying} onOpen={onOpen} />
        <Row heading="Top 10 Movies Today" items={topMovies} onOpen={onOpen} ranked />
        <Row heading="Top 10 Shows Today" items={topShows} onOpen={onOpen} ranked />
        {DEFAULT_ROWS.map((row) => (
          <Row key={row.id} heading={row.label} items={categoryRows[row.id]} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

// ===================== QUESTIONER (random title generator) =====================
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
