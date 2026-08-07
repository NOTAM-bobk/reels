# Reel — Movie & Show Finder

A mobile-first, all-in-one movie/show explorer built with React + Vite, styled in a Material You Expressive (M3) look. Powered by the TMDB API.

## Features

- **Explore** — auto-rotating hero carousel (every 5s), genre filter chips, Top 10 Movies/Shows, and category rows like a streaming home screen, plus a live search bar.
- **Surprise Me FAB** — a step-by-step questionnaire (movie or show, genre, length, streaming service) that picks a random title matching your answers.
- **Watchlist** — save titles from anywhere with the bookmark icon, filter by type, sort by recency/rating/A–Z.
- **Account sheet** — top-right button, includes a "clear watchlist" reset.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in Vercel — it auto-detects Vite (build: `vite build`, output: `dist`).
3. Optional: set an environment variable `VITE_TMDB_API_KEY` in the Vercel project settings if you want to use your own TMDB key (a working key is already included as a fallback in `src/api.js`).
4. Deploy.

## Notes

This product uses the TMDB API but is not endorsed or certified by TMDB.
