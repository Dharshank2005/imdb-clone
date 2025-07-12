"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Clock } from "lucide-react"
import { useSearch } from "../contexts/SearchContext.tsx"
import { useDebounce, useDebouncedCallback } from "../hooks/useDebounce.tsx"

type SearchBarProps = {}

const SearchBar: React.FC<SearchBarProps> = () => {
  const { state, setFilters, search, getSuggestions } = useSearch()
  const [localQuery, setLocalQuery] = useState(state.filters.query)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(localQuery, 300)

  // Debounced search function
  const [debouncedSearch] = useDebouncedCallback(async () => {
    if (
      debouncedQuery.trim() ||
      Object.values(state.filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== "" && v !== 0 && v !== 10))
    ) {
      await search()
    }
  }, 300)

  // Update suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      const newSuggestions = getSuggestions(debouncedQuery)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [debouncedQuery, getSuggestions])

  // Update filters and trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== state.filters.query) {
      setFilters({ query: debouncedQuery })
      debouncedSearch()
    }
  }, [debouncedQuery, state.filters.query, setFilters, debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    setSelectedSuggestionIndex(-1)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion)
    setFilters({ query: suggestion })
    setShowSuggestions(false)
    search()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex])
        } else {
          setShowSuggestions(false)
          search()
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const clearSearch = () => {
    setLocalQuery("")
    setFilters({ query: "" })
    setShowSuggestions(false)
    setSuggestions([])
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={searchInputRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder="Search movies, actors, directors..."
          className="w-full pl-12 pr-20 py-3 bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-4">
          <AnimatePresence>
            {localQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {state.isSearching && (
            <div className="flex items-center pr-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent" />
            </div>
          )}
        </div>

        {state.isSearching && (
          <div className="absolute inset-y-0 right-16 flex items-center pr-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 ${
                    selectedSuggestionIndex === index ? "bg-gray-700/50" : ""
                  }`}
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-white">{suggestion}</span>
                </motion.button>
              ))}
            </div>

            {state.recentSearches.length > 0 && (
              <>
                <div className="border-t border-gray-700" />
                <div className="py-2">
                  <div className="px-4 py-2 text-xs text-gray-400 font-medium flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  {state.recentSearches.slice(0, 3).map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (suggestions.length + index) * 0.05 }}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-gray-300"
                    >
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{search}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar
