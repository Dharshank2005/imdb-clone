"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SlidersHorizontal } from "lucide-react"
import { SearchProvider } from "../contexts/SearchContext.tsx"
import SearchBar from "../components/SearchBar.tsx"
import SearchFilters from "../components/SearchFilters.tsx"
import SearchResults from "../components/SearchResults.tsx"

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Discover Movies
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Search through thousands of movies with advanced filters and find your next favorite film
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 max-w-4xl mx-auto">
              <div className="flex-1">
                <SearchBar />
              </div>

              {/* Filter Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-2xl transition-all duration-200 flex items-center gap-2 border border-gray-700 hover:border-yellow-500/50"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <SearchResults />
          </motion.div>

          {/* Filter Panel */}
          <SearchFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
        </div>
      </div>
    </SearchProvider>
  )
}
