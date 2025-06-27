"use client"

import { useState, useEffect } from "react"

interface Movie {
  id: string
  title: string
  image: string
  year: number
  rating?: number
  genre?: string[]
  addedAt?: string
}

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedWatchlist = localStorage.getItem("moviedb_watchlist")
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist))
      } catch (error) {
        console.error("Error loading watchlist:", error)
      }
    }
    setLoading(false)
  }, [])

  const saveWatchlist = (newWatchlist: Movie[]) => {
    setWatchlist(newWatchlist)
    localStorage.setItem("moviedb_watchlist", JSON.stringify(newWatchlist))
  }

  const addToWatchlist = async (movie: Omit<Movie, "addedAt">) => {
    const exists = watchlist.find((item) => item.id === movie.id)
    if (!exists) {
      const newMovie = { ...movie, addedAt: new Date().toISOString() }
      const newWatchlist = [...watchlist, newMovie]
      saveWatchlist(newWatchlist)
      return true
    }
    return false
  }

  const removeFromWatchlist = async (movieId: string) => {
    const newWatchlist = watchlist.filter((item) => item.id !== movieId)
    saveWatchlist(newWatchlist)
  }

  const isInWatchlist = (movieId: string) => {
    return watchlist.some((item) => item.id === movieId)
  }

  const reorderWatchlist = (newOrder: Movie[]) => {
    setWatchlist(newOrder)
    localStorage.setItem("moviedb_watchlist", JSON.stringify(newOrder))
  }

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    reorderWatchlist,
  }
}