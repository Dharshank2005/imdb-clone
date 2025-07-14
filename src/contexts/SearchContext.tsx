"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from "react"
import { MOVIES } from "../data/movies"

export interface SearchFilters {
  query: string
  genres: string[]
  yearRange: [number, number]
  ratingRange: [number, number]
  actors: string[]
  sortBy: "relevance" | "rating" | "year" | "title"
  sortOrder: "asc" | "desc"
}

export interface SearchResult {
  title: string
  genre: string[]
  cast: { name: string }[]
  director: string
  year: number
  rating: number
  relevanceScore?: number
}

interface SearchState {
  filters: SearchFilters
  results: SearchResult[]
  total: number
  page: number
  hasMore: boolean
  isLoading: boolean
  recentSearches: string[]
  cache: Map<string, { results: SearchResult[]; total: number; timestamp: number }>
}

type SearchAction =
  | { type: "SET_FILTERS"; payload: Partial<SearchFilters> }
  | { type: "SET_RESULTS"; payload: { results: SearchResult[]; total: number; page: number; append?: boolean } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_RECENT_SEARCH"; payload: string }
  | { type: "CLEAR_RESULTS" }

const INITIAL_FILTERS: SearchFilters = {
  query: "",
  genres: [],
  yearRange: [1900, new Date().getFullYear()],
  ratingRange: [0, 10],
  actors: [],
  sortBy: "relevance",
  sortOrder: "desc",
}

const INITIAL_STATE: SearchState = {
  filters: INITIAL_FILTERS,
  results: [],
  total: 0,
  page: 1,
  hasMore: false,
  isLoading: false,
  recentSearches: [],
  cache: new Map(),
}

const RESULTS_PER_PAGE = 12
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        page: 1,
      }
    case "SET_RESULTS": {
      const { results, total, page, append } = action.payload
      return {
        ...state,
        results: append ? [...state.results, ...results] : results,
        total,
        page,
        hasMore: results.length === RESULTS_PER_PAGE && page * RESULTS_PER_PAGE < total,
        isLoading: false,
      }
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "ADD_RECENT_SEARCH":
      return {
        ...state,
        recentSearches: [action.payload, ...state.recentSearches.filter((s) => s !== action.payload)].slice(0, 10),
      }
    case "CLEAR_RESULTS":
      return { ...state, results: [], total: 0, page: 1, hasMore: false }
    default:
      return state
  }
}

// Enhanced search algorithm with better relevance scoring
function calculateRelevanceScore(movie: any, query: string): number {
  const queryLower = query.toLowerCase()
  const titleLower = movie.title.toLowerCase()
  let score = 0

  // Exact title match gets highest score
  if (titleLower === queryLower) {
    score += 1000
  }
  // Title starts with query
  else if (titleLower.startsWith(queryLower)) {
    score += 800
  }
  // Title contains query
  else if (titleLower.includes(queryLower)) {
    score += 600
  }

  // Check individual words
  const queryWords = queryLower.split(/\s+/).filter(Boolean)
  const titleWords = titleLower.split(/\s+/)

  queryWords.forEach((word) => {
    titleWords.forEach((titleWord) => {
      if (titleWord === word) score += 400
      else if (titleWord.startsWith(word)) score += 200
      else if (titleWord.includes(word)) score += 100
    })
  })

  // Genre matches
  movie.genre.forEach((genre: string) => {
    if (genre.toLowerCase().includes(queryLower)) {
      score += 300
    }
  })

  // Cast matches
  movie.cast.forEach((actor: any) => {
    if (actor.name.toLowerCase().includes(queryLower)) {
      score += 250
    }
  })

  // Director match
  if (movie.director.toLowerCase().includes(queryLower)) {
    score += 200
  }

  // Boost score based on rating (higher rated movies get slight preference)
  score += movie.rating * 10

  // Boost newer movies slightly
  const currentYear = new Date().getFullYear()
  const yearBoost = Math.max(0, (movie.year - (currentYear - 10)) * 2)
  score += yearBoost

  return score
}

function filterAndSearchMovies(filters: SearchFilters): any[] {
  let results = [...MOVIES]

  // Apply filters first
  if (filters.genres.length > 0) {
    results = results.filter((movie) =>
      filters.genres.some((genre) =>
        movie.genre.some((movieGenre: string) => movieGenre.toLowerCase() === genre.toLowerCase()),
      ),
    )
  }

  if (filters.actors.length > 0) {
    results = results.filter((movie) =>
      filters.actors.some((actor) =>
        movie.cast.some((castMember: any) => castMember.name.toLowerCase().includes(actor.toLowerCase())),
      ),
    )
  }

  results = results.filter((movie) => movie.year >= filters.yearRange[0] && movie.year <= filters.yearRange[1])
  results = results.filter((movie) => movie.rating >= filters.ratingRange[0] && movie.rating <= filters.ratingRange[1])

  // Apply search query: filter only matching movies
  const query = filters.query.trim()
  if (query) {
    const qLower = query.toLowerCase()
    results = results.filter((movie) =>
      movie.title.toLowerCase().includes(qLower) ||
      movie.genre.some((g: string) => g.toLowerCase().includes(qLower)) ||
      movie.cast.some((c: any) => c.name.toLowerCase().includes(qLower)) ||
      movie.director.toLowerCase().includes(qLower)
    )
  }

  // Assign relevance scores
  results = results.map((movie) => ({
    ...movie,
    relevanceScore: query ? calculateRelevanceScore(movie, query) : movie.rating * 10,
  }))

  // Sort results
  const sortMultiplier = filters.sortOrder === "asc" ? 1 : -1
  results.sort((a, b) => {
    switch (filters.sortBy) {
      case "rating":
        return (a.rating - b.rating) * sortMultiplier
      case "year":
        return (a.year - b.year) * sortMultiplier
      case "title":
        return a.title.localeCompare(b.title) * sortMultiplier
      case "relevance":
      default:
        return ((b.relevanceScore || 0) - (a.relevanceScore || 0)) * sortMultiplier
    }
  })

  return results
}

interface SearchContextType {
  state: SearchState
  setFilters: (filters: Partial<SearchFilters>) => void
  search: (loadMore?: boolean) => void
  clearResults: () => void
  getSuggestions: (query: string) => string[]
}

const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, INITIAL_STATE)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  const setFilters = useCallback((filters: Partial<SearchFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const clearResults = useCallback(() => {
    dispatch({ type: "CLEAR_RESULTS" })
  }, [])

  const getSuggestions = useCallback((query: string): string[] => {
    if (!query.trim()) return []

    const queryLower = query.toLowerCase()
    const suggestions = new Set<string>()

    MOVIES.forEach((movie) => {
      if (movie.title.toLowerCase().includes(queryLower)) {
        suggestions.add(movie.title)
      }
      movie.genre.forEach((genre) => {
        if (genre.toLowerCase().includes(queryLower)) {
          suggestions.add(genre)
        }
      })
      movie.cast.forEach((actor) => {
        if (actor.name.toLowerCase().includes(queryLower)) {
          suggestions.add(actor.name)
        }
      })
      if (movie.director.toLowerCase().includes(queryLower)) {
        suggestions.add(movie.director)
      }
    })

    return Array.from(suggestions).slice(0, 8)
  }, [])

  const search = useCallback(
    async (loadMore = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      const performSearch = async () => {
        const controller = new AbortController()
        abortControllerRef.current = controller

        try {
          dispatch({ type: "SET_LOADING", payload: true })

          const cacheKey = JSON.stringify(state.filters)
          const cached = state.cache.get(cacheKey)

          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            const page = loadMore ? state.page + 1 : 1
            const startIndex = (page - 1) * RESULTS_PER_PAGE
            const endIndex = startIndex + RESULTS_PER_PAGE
            const pageResults = cached.results.slice(startIndex, endIndex)

            dispatch({
              type: "SET_RESULTS",
              payload: {
                results: pageResults,
                total: cached.total,
                page,
                append: loadMore,
              },
            })
            return
          }

          await new Promise((resolve) => setTimeout(resolve, 300))

          if (controller.signal.aborted) return

          const allResults = filterAndSearchMovies(state.filters)

          const newCache = new Map(state.cache)
          newCache.set(cacheKey, {
            results: allResults,
            total: allResults.length,
            timestamp: Date.now(),
          })

          if (newCache.size > 50) {
            const oldestKey = Array.from(newCache.keys())[0]
            newCache.delete(oldestKey)
          }

          const page = loadMore ? state.page + 1 : 1
          const startIndex = (page - 1) * RESULTS_PER_PAGE
          const endIndex = startIndex + RESULTS_PER_PAGE
          const pageResults = allResults.slice(startIndex, endIndex)

          dispatch({
            type: "SET_RESULTS",
            payload: {
              results: pageResults,
              total: allResults.length,
              page,
              append: loadMore,
            },
          })

          if (state.filters.query.trim()) {
            dispatch({ type: "ADD_RECENT_SEARCH", payload: state.filters.query.trim() })
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error("Search error:", error)
            dispatch({ type: "SET_LOADING", payload: false })
          }
        }
      }

      searchTimeoutRef.current = setTimeout(performSearch, 300)
    },
    [state.filters, state.page, state.cache],
  )

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      const performSearch = async () => {
        try {
          dispatch({ type: "SET_LOADING", payload: true })

          await new Promise((resolve) => setTimeout(resolve, 200))

          const allResults = filterAndSearchMovies(state.filters)

          const page = 1
          const startIndex = 0
          const endIndex = RESULTS_PER_PAGE
          const pageResults = allResults.slice(startIndex, endIndex)

          dispatch({
            type: "SET_RESULTS",
            payload: {
              results: pageResults,
              total: allResults.length,
              page,
              append: false,
            },
          })

          if (state.filters.query.trim()) {
            dispatch({ type: "ADD_RECENT_SEARCH", payload: state.filters.query.trim() })
          }
        } catch (error) {
          console.error("Search error:", error)
          dispatch({ type: "SET_LOADING", payload: false })
        }
      }

      performSearch()
    }, 100)
  }, [state.filters])

  const value: SearchContextType = {
    state,
    setFilters,
    search,
    clearResults,
    getSuggestions,
  }

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
