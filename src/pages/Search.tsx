"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "react-router-dom"
import { Filter } from "lucide-react"
import { useSearch } from "../contexts/SearchContext.tsx"
import SearchBar from "../components/SearchBar.tsx"
import SearchFilters from "../components/SearchFilters.tsx"
import SearchResults from "../components/SearchResults.tsx"

const Search: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { setFilters, search } = useSearch()
  const [showFilters, setShowFilters] = useState(false)

  // Handle URL search params
  useEffect(() => {
    const query = searchParams.get("q") || ""
    const genre = searchParams.get("genre") || ""
    const year = searchParams.get("year") || ""
    const actor = searchParams.get("actor") || ""

    if (query || genre || year || actor) {
      const filters: any = {}

      if (query) filters.query = query
      if (genre) filters.genres = [genre]
      if (year) {
        const yearNum = Number.parseInt(year)
        if (!isNaN(yearNum)) {
          filters.yearRange = [yearNum, yearNum]
        }
      }
      if (actor) filters.actors = [actor]

      setFilters(filters)
      search()
    }
  }, [searchParams, setFilters, search])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Advanced Movie Search
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover your next favorite movie with our powerful search engine. Filter by genre, year, rating, actors,
            and more.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                showFilters
                  ? "bg-yellow-500 text-black shadow-lg"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Search Results */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <SearchResults />
        </motion.div>

        {/* Search Filters Panel */}
        <SearchFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
      </div>
    </div>
  )
}

export default Search
