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
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  }

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 1.5,
        ease: "linear",
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="h-8 bg-gray-800 rounded-lg w-48 relative overflow-hidden">
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
          />
        </div>
        <div className="h-4 bg-gray-800 rounded w-32 relative overflow-hidden">
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
          />
        </div>
      </motion.div>

      {/* Grid Skeleton */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {skeletonItems.map((index) => (
          <motion.div key={index} variants={itemVariants} className="bg-gray-800/50 rounded-xl overflow-hidden">
            {/* Image Skeleton */}
            <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
              />

              {/* Rating Badge Skeleton */}
              <div className="absolute top-4 right-4 w-12 h-6 bg-gray-700 rounded-md relative overflow-hidden">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"
                />
              </div>

              {/* Watchlist Button Skeleton */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-gray-700 rounded-full relative overflow-hidden">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"
                />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-5 bg-gray-700 rounded w-3/4 relative overflow-hidden">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"
                />
              </div>

              {/* Year */}
              <div className="h-4 bg-gray-700 rounded w-1/4 relative overflow-hidden">
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"
                />
              </div>

              {/* Genres */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-700 rounded-full w-16 relative overflow-hidden">
                  <motion.div
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"
                  />
                </div>
                <div className="h-6 bg-gray-700 rounded-full w-20 relative overflow-hidden">
                  <motion.div
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center py-8"
      >
        <div className="flex items-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent" />
          <span>Searching movies...</span>
        </div>
      </motion.div>
    </div>
  )
}

export default SearchSkeleton;