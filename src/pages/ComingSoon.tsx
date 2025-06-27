"use client"

import { Clock, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { COMING_SOON_MOVIES } from "../data/movies"
import MovieCard from "../components/MovieCard.tsx"

const ComingSoon = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <Clock className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Coming Soon</h1>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {COMING_SOON_MOVIES.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group cursor-pointer"
          >
            <MovieCard {...movie} showWatchlistButton={false} />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-white font-semibold">Coming {movie.year}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ComingSoon
