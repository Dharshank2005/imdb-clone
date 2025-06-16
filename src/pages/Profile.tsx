"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Edit, Bookmark, Star, MessageSquare, Calendar, TrendingUp, Plus } from "lucide-react"
import { useUserData } from "../hooks/useUserData.js"
import ProfileEditorEnhanced, { type UserProfile } from "../components/ProfileEditor.tsx"
import DragDropEnhanced from "../components/DragDropList.tsx"
import StarRatingEnhanced from "../components/StarRating.tsx"
import ReviewCard from "../components/ReviewCard.tsx"
import ReviewEditor from "../components/ReviewEditor.tsx"
import { dbUtils } from "../utils/database.tsx"

// Define Movie, RatedMovie, and Review types
interface Movie {
  id: string
  title: string
  image: string
  year: number
}

interface RatedMovie extends Movie {
  userRating: number
  ratedAt: string
}

interface Review {
  id: string
  movieId: string
  title: string
  content: string
  rating: number
  tags?: string[]
  createdAt: string
  updatedAt?: string
}

const ProfileEnhanced: React.FC = () => {
  const {
    userProfile,
    watchlist,
    ratedMovies,
    reviews,
    loading,
    updateUserProfile,
    updateWatchlist,
    removeFromWatchlist,
    rateMovie,
    addReview,
    updateReview,
    deleteReview,
  } = useUserData() as {
    userProfile: UserProfile | null
    watchlist: Movie[]
    ratedMovies: RatedMovie[]
    reviews: Review[]
    loading: boolean
    updateUserProfile: (p: UserProfile) => void
    updateWatchlist: (items: Movie[]) => void
    removeFromWatchlist: (id: string) => void
    rateMovie: (id: string, rating: number) => void
    addReview: (movieId: string, reviewData: any) => Review
    updateReview: (reviewId: string, reviewData: any) => void
    deleteReview: (id: string) => void
  }

  const [activeTab, setActiveTab] = useState<"overview" | "watchlist" | "rated" | "reviews">("overview")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [reviewEditor, setReviewEditor] = useState<{
    isOpen: boolean
    movie?: Movie
    review?: Review
  }>({ isOpen: false })

  // Show spinner while loading or if no profile
  if (loading || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "watchlist", label: "Watchlist", icon: Bookmark },
    { id: "rated", label: "Rated Movies", icon: Star },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
  ] as const

  const handleProfileSave = async (updatedProfile: UserProfile) => {
    updateUserProfile(updatedProfile)
    // Save to database
    try {
      await dbUtils.saveUserProfile(updatedProfile)
    } catch (error) {
      console.error("Failed to save profile to database:", error)
    }
    setIsEditingProfile(false)
  }

  const handleRatingChange = async (movieId: string, newRating: number) => {
    rateMovie(movieId, newRating)
    // Save to database
    try {
      await dbUtils.saveRatedMovies(ratedMovies)
    } catch (error) {
      console.error("Failed to save rating to database:", error)
    }
  }

  const handleReviewSave = async (reviewData: any) => {
    try {
      if (reviewEditor.review) {
        // Update existing review
        updateReview(reviewEditor.review.id, reviewData)
        await dbUtils.updateReview(reviewEditor.review.id, reviewData)
      } else {
        // Add new review
        const newReview = addReview(reviewData.movieId, reviewData)
        await dbUtils.saveReview(newReview)
      }
      setReviewEditor({ isOpen: false })
    } catch (error) {
      console.error("Failed to save review:", error)
    }
  }

  const handleReviewEdit = (review: Review) => {
    const movie = ratedMovies.find((m) => m.id === review.movieId) || watchlist.find((m) => m.id === review.movieId)
    if (movie) {
      setReviewEditor({ isOpen: true, movie, review })
    }
  }

  const handleReviewDelete = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteReview(reviewId)
      try {
        await dbUtils.deleteReview(reviewId)
      } catch (error) {
        console.error("Failed to delete review from database:", error)
      }
    }
  }

  const handleAddReview = (movie: Movie) => {
    setReviewEditor({ isOpen: true, movie })
  }

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center gap-6">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={userProfile.profilePicture}
            alt={userProfile.username}
            className="w-24 h-24 rounded-full object-cover border-4 border-yellow-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{userProfile.username}</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingProfile(true)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Profile
              </motion.button>
            </div>
            <p className="text-gray-300 mb-4">{userProfile.bio}</p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Joined {new Date(userProfile.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark size={16} />
                <span>{watchlist.length} in watchlist</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} />
                <span>{ratedMovies.length} movies rated</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={16} />
                <span>{reviews.length} reviews written</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Movies Watched */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border border-yellow-500/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Movies Watched</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-500">{ratedMovies.length}</p>
                <p className="text-gray-400 text-sm">Total movies rated</p>
              </motion.div>

              {/* Average Rating */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-8 h-8 text-purple-500" />
                  <h3 className="text-xl font-semibold">Average Rating</h3>
                </div>
                <p className="text-3xl font-bold text-purple-500">
                  {ratedMovies.length > 0
                    ? (ratedMovies.reduce((sum, m) => sum + m.userRating, 0) / ratedMovies.length).toFixed(1)
                    : "0.0"}
                </p>
                <p className="text-gray-400 text-sm">Out of 5 stars</p>
              </motion.div>

              {/* Reviews Written */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                  <h3 className="text-xl font-semibold">Reviews Written</h3>
                </div>
                <p className="text-3xl font-bold text-blue-500">{reviews.length}</p>
                <p className="text-gray-400 text-sm">Total reviews</p>
              </motion.div>

              {/* Favorite Genres */}
              <div className="md:col-span-2 lg:col-span-3 bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.preferences.favoriteGenres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm border border-yellow-500/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "watchlist" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">My Watchlist</h2>
                <p className="text-gray-400">{watchlist.length} movies</p>
              </div>
              <DragDropEnhanced
                items={watchlist}
                onReorder={updateWatchlist}
                onRemove={removeFromWatchlist}
                title="Watchlist"
              />
            </div>
          )}

          {activeTab === "rated" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Rated Movies</h2>
                <p className="text-gray-400">{ratedMovies.length} movies</p>
              </div>
              {ratedMovies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No rated movies yet</div>
                  <p className="text-gray-500">Start rating movies to see them here!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ratedMovies.map((movie) => (
                    <motion.div
                      key={movie.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={movie.image || "/placeholder.svg"}
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{movie.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                            <span>{movie.year}</span>
                            <span>Rated {new Date(movie.ratedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <StarRatingEnhanced
                              rating={movie.userRating}
                              interactive
                              showEditButton
                              onRatingChange={(nr) => handleRatingChange(movie.id, nr)}
                            />
                            <button
                              onClick={() => handleAddReview(movie)}
                              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add Review
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">My Reviews</h2>
                <p className="text-gray-400">{reviews.length} reviews</p>
              </div>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No reviews written yet</div>
                  <p className="text-gray-500">Start writing reviews to see them here!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => {
                    const movie =
                      ratedMovies.find((m) => m.id === review.movieId) ||
                      watchlist.find((m) => m.id === review.movieId)!
                    return (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        movie={movie}
                        onEdit={() => handleReviewEdit(review)}
                        onDelete={() => handleReviewDelete(review.id)}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Profile Editor Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <ProfileEditorEnhanced
            userProfile={userProfile}
            onSave={handleProfileSave}
            onCancel={() => setIsEditingProfile(false)}
          />
        )}
      </AnimatePresence>

      {/* Review Editor Modal */}
      <AnimatePresence>
        {reviewEditor.isOpen && reviewEditor.movie && (
          <ReviewEditor
            movie={reviewEditor.movie}
            review={reviewEditor.review}
            onSave={handleReviewSave}
            onCancel={() => setReviewEditor({ isOpen: false })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileEnhanced
