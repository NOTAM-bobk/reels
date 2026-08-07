const API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'b1941699110de014fceb3d15828f4718'
const BASE = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p'

async function tmdb(path, params = {}) {
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`)
  return res.json()
}

export const img = (path, size = 'w500') => (path ? `${IMG}/${size}${path}` : null)

export const title = (item) => item.title || item.name || 'Untitled'
export const year = (item) => (item.release_date || item.first_air_date || '').slice(0, 4)
export const mediaTypeOf = (item) => item.media_type || (item.first_air_date ? 'tv' : 'movie')

export const getTrending = () => tmdb('/trending/all/day')
export const getTopRatedMovies = () => tmdb('/movie/top_rated')
export const getTopRatedTV = () => tmdb('/tv/top_rated')
export const getPopularMovies = (page = 1) => tmdb('/movie/popular', { page })
export const getPopularTV = (page = 1) => tmdb('/tv/popular', { page })
export const searchMulti = (query) => tmdb('/search/multi', { query, include_adult: false })

export const getGenres = async () => {
  const [m, t] = await Promise.all([tmdb('/genre/movie/list'), tmdb('/genre/tv/list')])
  return { movie: m.genres || [], tv: t.genres || [] }
}

export const getByGenre = (type, genreId, page = 1) =>
  tmdb(`/discover/${type}`, { with_genres: genreId, page, sort_by: 'popularity.desc' })

export const getProviders = async () => {
  const data = await tmdb('/watch/providers/movie', { watch_region: 'US' })
  return (data.results || [])
    .filter((p) => p.display_priorities?.US !== undefined || p.display_priority < 40)
    .slice(0, 16)
}

export const discoverRandom = async ({ mediaType, genre, length, provider }) => {
  const type = mediaType === 'tv' ? 'tv' : mediaType === 'movie' ? 'movie' : Math.random() < 0.5 ? 'movie' : 'tv'
  const params = { sort_by: 'popularity.desc', 'vote_count.gte': 40 }
  if (genre) params.with_genres = genre
  if (provider) {
    params.with_watch_providers = provider
    params.watch_region = 'US'
  }
  if (type === 'movie' && length) {
    if (length === 'short') params['with_runtime.lte'] = 90
    if (length === 'medium') {
      params['with_runtime.gte'] = 90
      params['with_runtime.lte'] = 150
    }
    if (length === 'long') params['with_runtime.gte'] = 150
  }
  const first = await tmdb(`/discover/${type}`, { ...params, page: 1 })
  const totalPages = Math.min(first.total_pages || 1, 60)
  const page = totalPages > 1 ? Math.floor(Math.random() * totalPages) + 1 : 1
  const data = page === 1 ? first : await tmdb(`/discover/${type}`, { ...params, page })
  const results = (data.results || []).filter((r) => r.poster_path)
  if (!results.length) return null
  const pick = results[Math.floor(Math.random() * results.length)]
  return { ...pick, media_type: type }
}

// ---- Watchlist (localStorage) ----
const WL_KEY = 'reel_watchlist'

export const getWatchlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WL_KEY) || '[]')
  } catch {
    return []
  }
}

export const isSaved = (id, mediaType) => getWatchlist().some((i) => i.id === id && i.media_type === mediaType)

export const toggleSave = (item) => {
  const list = getWatchlist()
  const type = mediaTypeOf(item)
  const idx = list.findIndex((i) => i.id === item.id && i.media_type === type)
  if (idx >= 0) {
    list.splice(idx, 1)
  } else {
    list.unshift({
      id: item.id,
      media_type: type,
      title: title(item),
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      vote_average: item.vote_average,
      overview: item.overview,
      genre_ids: item.genre_ids || [],
      savedAt: Date.now(),
    })
  }
  localStorage.setItem(WL_KEY, JSON.stringify(list))
  return list
}

export const clearWatchlist = () => localStorage.setItem(WL_KEY, JSON.stringify([]))
