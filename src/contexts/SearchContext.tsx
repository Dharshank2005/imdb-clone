"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useEffect } from "react"
import { MOVIES } from "../data/movies"

interface SearchFilters {
  query: string
  genres: string[]
  yearRange: [number, number]
  ratingRange: [number, number]
  actors: string[]
  sortBy: "relevance" | "rating" | "year" | "title"
  sortOrder: "asc" | "desc"
}

interface SearchResult {
  id: string
  title: string
  rating: number
  image: string
  year: number
  genre: string[]
  director: string
  cast: Array<{ name: string; role: string }>
  relevanceScore?: number
}

interface SearchState {
  filters: SearchFilters
  results: SearchResult[]
  isLoading: boolean
  isSearching: boolean
  totalResults: number
  currentPage: number
  hasMore: boolean
  cache: Record<string, { results: SearchResult[]; timestamp: number; totalResults: number }>
  recentSearches: string[]
  searchHistory: Array<{ query: string; timestamp: number; resultsCount: number }>
  suggestions: string[]
}

type SearchAction =
  | { type: "SET_FILTERS"; payload: Partial<SearchFilters> }
  | { type: "SET_RESULTS"; payload: { results: SearchResult[]; totalResults: number; page: number } }
  | { type: "APPEND_RESULTS"; payload: { results: SearchResult[]; hasMore: boolean } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SEARCHING"; payload: boolean }
  | { type: "CLEAR_RESULTS" }
  | { type: "SET_CACHE"; payload: { key: string; data: { results: SearchResult[]; totalResults: number } } }
  | { type: "ADD_RECENT_SEARCH"; payload: string }
  | { type: "ADD_SEARCH_HISTORY"; payload: { query: string; resultsCount: number } }
  | { type: "SET_SUGGESTIONS"; payload: string[] }
  | { type: "RESET_SEARCH" }

const initialFilters: SearchFilters = {
  query: "",
  genres: [],
  yearRange: [1900, new Date().getFullYear()],
  ratingRange: [0, 10],
  actors: [],
  sortBy: "relevance",
  sortOrder: "desc",
}

const initialState: SearchState = {
  filters: initialFilters,
  results: [],
  isLoading: false,
  isSearching: false,
  totalResults: 0,
  currentPage: 1,
  hasMore: false,
  cache: {},
  recentSearches: [],
  searchHistory: [],
  suggestions: [],
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_RECENT_SEARCHES = 10
const MAX_SEARCH_HISTORY = 50

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      }

    case "SET_RESULTS":
      return {
        ...state,
        results: action.payload.results,
        totalResults: action.payload.totalResults,
        currentPage: action.payload.page,
        hasMore: action.payload.results.length < action.payload.totalResults,
        isLoading: false,
        isSearching: false,
      }

    case "APPEND_RESULTS":
      return {
        ...state,
        results: [...state.results, ...action.payload.results],
        hasMore: action.payload.hasMore,
        currentPage: state.currentPage + 1,
        isLoading: false,
      }

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }

    case "SET_SEARCHING":
      return {
        ...state,
        isSearching: action.payload,
      }

    case "CLEAR_RESULTS":
      return {
        ...state,
        results: [],
        totalResults: 0,
        currentPage: 1,
        hasMore: false,
        isLoading: false,
        isSearching: false,
      }

    case "SET_CACHE":
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: {
            ...action.payload.data,
            timestamp: Date.now(),
          },
        },
      }

    case "ADD_RECENT_SEARCH":
      const newRecentSearches = [action.payload, ...state.recentSearches.filter((s) => s !== action.payload)].slice(
        0,
        MAX_RECENT_SEARCHES,
      )
      return {
        ...state,
        recentSearches: newRecentSearches,
      }

    case "ADD_SEARCH_HISTORY":
      const newHistoryItem = {
        query: action.payload.query,
        timestamp: Date.now(),
        resultsCount: action.payload.resultsCount,
      }
      const newHistory = [newHistoryItem, ...state.searchHistory].slice(0, MAX_SEARCH_HISTORY)
      return {
        ...state,
        searchHistory: newHistory,
      }

    case "SET_SUGGESTIONS":
      return {
        ...state,
        suggestions: action.payload,
      }

    case "RESET_SEARCH":
      return {
        ...state,
        filters: initialFilters,
        results: [],
        totalResults: 0,
        currentPage: 1,
        hasMore: false,
        isLoading: false,
        isSearching: false,
      }

    default:
      return state
  }
}

interface SearchContextType {
  state: SearchState
  setFilters: (filters: Partial<SearchFilters>) => void
  search: (loadMore?: boolean) => Promise<void>
  clearResults: () => void
  resetSearch: () => void
  getSuggestions: (query: string) => string[]
  getCachedResults: (key: string) => { results: SearchResult[]; totalResults: number } | null
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState)

  // Mock API simulation with realistic delays
  const mockApiCall = useCallback(
    async (filters: SearchFilters, page = 1): Promise<{ results: SearchResult[]; totalResults: number }> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200))

      let filteredMovies = [...MOVIES]

      // Apply text search if query exists
      if (filters.query.trim()) {
        const query = filters.query.toLowerCase()
        filteredMovies = filteredMovies.filter(
          (movie) =>
            movie.title.toLowerCase().includes(query) ||
            movie.director.toLowerCase().includes(query) ||
            movie.genre.some((g) => g.toLowerCase().includes(query)) ||
            movie.cast.some((actor) => actor.name.toLowerCase().includes(query)),
        )

        // Calculate relevance score for text searches
        filteredMovies = filteredMovies.map((movie) => ({
          ...movie,
          relevanceScore: calculateRelevanceScore(movie, query),
        }))
      }

      // Apply genre filter
      if (filters.genres.length > 0) {
        filteredMovies = filteredMovies.filter((movie) => filters.genres.some((genre) => movie.genre.includes(genre)))
      }

      // Apply year range filter
      if (filters.yearRange[0] !== 1900 || filters.yearRange[1] !== new Date().getFullYear()) {
        filteredMovies = filteredMovies.filter(
          (movie) => movie.year >= filters.yearRange[0] && movie.year <= filters.yearRange[1],
        )
      }

      // Apply rating range filter
      if (filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 10) {
        filteredMovies = filteredMovies.filter(
          (movie) => movie.rating >= filters.ratingRange[0] && movie.rating <= filters.ratingRange[1],
        )
      }

      // Apply actor filter
      if (filters.actors.length > 0) {
        filteredMovies = filteredMovies.filter((movie) =>
          filters.actors.some((actor) =>
            movie.cast.some((castMember) => castMember.name.toLowerCase().includes(actor.toLowerCase())),
          ),
        )
      }

      // Apply sorting
      filteredMovies.sort((a, b) => {
        let comparison = 0
        switch (filters.sortBy) {
          case "relevance":
            // If no query, sort by rating instead
            if (!filters.query.trim()) {
              comparison = b.rating - a.rating
            } else {
              comparison = (b.relevanceScore || 0) - (a.relevanceScore || 0)
            }
            break
          case "rating":
            comparison = b.rating - a.rating
            break
          case "year":
            comparison = b.year - a.year
            break
          case "title":
            comparison = a.title.localeCompare(b.title)
            break
        }
        return filters.sortOrder === "asc" ? -comparison : comparison
      })

      const totalResults = filteredMovies.length
      const startIndex = (page - 1) * 12
      const endIndex = startIndex + 12
      const paginatedResults = filteredMovies.slice(startIndex, endIndex)

      return {
        results: paginatedResults as SearchResult[],
        totalResults,
      }
    },
    [],
  )

  const calculateRelevanceScore = (movie: any, query: string): number => {
    let score = 0
    const lowerQuery = query.toLowerCase()

    // Title match (highest weight)
    if (movie.title.toLowerCase().includes(lowerQuery)) {
      score += movie.title.toLowerCase().startsWith(lowerQuery) ? 100 : 50
    }

    // Director match
    if (movie.director.toLowerCase().includes(lowerQuery)) {
      score += 30
    }

    // Genre match
    movie.genre.forEach((genre: string) => {
      if (genre.toLowerCase().includes(lowerQuery)) {
        score += 20
      }
    })

    // Cast match
    movie.cast.forEach((actor: any) => {
      if (actor.name.toLowerCase().includes(lowerQuery)) {
        score += 15
      }
    })

    // Boost popular movies
    score += movie.rating * 2

    return score
  }

  const generateCacheKey = (filters: SearchFilters, page: number): string => {
    return JSON.stringify({ ...filters, page })
  }

  const getCachedResults = useCallback(
    (key: string): { results: SearchResult[]; totalResults: number } | null => {
      const cached = state.cache[key]
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { results: cached.results, totalResults: cached.totalResults }
      }
      return null
    },
    [state.cache],
  )

  const setFilters = useCallback((filters: Partial<SearchFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const search = useCallback(
    async (loadMore = false) => {
      const hasFilters =
        state.filters.genres.length > 0 ||
        state.filters.actors.length > 0 ||
        state.filters.yearRange[0] !== 1900 ||
        state.filters.yearRange[1] !== new Date().getFullYear() ||
        state.filters.ratingRange[0] !== 0 ||
        state.filters.ratingRange[1] !== 10

      // Only search if there's a query or active filters
      if (!state.filters.query.trim() && !hasFilters && !loadMore) {
        dispatch({ type: "CLEAR_RESULTS" })
        return
      }

      const page = loadMore ? state.currentPage + 1 : 1
      const cacheKey = generateCacheKey(state.filters, page)

      // Check cache first
      const cachedResult = getCachedResults(cacheKey)
      if (cachedResult && !loadMore) {
        dispatch({
          type: "SET_RESULTS",
          payload: {
            results: cachedResult.results,
            totalResults: cachedResult.totalResults,
            page,
          },
        })
        return
      }

      dispatch({ type: loadMore ? "SET_LOADING" : "SET_SEARCHING", payload: true })

      try {
        const result = await mockApiCall(state.filters, page)

        // Cache the result
        dispatch({
          type: "SET_CACHE",
          payload: {
            key: cacheKey,
            data: result,
          },
        })

        if (loadMore) {
          dispatch({
            type: "APPEND_RESULTS",
            payload: {
              results: result.results,
              hasMore: result.results.length === 12,
            },
          })
        } else {
          dispatch({
            type: "SET_RESULTS",
            payload: {
              results: result.results,
              totalResults: result.totalResults,
              page,
            },
          })

          // Add to search history if there's a query
          if (state.filters.query.trim()) {
            dispatch({
              type: "ADD_RECENT_SEARCH",
              payload: state.filters.query.trim(),
            })
            dispatch({
              type: "ADD_SEARCH_HISTORY",
              payload: {
                query: state.filters.query.trim(),
                resultsCount: result.totalResults,
              },
            })
          }
        }
      } catch (error) {
        console.error("Search failed:", error)
        dispatch({ type: loadMore ? "SET_LOADING" : "SET_SEARCHING", payload: false })
      }
    },
    [state.filters, state.currentPage, getCachedResults, mockApiCall],
  )

  const clearResults = useCallback(() => {
    dispatch({ type: "CLEAR_RESULTS" })
  }, [])

  const resetSearch = useCallback(() => {
    dispatch({ type: "RESET_SEARCH" })
  }, [])

  const getSuggestions = useCallback((query: string): string[] => {
    if (!query.trim()) return []

    const suggestions = new Set<string>()
    const lowerQuery = query.toLowerCase()

    // Movie titles
    MOVIES.forEach((movie) => {
      if (movie.title.toLowerCase().includes(lowerQuery)) {
        suggestions.add(movie.title)
      }
    })

    // Directors
    MOVIES.forEach((movie) => {
      if (movie.director.toLowerCase().includes(lowerQuery)) {
        suggestions.add(movie.director)
      }
    })

    // Actors
    MOVIES.forEach((movie) => {
      movie.cast.forEach((actor) => {
        if (actor.name.toLowerCase().includes(lowerQuery)) {
          suggestions.add(actor.name)
        }
      })
    })

    // Genres
    const allGenres = [...new Set(MOVIES.flatMap((movie) => movie.genre))]
    allGenres.forEach((genre) => {
      if (genre.toLowerCase().includes(lowerQuery)) {
        suggestions.add(genre)
      }
    })

    return Array.from(suggestions).slice(0, 8)
  }, [])

  // Load cached data on mount
  useEffect(() => {
    const savedRecentSearches = localStorage.getItem("moviedb_recent_searches")
    const savedSearchHistory = localStorage.getItem("moviedb_search_history")

    if (savedRecentSearches) {
      try {
        const recentSearches = JSON.parse(savedRecentSearches)
        recentSearches.forEach((search: string) => {
          dispatch({ type: "ADD_RECENT_SEARCH", payload: search })
        })
      } catch (error) {
        console.error("Failed to load recent searches:", error)
      }
    }

    if (savedSearchHistory) {
      try {
        const searchHistory = JSON.parse(savedSearchHistory)
        searchHistory.forEach((item: any) => {
          dispatch({
            type: "ADD_SEARCH_HISTORY",
            payload: { query: item.query, resultsCount: item.resultsCount },
          })
        })
      } catch (error) {
        console.error("Failed to load search history:", error)
      }
    }
  }, [])

  // Save to localStorage when recent searches or history changes
  useEffect(() => {
    localStorage.setItem("moviedb_recent_searches", JSON.stringify(state.recentSearches))
  }, [state.recentSearches])

  useEffect(() => {
    localStorage.setItem("moviedb_search_history", JSON.stringify(state.searchHistory))
  }, [state.searchHistory])

  const contextValue: SearchContextType = {
    state,
    setFilters,
    search,
    clearResults,
    resetSearch,
    getSuggestions,
    getCachedResults,
  }

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>
}

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
