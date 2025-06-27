"use client"

import { useState, useEffect } from "react"

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

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedReviews = localStorage.getItem("moviedb_reviews")
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews))
      } catch (error) {
        console.error("Error loading reviews:", error)
      }
    }
    setLoading(false)
  }, [])

  const saveReviews = (newReviews: Review[]) => {
    setReviews(newReviews)
    localStorage.setItem("moviedb_reviews", JSON.stringify(newReviews))
  }

  const addReview = (reviewData: Omit<Review, "id" | "createdAt">) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    const newReviews = [...reviews, newReview]
    saveReviews(newReviews)
    return newReview
  }

  const updateReview = (reviewId: string, reviewData: Partial<Review>) => {
    const newReviews = reviews.map((review) =>
      review.id === reviewId ? { ...review, ...reviewData, updatedAt: new Date().toISOString() } : review,
    )
    saveReviews(newReviews)
  }

  const deleteReview = (reviewId: string) => {
    const newReviews = reviews.filter((review) => review.id !== reviewId)
    saveReviews(newReviews)
  }

  const getMovieReviews = (movieId: string) => {
    return reviews.filter((review) => review.movieId === movieId)
  }

  return {
    reviews,
    loading,
    addReview,
    updateReview,
    deleteReview,
    getMovieReviews,
  }
}