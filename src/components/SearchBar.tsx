"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Clock, Sparkles } from "lucide-react"
import { useSearch } from "../contexts/SearchContext.tsx"
import { useDebounce } from "../hooks/useDebounce.tsx"

const SearchBar: React.FC = () => {
  const { state, setFilters, getSuggestions } = useSearch()
  const [localQuery, setLocalQuery] = useState(state.filters.query)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(localQuery, 200)

  // Update suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      const newSuggestions = getSuggestions(debouncedQuery)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0 && isFocused)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    setSelectedIndex(-1)
  }, [debouncedQuery, getSuggestions, isFocused])

  // Sync with global state
  useEffect(() => {
    setLocalQuery(state.filters.query)
  }, [state.filters.query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    setSelectedIndex(-1)
    setFilters({ query: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = selectedIndex >= 0 ? suggestions[selectedIndex] : localQuery
    executeSearch(query)
  }

  const executeSearch = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim()
      setLocalQuery(trimmedQuery)

      // Set filters and force immediate search
      setFilters({ query: trimmedQuery })

      setShowSuggestions(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    },
    [setFilters],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          executeSearch(suggestions[selectedIndex])
        } else {
          executeSearch(localQuery)
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    executeSearch(suggestion)
  }

  const handleClear = () => {
    setLocalQuery("")
    setFilters({ query: "" })
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div className={`relative transition-all duration-300 ${isFocused ? "scale-105" : "scale-100"}`}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />

          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search movies, actors, directors, genres..."
            className={`w-full bg-gray-800/80 backdrop-blur-md text-white pl-12 pr-12 py-4 rounded-2xl 
              focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:bg-gray-800 
              transition-all duration-300 text-lg border border-gray-700/50
              ${isFocused ? "border-yellow-500/30 shadow-lg shadow-yellow-500/10" : "hover:border-gray-600/50"}
            `}
          />

          <AnimatePresence>
            {localQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white 
                  transition-colors z-10 p-1 rounded-full hover:bg-gray-700/50"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Loading indicator */}
          {state.isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || state.recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md 
              border border-gray-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto">
              {/* Current Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 border-b border-gray-700/50">
                    <Sparkles className="w-3 h-3" />
                    <span>Suggestions</span>
                  </div>

                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 
                        transition-all duration-150 ${
                          index === selectedIndex
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                        }`}
                    >
                      <Search className="w-4 h-4 opacity-50 flex-shrink-0" />
                      <span className="flex-1 truncate">{suggestion}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {state.recentSearches.length > 0 && (
                <div className={`p-2 ${suggestions.length > 0 ? "border-t border-gray-700/50" : ""}`}>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Recent Searches</span>
                  </div>

                  {state.recentSearches.slice(0, 5).map((search, index) => (
                    <motion.button
                      key={search}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 
                        hover:bg-gray-700/50 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      <Clock className="w-3 h-3 opacity-50 flex-shrink-0" />
                      <span className="flex-1 truncate">{search}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar