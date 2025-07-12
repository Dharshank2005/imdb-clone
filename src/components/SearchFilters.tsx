"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Star, Users, SlidersHorizontal, RotateCcw } from "lucide-react"
import { useSearch } from "../contexts/SearchContext.tsx"

interface SearchFiltersProps {
  isOpen: boolean
  onClose: () => void
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ isOpen, onClose }) => {
  const { state, setFilters, search, resetSearch } = useSearch()
  const [localFilters, setLocalFilters] = useState(state.filters)

  const availableGenres = [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Thriller",
    "War",
    "Western",
  ]

  const availableActors = [
    "Timothée Chalamet",
    "Zendaya",
    "Cillian Murphy",
    "Emily Blunt",
    "Emma Stone",
    "Willem Dafoe",
    "Robert Pattinson",
    "Zoë Kravitz",
    "Leonardo DiCaprio",
    "Robert De Niro",
    "Margot Robbie",
    "Ryan Gosling",
  ]

  const currentYear = new Date().getFullYear()

  const handleGenreToggle = (genre: string) => {
    const newGenres = localFilters.genres.includes(genre)
      ? localFilters.genres.filter((g) => g !== genre)
      : [...localFilters.genres, genre]

    setLocalFilters((prev) => ({ ...prev, genres: newGenres }))
  }

  const handleActorToggle = (actor: string) => {
    const newActors = localFilters.actors.includes(actor)
      ? localFilters.actors.filter((a) => a !== actor)
      : [...localFilters.actors, actor]

    setLocalFilters((prev) => ({ ...prev, actors: newActors }))
  }

  const handleYearRangeChange = (index: number, value: number) => {
    const newRange: [number, number] = [...localFilters.yearRange]
    newRange[index] = value
    setLocalFilters((prev) => ({ ...prev, yearRange: newRange }))
  }

  const handleRatingRangeChange = (index: number, value: number) => {
    const newRange: [number, number] = [...localFilters.ratingRange]
    newRange[index] = value
    setLocalFilters((prev) => ({ ...prev, ratingRange: newRange }))
  }

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    }))
  }

  const applyFilters = async () => {
    setFilters(localFilters)
    // Small delay to ensure filters are set before searching
    setTimeout(async () => {
      await search()
      onClose()
    }, 50)
  }

  const resetFilters = () => {
    const defaultFilters = {
      query: "",
      genres: [],
      yearRange: [1900, currentYear] as [number, number],
      ratingRange: [0, 10] as [number, number],
      actors: [],
      sortBy: "relevance" as const,
      sortOrder: "desc" as const,
    }
    setLocalFilters(defaultFilters)
    setFilters(defaultFilters)
    setTimeout(() => {
      search()
    }, 50)
  }

  const hasActiveFilters =
    localFilters.genres.length > 0 ||
    localFilters.actors.length > 0 ||
    localFilters.yearRange[0] !== 1900 ||
    localFilters.yearRange[1] !== currentYear ||
    localFilters.ratingRange[0] !== 0 ||
    localFilters.ratingRange[1] !== 10 ||
    localFilters.sortBy !== "relevance"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-bold">Advanced Filters</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Filters Count */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-500">
                      {localFilters.genres.length +
                        localFilters.actors.length +
                        (localFilters.yearRange[0] !== 1900 || localFilters.yearRange[1] !== currentYear ? 1 : 0) +
                        (localFilters.ratingRange[0] !== 0 || localFilters.ratingRange[1] !== 10 ? 1 : 0)}{" "}
                      filters active
                    </span>
                    <button
                      onClick={resetFilters}
                      className="text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1 text-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-6">
                {/* Genres */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Genres
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableGenres.map((genre) => (
                      <motion.button
                        key={genre}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleGenreToggle(genre)}
                        className={`p-2 rounded-lg text-sm transition-all ${
                          localFilters.genres.includes(genre)
                            ? "bg-yellow-500 text-black font-medium"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {genre}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    Release Year
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">From: {localFilters.yearRange[0]}</label>
                      <input
                        type="range"
                        min="1900"
                        max={currentYear}
                        value={localFilters.yearRange[0]}
                        onChange={(e) => handleYearRangeChange(0, Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">To: {localFilters.yearRange[1]}</label>
                      <input
                        type="range"
                        min="1900"
                        max={currentYear}
                        value={localFilters.yearRange[1]}
                        onChange={(e) => handleYearRangeChange(1, Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Range */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Rating
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Minimum: {localFilters.ratingRange[0]}/10
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={localFilters.ratingRange[0]}
                        onChange={(e) => handleRatingRangeChange(0, Number.parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Maximum: {localFilters.ratingRange[1]}/10
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={localFilters.ratingRange[1]}
                        onChange={(e) => handleRatingRangeChange(1, Number.parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>

                {/* Actors */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-500" />
                    Actors
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {availableActors.map((actor) => (
                      <motion.button
                        key={actor}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleActorToggle(actor)}
                        className={`p-2 rounded-lg text-sm text-left transition-all ${
                          localFilters.actors.includes(actor)
                            ? "bg-yellow-500 text-black font-medium"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {actor}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Sort By
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "relevance", label: "Relevance" },
                      { value: "rating", label: "Rating" },
                      { value: "year", label: "Release Year" },
                      { value: "title", label: "Title" },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center gap-3">
                        <button
                          onClick={() => handleSortChange(option.value, localFilters.sortOrder)}
                          className={`flex-1 p-2 rounded-lg text-sm text-left transition-all ${
                            localFilters.sortBy === option.value
                              ? "bg-yellow-500 text-black font-medium"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                        {localFilters.sortBy === option.value && option.value !== "relevance" && (
                          <div className="flex rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleSortChange(option.value, "desc")}
                              className={`px-3 py-2 text-xs ${
                                localFilters.sortOrder === "desc"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => handleSortChange(option.value, "asc")}
                              className={`px-3 py-2 text-xs ${
                                localFilters.sortOrder === "asc"
                                  ? "bg-yellow-500 text-black"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              ↑
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="sticky bottom-0 bg-gray-900 pt-6 mt-8 border-t border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyFilters}
                  className="w-full bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
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
