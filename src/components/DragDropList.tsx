"use client"

import type React from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { GripVertical, X, Star, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface Movie {
  id: string
  title: string
  image: string
  year: number
  rating?: number
  genre?: string[]
  addedAt?: string
}

interface DragDropEnhancedProps {
  items: Movie[]
  onReorder: (items: Movie[]) => void
  onRemove: (id: string) => void
  title: string
}

const DragDropEnhanced: React.FC<DragDropEnhancedProps> = ({ items, onReorder, onRemove, title }) => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, reorderedItem)

    onReorder(newItems)
  }

  if (items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No movies in your {title.toLowerCase()}</div>
        <p className="text-gray-500">Start adding movies to see them here!</p>
      </motion.div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="enhanced-list">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-4 transition-all duration-300 ${
              snapshot.isDraggingOver
                ? "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg p-4 border-2 border-dashed border-yellow-500/30"
                : ""
            }`}
          >
            {items.map((movie, index) => (
              <Draggable key={movie.id} draggableId={movie.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 ${
                      snapshot.isDragging
                        ? "shadow-2xl scale-105 rotate-2 bg-gray-700/70 border-2 border-yellow-500/50"
                        : "hover:bg-gray-700/50 hover:shadow-lg"
                    }`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        {...provided.dragHandleProps}
                        className={`text-gray-400 hover:text-yellow-500 cursor-grab active:cursor-grabbing transition-colors ${
                          snapshot.isDragging ? "text-yellow-500" : ""
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <GripVertical size={20} />
                      </motion.div>

                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <img
                            src={movie.image || "/placeholder.svg"}
                            alt={movie.title}
                            className="w-16 h-24 object-cover rounded-lg transition-transform duration-200"
                          />
                          {snapshot.isDragging && <div className="absolute inset-0 bg-yellow-500/20 rounded-lg" />}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 hover:text-yellow-500 transition-colors">
                            {movie.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                            <span>{movie.year}</span>
                            {movie.rating && (
                              <div className="flex items-center gap-1">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span>{movie.rating}</span>
                              </div>
                            )}
                            {movie.addedAt && (
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>Added {new Date(movie.addedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          {movie.genre && (
                            <div className="flex gap-2">
                              {movie.genre.slice(0, 3).map((g) => (
                                <motion.span
                                  key={g}
                                  className="text-xs px-2 py-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {g}
                                </motion.span>
                              ))}
                              {movie.genre.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-400">
                                  +{movie.genre.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <motion.button
                        onClick={() => onRemove(movie.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={20} />
                      </motion.button>
                    </div>

                    {/* Drag indicator */}
                    {snapshot.isDragging && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-2 -left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium"
                      >
                        Moving...
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Drop zone indicator */}
            {snapshot.isDraggingOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 text-yellow-500 font-medium"
              >
                Drop here to reorder
              </motion.div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DragDropEnhanced
