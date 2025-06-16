"use client"

import type React from "react"
import { useState } from "react"
import { Star, Edit3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type StarRatingEnhancedProps = {
  rating?: number
  maxRating?: number
  size?: number
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
  showEditButton?: boolean
}

const StarRatingEnhanced: React.FC<StarRatingEnhancedProps> = ({
  rating = 0,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
  className = "",
  showEditButton = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [tempRating, setTempRating] = useState(rating)

  const handleStarClick = (starRating: number) => {
    if (interactive && isEditing) {
      setTempRating(starRating)
    }
  }

  const handleStarHover = (starRating: number) => {
    if (interactive && isEditing) {
      setHoverRating(starRating)
    }
  }

  const handleMouseLeave = () => {
    if (interactive && isEditing) {
      setHoverRating(0)
    }
  }

  const handleSave = () => {
    if (onRatingChange) {
      onRatingChange(tempRating)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempRating(rating)
    setHoverRating(0)
    setIsEditing(false)
  }

  const displayRating = isEditing ? hoverRating || tempRating : rating

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
        {[...Array(maxRating)].map((_, index) => {
          const starRating = index + 1
          const isFilled = starRating <= displayRating

          return (
            <motion.button
              key={index}
              type="button"
              className={`${
                interactive && isEditing ? "cursor-pointer" : "cursor-default"
              } transition-all duration-200`}
              onClick={() => handleStarClick(starRating)}
              onMouseEnter={() => handleStarHover(starRating)}
              whileHover={interactive && isEditing ? { scale: 1.2 } : { scale: 1.05 }}
              whileTap={interactive && isEditing ? { scale: 0.9 } : {}}
              disabled={!interactive || !isEditing}
            >
              <Star
                size={size}
                className={`transition-all duration-200 ${
                  isFilled
                    ? "text-yellow-500 fill-yellow-500"
                    : isEditing && interactive
                      ? "text-gray-400 hover:text-yellow-400"
                      : "text-gray-400"
                } ${isEditing && interactive ? "drop-shadow-lg" : ""}`}
              />
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-gray-400">{tempRating || hoverRating || 0}/5</span>
            <button
              onClick={handleSave}
              className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{rating}/5</span>
            {showEditButton && interactive && (
              <motion.button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-yellow-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit3 size={14} />
              </motion.button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StarRatingEnhanced
