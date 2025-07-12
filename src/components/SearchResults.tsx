"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Loader2, SearchIcon } from "lucide-react"
import { useSearch } from "../contexts/SearchContext.tsx"
import MovieCard from "./MovieCard.tsx"
import SearchSkeleton from "./SearchSkeleton.tsx"

const SearchResults: React.FC = () => {
  const { state, search } = useSearch()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.hasMore && !state.isLoading) {
          search(true) // Load more
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [state.hasMore, state.isLoading, search])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  // Show skeleton while searching
  if (state.isSearching && state.results.length === 0) {
    return <SearchSkeleton />
  }

  // Show empty state
  if (
    !state.isSearching &&
    state.results.length === 0 &&
    (state.filters.query.trim() || state.filters.genres.length > 0 || state.filters.actors.length > 0)
  ) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="mb-6">
          <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-300 mb-2">No Results Found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We couldn't find any movies matching your search criteria. Try adjusting your filters or search terms.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 text-sm text-gray-400"
        >
          <p>Search suggestions:</p>
          <ul className="space-y-1">
            <li>• Try different keywords</li>
            <li>• Check your spelling</li>
            <li>• Use broader search terms</li>
            <li>• Remove some filters</li>
          </ul>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <AnimatePresence>
        {state.results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold">{state.totalResults.toLocaleString()} Results</h2>
              {state.filters.query && <p className="text-gray-400 mt-1">for "{state.filters.query}"</p>}
            </div>

            {/* Active Filters Summary */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {state.filters.genres.length > 0 && (
                <span className="bg-gray-800 px-2 py-1 rounded">
                  {state.filters.genres.length} genre{state.filters.genres.length > 1 ? "s" : ""}
                </span>
              )}
              {state.filters.actors.length > 0 && (
                <span className="bg-gray-800 px-2 py-1 rounded">
                  {state.filters.actors.length} actor{state.filters.actors.length > 1 ? "s" : ""}
                </span>
              )}
              {(state.filters.yearRange[0] !== 1900 || state.filters.yearRange[1] !== new Date().getFullYear()) && (
                <span className="bg-gray-800 px-2 py-1 rounded">
                  {state.filters.yearRange[0]}-{state.filters.yearRange[1]}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {state.results.map((movie, index) => (
            <motion.div key={`${movie.id}-${index}`} variants={itemVariants} layout className="group">
              <Link to={`/movie/${movie.id}`}>
                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                  <MovieCard {...movie} />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More Trigger */}
      {state.hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {state.isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-gray-400"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more results...</span>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 text-sm">
              Scroll down for more results
            </motion.div>
          )}
        </div>
      )}

      {/* End of Results */}
      {!state.hasMore && state.results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500 text-sm"
        >
          You've reached the end of the results
        </motion.div>
      )}
    </div>
  )
}

export default SearchResults;