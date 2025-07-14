"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Clock, Award, Search } from "lucide-react"
import { useSearch } from "../contexts/SearchContext.tsx"
import SearchSkeleton from "./SearchSkeleton.tsx"

const SearchResults: React.FC = () => {
  const { state, search } = useSearch()
  const { results, total, hasMore, isLoading } = state
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !isLoading) {
          search(true) // Load more
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading, search])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  if (isLoading && results.length === 0) {
    return <SearchSkeleton />
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">
            {total > 0 ? (
              <>
                {total.toLocaleString()} result{total === 1 ? "" : "s"}
                {state.filters.query && <span className="text-gray-400 font-normal"> for "{state.filters.query}"</span>}
              </>
            ) : (
              "No results found"
            )}
          </h2>
          {total > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              Showing {results.length} of {total} movies
            </p>
          )}
        </div>

        {/* Active Filters Indicator */}
        {(state.filters.genres.length > 0 || state.filters.actors.length > 0) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Filters:</span>
            {state.filters.genres.map((genre) => (
              <span key={genre} className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                {genre}
              </span>
            ))}
            {state.filters.actors.map((actor) => (
              <span key={actor} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                {actor}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Results Grid */}
      <AnimatePresence mode="wait">
        {results.length > 0 ? (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {results.map((movie, index) => (
              <motion.article
                key={movie.id}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="group bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden 
                  shadow-lg border border-gray-700/50 hover:border-yellow-500/30 
                  hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300"
              >
                {/* Movie Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 
                      group-hover:scale-110"
                    loading={index < 8 ? "eager" : "lazy"}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-sm font-medium">{movie.rating}</span>
                    </div>
                  </div>

                  {/* Year Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span className="text-white text-sm">{movie.year}</span>
                  </div>

                  {/* Awards Indicator */}
                  {movie.awards && movie.awards.length > 0 && (
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-1">
                        <Award className="w-4 h-4 text-yellow-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Movie Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Directed by {movie.director}</p>
                  </div>

                  {/* Genre Tags */}
                  <div className="flex flex-wrap gap-1">
                    {movie.genre.slice(0, 3).map((genre) => (
                      <span key={genre} className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full">
                        {genre}
                      </span>
                    ))}
                    {movie.genre.length > 3 && (
                      <span className="text-gray-400 text-xs px-2 py-1">+{movie.genre.length - 3}</span>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{movie.duration}</span>
                    </div>
                    {movie.boxOffice && <span className="font-medium">{movie.boxOffice}</span>}
                  </div>

                  {/* Cast Preview */}
                  {movie.cast && movie.cast.length > 0 && (
                    <div className="text-xs text-gray-400">
                      <span className="font-medium">Starring: </span>
                      {movie.cast
                        .slice(0, 2)
                        .map((actor) => actor.name)
                        .join(", ")}
                      {movie.cast.length > 2 && "..."}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : !isLoading ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Check your spelling</p>
                <p>• Try different keywords</p>
                <p>• Remove some filters</p>
                <p>• Search for actors or directors</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Loading More Indicator */}
      {isLoading && results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Loading more movies...</span>
          </div>
        </motion.div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-1" />
    </section>
  )
}

export default SearchResults
