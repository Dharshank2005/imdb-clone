"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Save, X, Star, Tag, FileText } from "lucide-react"

interface Movie {
  id: string
  title: string
  image: string
  year: number
}

interface Review {
  id?: string
  movieId: string
  title: string
  content: string
  rating: number
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

interface ReviewEditorProps {
  movie: Movie
  review?: Review
  onSave: (reviewData: Omit<Review, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

const ReviewEditor: React.FC<ReviewEditorProps> = ({ movie, review, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: review?.title || "",
    content: review?.content || "",
    rating: review?.rating || 0,
    tags: review?.tags || [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTag, setNewTag] = useState("")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Review title is required"
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (!formData.content.trim()) {
      newErrors.content = "Review content is required"
    } else if (formData.content.length < 50) {
      newErrors.content = "Review must be at least 50 characters"
    } else if (formData.content.length > 2000) {
      newErrors.content = "Review must be less than 2000 characters"
    }

    if (formData.rating === 0) {
      newErrors.rating = "Please provide a rating"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave({
        movieId: movie.id,
        title: formData.title,
        content: formData.content,
        rating: formData.rating,
        tags: formData.tags,
      })
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }))
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: "" }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{review ? "Edit Review" : "Write Review"}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Movie Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-800/50 rounded-lg">
          <img
            src={movie.image || "/placeholder.svg"}
            alt={movie.title}
            className="w-16 h-24 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-lg">{movie.title}</h3>
            <p className="text-gray-400">{movie.year}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Star size={16} className="inline mr-2" />
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRatingClick(star)}
                  className="transition-colors"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= formData.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  />
                </motion.button>
              ))}
              <span className="ml-2 text-sm text-gray-400">
                {formData.rating > 0 ? `${formData.rating}/5` : "Click to rate"}
              </span>
            </div>
            {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText size={16} className="inline mr-2" />
              Review Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                errors.title ? "border-red-500" : "border-gray-700"
              }`}
              placeholder="Give your review a title..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              <p className="text-sm text-gray-400 ml-auto">{formData.title.length}/100</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Review Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              rows={8}
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none ${
                errors.content ? "border-red-500" : "border-gray-700"
              }`}
              placeholder="Share your thoughts about this movie..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
              <p
                className={`text-sm ml-auto ${
                  formData.content.length < 50
                    ? "text-red-400"
                    : formData.content.length > 1800
                      ? "text-yellow-400"
                      : "text-gray-400"
                }`}
              >
                {formData.content.length}/2000 {formData.content.length < 50 && "(min 50)"}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Tag size={16} className="inline mr-2" />
              Tags (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Add a tag..."
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || formData.tags.length >= 5}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:text-gray-400"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-full text-sm">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-red-400 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">{formData.tags.length}/5 tags</p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {review ? "Update Review" : "Publish Review"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default ReviewEditor
