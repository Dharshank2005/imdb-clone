"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit2, Trash2, Calendar } from "lucide-react"
import StarRating from "./StarRating.tsx"

const ReviewCard = ({ review, movie, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {movie && (
          <img
            src={movie.image || "/placeholder.svg"}
            alt={movie.title}
            className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
          />
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              {movie && <h3 className="font-semibold text-lg mb-1">{movie.title}</h3>}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(review.createdAt)}</span>
                </div>
                {review.updatedAt !== review.createdAt && <span className="text-xs">(edited)</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size={16} />
              <div className="flex gap-1 ml-4">
                <button
                  onClick={() => onEdit(review)}
                  className="text-gray-400 hover:text-yellow-500 transition-colors p-1"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(review.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="font-medium mb-2">{review.title}</h4>
            <p className="text-gray-300 leading-relaxed">
              {isExpanded ? review.content : truncateText(review.content)}
            </p>

            {review.content.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-yellow-500 hover:text-yellow-400 text-sm mt-2 transition-colors"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

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
      </div>
    </motion.div>
  )
}

export default ReviewCard
