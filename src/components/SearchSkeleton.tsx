"use client"

import type React from "react"
import { motion } from "framer-motion"

const SearchSkeleton: React.FC = () => {
  const skeletonItems = Array.from({ length: 12 }, (_, i) => i)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {skeletonItems.map((index) => (
        <motion.div key={index} variants={itemVariants} className="group">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-700/50">
            {/* Image Skeleton */}
            <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800/80 via-transparent to-transparent" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-700 rounded-lg animate-pulse" />
                <div className="h-4 bg-gray-700 rounded-lg w-3/4 animate-pulse" />
              </div>

              {/* Rating and Year */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-gray-700 rounded-full animate-pulse" />
                  ))}
                </div>
                <div className="h-4 bg-gray-700 rounded w-12 animate-pulse" />
              </div>

              {/* Genre tags */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-700 rounded-full w-16 animate-pulse" />
                <div className="h-6 bg-gray-700 rounded-full w-20 animate-pulse" />
              </div>

              {/* Director */}
              <div className="h-3 bg-gray-700 rounded w-24 animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default SearchSkeleton
