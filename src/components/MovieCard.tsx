"use client"

import { Star, Heart, Plus } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useUserData } from "../hooks/useUserData"

const MovieCard = ({ id, title, rating, image, year, genre, showWatchlistButton = true }) => {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useUserData()
  const [isAnimating, setIsAnimating] = useState(false)

  const isInWatchlist = watchlist.some((movie) => movie.id === id)

  const handleWatchlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAnimating(true)

    if (isInWatchlist) {
      await removeFromWatchlist(id)
    } else {
      await addToWatchlist({ id, title, image, year, genre, rating })
    }

    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="bg-zinc-900/50 rounded-xl overflow-hidden movie-card-hover backdrop-blur-sm group">
      <div className="relative aspect-[2/3]">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover hover-glow" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 p-4 w-full">
            <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
              View Details
            </button>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-yellow-500 font-medium">{rating}</span>
        </div>

        {showWatchlistButton && (
          <motion.button
            onClick={handleWatchlistToggle}
            className={`absolute top-4 left-4 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              isInWatchlist ? "bg-yellow-500 text-black" : "bg-black/60 text-white hover:bg-black/80"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
          >
            {isInWatchlist ? <Heart className="w-4 h-4 fill-current" /> : <Plus className="w-4 h-4" />}
          </motion.button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate text-glow">{title}</h3>
          <span className="text-zinc-400 text-sm">{year}</span>
        </div>
        {genre && (
          <div className="flex flex-wrap gap-2">
            {genre.slice(0, 2).map((g) => (
              <span key={g} className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-300">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCard
