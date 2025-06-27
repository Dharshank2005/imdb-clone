"use client"

import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Globe,
  Heart,
  Play,
  Share2,
  Star,
  Plus,
  Edit3,
} from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { MOVIES } from "../data/movies"
import { useUserData } from "../hooks/useUserData.js"
import StarRatingEnhanced from "../components/StarRating.tsx"
import ReviewEditor from "../components/ReviewEditor.tsx"
import { motion, AnimatePresence } from "framer-motion"

const MovieDetails = () => {
  const { id } = useParams()
  const movie = MOVIES.find((m) => m.id === id) || MOVIES[0]
  const { watchlist, addToWatchlist, removeFromWatchlist, ratedMovies, rateMovie, reviews, addReview, updateReview } =
    useUserData()

  const [reviewEditor, setReviewEditor] = useState({ isOpen: false, review: null })
  const [isWatchlistAnimating, setIsWatchlistAnimating] = useState(false)

  const isInWatchlist = watchlist.some((item) => item.id === movie.id)
  const userRating = ratedMovies.find((item) => item.id === movie.id)?.userRating || 0
  const movieReviews = reviews.filter((review) => review.movieId === movie.id)

  const handleWatchlistToggle = async () => {
    setIsWatchlistAnimating(true)

    if (isInWatchlist) {
      await removeFromWatchlist(movie.id)
    } else {
      await addToWatchlist({
        id: movie.id,
        title: movie.title,
        image: movie.image,
        year: movie.year,
        genre: movie.genre,
        rating: movie.rating,
      })
    }

    setTimeout(() => setIsWatchlistAnimating(false), 300)
  }

  const handleRatingChange = async (newRating) => {
    await rateMovie(movie.id, newRating)
  }

  const handleReviewSave = async (reviewData) => {
    try {
      if (reviewEditor.review) {
        updateReview(reviewEditor.review.id, reviewData)
      } else {
        addReview(movie.id, reviewData)
      }
      setReviewEditor({ isOpen: false, review: null })
    } catch (error) {
      console.error("Failed to save review:", error)
    }
  }

  return (
    <div>
      <div className="relative h-[90vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop || movie.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="grid md:grid-cols-3 gap-8 items-end">
            <div className="hidden md:block">
              <img
                src={movie.image || "/placeholder.svg"}
                alt={movie.title}
                className="rounded-lg shadow-xl aspect-[2/3] object-cover"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-yellow-500 font-semibold">{movie.rating} Rating</span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{movie.releaseDate}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.map((g) => (
                  <span key={g} className="px-3 py-1 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm">
                    {g}
                  </span>
                ))}
              </div>

              {/* User Rating Section */}
              <div className="mb-6 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Your Rating</h3>
                <StarRatingEnhanced
                  rating={userRating}
                  interactive
                  showEditButton
                  onRatingChange={handleRatingChange}
                  size={24}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={movie.trailer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </a>
                <motion.button
                  onClick={handleWatchlistToggle}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    isInWatchlist
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : "bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isWatchlistAnimating ? { scale: [1, 1.1, 1] } : {}}
                >
                  <Heart className={`w-5 h-5 ${isInWatchlist ? "fill-current" : ""}`} />
                  {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </motion.button>
                <button
                  onClick={() => setReviewEditor({ isOpen: true, review: null })}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Write Review
                </button>
                <button className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.description}</p>
            </section>

            {/* Reviews Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Reviews ({movieReviews.length})</h2>
                <button
                  onClick={() => setReviewEditor({ isOpen: true, review: null })}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Review
                </button>
              </div>

              {movieReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No reviews yet. Be the first to write one!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {movieReviews.map((review) => (
                    <div key={review.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg mb-1">{review.title}</h4>
                          <div className="flex items-center gap-2">
                            <StarRatingEnhanced rating={review.rating} size={16} />
                            <span className="text-gray-400 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setReviewEditor({ isOpen: true, review })}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-3">{review.content}</p>
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {review.tags.map((tag, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Awards & Recognition</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {movie.awards.map((award, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span>{award}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <span>Metacritic: {movie.metacriticScore}/100</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-red-500" />
                  <span>Rotten Tomatoes: {movie.rottenTomatoesScore}%</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
              <div className="grid grid-cols-2 gap-6">
                {movie.cast.map((actor) => (
                  <Link
                    key={actor.id}
                    to={`/actor/${actor.id}`}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-700/50 transition-colors flex gap-4"
                  >
                    <img
                      src={actor.image || "/placeholder.svg"}
                      alt={actor.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{actor.name}</h3>
                      <p className="text-gray-400 mb-2">{actor.role}</p>
                      <p className="text-sm text-gray-400 line-clamp-2">{actor.bio}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div>
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h3 className="font-semibold mb-4">Movie Info</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-gray-400">Director</dt>
                    <dd>{movie.director}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Production Company</dt>
                    <dd>{movie.productionCompany}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-gray-400">Box Office</dt>
                    <dd className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      {movie.boxOffice}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-gray-400">Language</dt>
                    <dd className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-blue-500" />
                      {movie.language}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Review Editor Modal */}
      <AnimatePresence>
        {reviewEditor.isOpen && (
          <ReviewEditor
            movie={movie}
            review={reviewEditor.review}
            onSave={handleReviewSave}
            onCancel={() => setReviewEditor({ isOpen: false, review: null })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default MovieDetails
