"use client"

import { useState, useEffect } from "react"

interface RatedMovie {
  id: string
  title: string
  image: string
  year: number
  userRating: number
  ratedAt: string
  genre?: string[]
}

export const useRatings = () => {
  const [ratedMovies, setRatedMovies] = useState<RatedMovie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedRatings = localStorage.getItem("moviedb_ratings")
    if (savedRatings) {
      try {
        setRatedMovies(JSON.parse(savedRatings))
      } catch (error) {
        console.error("Error loading ratings:", error)
      }
    }
    setLoading(false)
  }, [])

  const saveRatings = (newRatings: RatedMovie[]) => {
    setRatedMovies(newRatings)
    localStorage.setItem("moviedb_ratings", JSON.stringify(newRatings))
  }

  const rateMovie = async (movieData: Omit<RatedMovie, "ratedAt">) => {
    const existingIndex = ratedMovies.findIndex((item) => item.id === movieData.id)
    let newRatings: RatedMovie[]

    if (existingIndex >= 0) {
      newRatings = [...ratedMovies]
      newRatings[existingIndex] = {
        ...movieData,
        ratedAt: new Date().toISOString(),
      }
    } else {
      const newRating: RatedMovie = {
        ...movieData,
        ratedAt: new Date().toISOString(),
      }
      newRatings = [...ratedMovies, newRating]
    }

    saveRatings(newRatings)
  }

  const getRating = (movieId: string) => {
    const ratedMovie = ratedMovies.find((item) => item.id === movieId)
    return ratedMovie?.userRating || 0
  }

  const removeRating = (movieId: string) => {
    const newRatings = ratedMovies.filter((item) => item.id !== movieId)
    saveRatings(newRatings)
  }

  return {
    ratedMovies,
    loading,
    rateMovie,
    getRating,
    removeRating,
  }
}