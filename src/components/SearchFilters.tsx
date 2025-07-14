"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Star, Users, SlidersHorizontal, Filter, ArrowUpDown, Check, RotateCcw } from "lucide-react"
import { useSearch } from "../contexts/SearchContext.tsx"
import { GENRES, ACTORS } from "../data/movies.js"

interface SearchFiltersProps {
  isOpen: boolean
  onClose: () => void
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ isOpen, onClose }) => {
  const { state, setFilters } = useSearch()
  const [localFilters, setLocalFilters] = useState(state.filters)

  // Sync with global state
  useEffect(() => {
    setLocalFilters(state.filters)
  }, [state.filters])

  const toggleGenre = (genre: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter((g) => g !== genre) : [...prev.genres, genre],
    }))
  }

  const toggleActor = (actor: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      actors: prev.actors.includes(actor) ? prev.actors.filter((a) => a !== actor) : [...prev.actors, actor],
    }))
  }

  const updateYearRange = (index: 0 | 1, value: number) => {
    setLocalFilters((prev) => {
      const newRange: [number, number] = [...prev.yearRange]
      newRange[index] = value

      // Ensure min <= max
      if (newRange[0] > newRange[1]) {
        if (index === 0) newRange[1] = newRange[0]
        else newRange[0] = newRange[1]
      }

      return { ...prev, yearRange: newRange }
    })
  }

  const updateRatingRange = (index: 0 | 1, value: number) => {
    setLocalFilters((prev) => {
      const newRange: [number, number] = [...prev.ratingRange]
      newRange[index] = value

      // Ensure min <= max
      if (newRange[0] > newRange[1]) {
        if (index === 0) newRange[1] = newRange[0]
        else newRange[0] = newRange[1]
      }

      return { ...prev, ratingRange: newRange }
    })
  }

  const updateSort = (sortBy: typeof localFilters.sortBy, sortOrder: typeof localFilters.sortOrder) => {
    setLocalFilters((prev) => ({ ...prev, sortBy, sortOrder }))
  }

  const applyFilters = () => {
    setFilters(localFilters)
    onClose()
  }

  const resetFilters = () => {
    const resetFilters = {
      genres: [],
      actors: [],
      yearRange: [1900, new Date().getFullYear()] as [number, number],
      ratingRange: [0, 10] as [number, number],
      sortBy: "relevance" as const,
      sortOrder: "desc" as const,
    }
    setLocalFilters((prev) => ({ ...prev, ...resetFilters }))
    setFilters(resetFilters)
  }

  const hasActiveFilters =
    localFilters.genres.length > 0 ||
    localFilters.actors.length > 0 ||
    localFilters.yearRange[0] !== 1900 ||
    localFilters.yearRange[1] !== new Date().getFullYear() ||
    localFilters.ratingRange[0] !== 0 ||
    localFilters.ratingRange[1] !== 10

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900/95 backdrop-blur-md 
              border-l border-gray-700/50 z-50 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <SlidersHorizontal className="w-5 h-5 text-yellow-500" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                      {localFilters.genres.length + localFilters.actors.length}
                    </span>
                  )}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Sort Options */}
              <section>
                <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
                  <ArrowUpDown className="w-4 h-4 text-yellow-500" />
                  Sort By
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "relevance", label: "Relevance" },
                    { key: "rating", label: "Rating" },
                    { key: "year", label: "Year" },
                    { key: "title", label: "Title" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => updateSort(key as any, localFilters.sortOrder)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        localFilters.sortBy === key
                          ? "bg-yellow-500 text-black font-medium"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  {["asc", "desc"].map((order) => (
                    <button
                      key={order}
                      onClick={() => updateSort(localFilters.sortBy, order as any)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                        localFilters.sortOrder === order
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {order === "asc" ? "Ascending" : "Descending"}
                    </button>
                  ))}
                </div>
              </section>

              {/* Genres */}
              <section>
                <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
                  <Filter className="w-4 h-4 text-yellow-500" />
                  Genres
                  {localFilters.genres.length > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                      {localFilters.genres.length}
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {GENRES.map((genre) => (
                    <motion.button
                      key={genre}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        localFilters.genres.includes(genre)
                          ? "bg-yellow-500 text-black font-medium"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {localFilters.genres.includes(genre) && <Check className="w-3 h-3" />}
                      {genre}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Actors */}
              <section>
                <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
                  <Users className="w-4 h-4 text-yellow-500" />
                  Actors
                  {localFilters.actors.length > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                      {localFilters.actors.length}
                    </span>
                  )}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ACTORS.map((actor) => (
                    <motion.button
                      key={actor}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleActor(actor)}
                      className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all flex items-center gap-2 ${
                        localFilters.actors.includes(actor)
                          ? "bg-yellow-500 text-black font-medium"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {localFilters.actors.includes(actor) && <Check className="w-3 h-3 flex-shrink-0" />}
                      <span className="truncate">{actor}</span>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Year Range */}
              <section>
                <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  Release Year
                  <span className="ml-auto text-yellow-400 text-sm">
                    {localFilters.yearRange[0]} - {localFilters.yearRange[1]}
                  </span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">From</label>
                    <input
                      type="range"
                      min={1900}
                      max={new Date().getFullYear()}
                      value={localFilters.yearRange[0]}
                      onChange={(e) => updateYearRange(0, Number.parseInt(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">To</label>
                    <input
                      type="range"
                      min={1900}
                      max={new Date().getFullYear()}
                      value={localFilters.yearRange[1]}
                      onChange={(e) => updateYearRange(1, Number.parseInt(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                </div>
              </section>

              {/* Rating Range */}
              <section>
                <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Rating
                  <span className="ml-auto text-yellow-400 text-sm">
                    {localFilters.ratingRange[0]} - {localFilters.ratingRange[1]}
                  </span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Minimum</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={localFilters.ratingRange[0]}
                      onChange={(e) => updateRatingRange(0, Number.parseFloat(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Maximum</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={localFilters.ratingRange[1]}
                      onChange={(e) => updateRatingRange(1, Number.parseFloat(e.target.value))}
                      className="w-full accent-yellow-500"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 p-4">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-700 text-gray-300 
                    hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyFilters}
                  className="flex-1 py-3 rounded-lg bg-yellow-500 text-black font-semibold 
                    hover:bg-yellow-400 transition-colors"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SearchFilters
