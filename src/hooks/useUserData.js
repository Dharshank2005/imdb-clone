"use client"

import { useState, useEffect } from "react"
import { loadFromStorage, saveToStorage, STORAGE_KEYS, initializeUserData } from "../utils/storage.js"
import { dbUtils } from "../utils/database.tsx"

export const useUserData = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [watchlist, setWatchlist] = useState([])
  const [ratedMovies, setRatedMovies] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize local storage first
        initializeUserData()

        // Try to load from database first, fallback to local storage
        const [dbProfile, dbWatchlist, dbRatedMovies, dbReviews] = await Promise.allSettled([
          dbUtils.getUserProfile(),
          dbUtils.getWatchlist(),
          dbUtils.getRatedMovies(),
          dbUtils.getReviews(),
        ])

        // Use database data if available, otherwise use local storage
        setUserProfile(
          dbProfile.status === "fulfilled" && dbProfile.value
            ? dbProfile.value
            : loadFromStorage(STORAGE_KEYS.USER_PROFILE),
        )

        setWatchlist(
          dbWatchlist.status === "fulfilled" && dbWatchlist.value.length > 0
            ? dbWatchlist.value
            : loadFromStorage(STORAGE_KEYS.WATCHLIST, []),
        )

        setRatedMovies(
          dbRatedMovies.status === "fulfilled" && dbRatedMovies.value.length > 0
            ? dbRatedMovies.value
            : loadFromStorage(STORAGE_KEYS.RATED_MOVIES, []),
        )

        setReviews(
          dbReviews.status === "fulfilled" && dbReviews.value.length > 0
            ? dbReviews.value
            : loadFromStorage(STORAGE_KEYS.REVIEWS, []),
        )
      } catch (error) {
        console.error("Error loading data:", error)
        // Fallback to local storage only
        initializeUserData()
        setUserProfile(loadFromStorage(STORAGE_KEYS.USER_PROFILE))
        setWatchlist(loadFromStorage(STORAGE_KEYS.WATCHLIST, []))
        setRatedMovies(loadFromStorage(STORAGE_KEYS.RATED_MOVIES, []))
        setReviews(loadFromStorage(STORAGE_KEYS.REVIEWS, []))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateUserProfile = async (newProfile) => {
    setUserProfile(newProfile)
    saveToStorage(STORAGE_KEYS.USER_PROFILE, newProfile)
    try {
      await dbUtils.saveUserProfile(newProfile)
    } catch (error) {
      console.error("Failed to save profile to database:", error)
    }
  }

  const updateWatchlist = async (newWatchlist) => {
    setWatchlist(newWatchlist)
    saveToStorage(STORAGE_KEYS.WATCHLIST, newWatchlist)
    try {
      await dbUtils.saveWatchlist(newWatchlist)
    } catch (error) {
      console.error("Failed to save watchlist to database:", error)
    }
  }

  const addToWatchlist = async (movie) => {
    const exists = watchlist.find((item) => item.id === movie.id)
    if (!exists) {
      const newWatchlist = [...watchlist, { ...movie, addedAt: new Date().toISOString() }]
      await updateWatchlist(newWatchlist)
      return true
    }
    return false
  }

  const removeFromWatchlist = async (movieId) => {
    const newWatchlist = watchlist.filter((item) => item.id !== movieId)
    await updateWatchlist(newWatchlist)
  }

  const updateRatedMovies = async (newRatedMovies) => {
    setRatedMovies(newRatedMovies)
    saveToStorage(STORAGE_KEYS.RATED_MOVIES, newRatedMovies)
    try {
      await dbUtils.saveRatedMovies(newRatedMovies)
    } catch (error) {
      console.error("Failed to save rated movies to database:", error)
    }
  }

  const rateMovie = async (movieId, rating) => {
    const existingIndex = ratedMovies.findIndex((item) => item.id === movieId)
    let newRatedMovies

    if (existingIndex >= 0) {
      newRatedMovies = [...ratedMovies]
      newRatedMovies[existingIndex] = {
        ...newRatedMovies[existingIndex],
        userRating: rating,
        ratedAt: new Date().toISOString(),
      }
    } else {
      // Find movie from watchlist or create basic movie object
      const movie = watchlist.find((m) => m.id === movieId) || {
        id: movieId,
        title: "Unknown Movie",
        image: "/placeholder.svg?height=300&width=200",
        year: new Date().getFullYear(),
      }
      newRatedMovies = [
        ...ratedMovies,
        {
          ...movie,
          userRating: rating,
          ratedAt: new Date().toISOString(),
        },
      ]
    }

    await updateRatedMovies(newRatedMovies)
  }

  const updateReviews = async (newReviews) => {
    setReviews(newReviews)
    saveToStorage(STORAGE_KEYS.REVIEWS, newReviews)
  }

  const addReview = (movieId, reviewData) => {
    const newReview = {
      id: Date.now().toString(),
      movieId,
      ...reviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newReviews = [...reviews, newReview]
    updateReviews(newReviews)
    return newReview
  }

  const updateReview = (reviewId, reviewData) => {
    const newReviews = reviews.map((review) =>
      review.id === reviewId ? { ...review, ...reviewData, updatedAt: new Date().toISOString() } : review,
    )
    updateReviews(newReviews)
  }

  const deleteReview = (reviewId) => {
    const newReviews = reviews.filter((review) => review.id !== reviewId)
    updateReviews(newReviews)
  }

  return {
    userProfile,
    watchlist,
    ratedMovies,
    reviews,
    loading,
    updateUserProfile,
    updateWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    rateMovie,
    addReview,
    updateReview,
    deleteReview,
  }
}
