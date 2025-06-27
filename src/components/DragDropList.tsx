"use client"

import type React from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { GripVertical, X, Star, Clock } from "lucide-react"
import { AnimatePresence } from "framer-motion"

interface Movie {
  id: string
  title: string
  image: string
  year: number
  rating?: number
  genre?: string[]
  addedAt?: string
}

interface DragDropListProps {
  items: Movie[]
  onReorder: (items: Movie[]) => void
  onRemove: (id: string) => void
  title: string
}

const DragDropList: React.FC<DragDropListProps> = ({ items, onReorder, onRemove, title }) => {
  const handleDragEnd = (result: DropResult) => {
    // If dropped outside the list or no destination
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    // If dropped in the same position
    if (sourceIndex === destinationIndex) {
      return
    }

    // Create a new array with the reordered items
    const reorderedItems = Array.from(items)
    const [movedItem] = reorderedItems.splice(sourceIndex, 1)
    reorderedItems.splice(destinationIndex, 0, movedItem)

    // Call the onReorder callback immediately
    onReorder(reorderedItems)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No movies in your {title.toLowerCase()}</div>
        <p className="text-gray-500">Start adding movies to see them here!</p>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="watchlist-droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 min-h-[200px] transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-yellow-500/5 rounded-lg p-2" : ""
            }`}
          >
            <AnimatePresence>
              {items.map((movie, index) => (
                <Draggable key={movie.id} draggableId={movie.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 transition-all duration-200 ${
                        snapshot.isDragging
                          ? "shadow-2xl scale-[1.02] rotate-1 bg-gray-700/70 border border-yellow-500/50 z-50"
                          : "hover:bg-gray-700/50"
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className={`text-gray-400 hover:text-yellow-500 cursor-grab active:cursor-grabbing transition-colors p-1 ${
                            snapshot.isDragging ? "text-yellow-500" : ""
                          }`}
                        >
                          <GripVertical size={20} />
                        </div>

                        {/* Movie Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={movie.image || "/placeholder.svg"}
                            alt={movie.title}
                            className="w-16 h-24 object-cover rounded-lg"
                            draggable={false}
                          />
                        </div>

                        {/* Movie Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1 truncate">{movie.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                            <span>{movie.year}</span>
                            {movie.rating && (
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
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
                            <div className="flex gap-2 flex-wrap">
                              {movie.genre.slice(0, 3).map((g) => (
                                <span key={g} className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                                  {g}
                                </span>
                              ))}
                              {movie.genre.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-400">
                                  +{movie.genre.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => onRemove(movie.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10 flex-shrink-0"
                          type="button"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Drag Indicator */}
                      {snapshot.isDragging && (
                        <div className="absolute -top-2 -left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                          Moving...
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}

            {/* Drop Zone Indicator */}
            {snapshot.isDraggingOver && items.length > 0 && (
              <div className="text-center py-4 text-yellow-500 font-medium border-2 border-dashed border-yellow-500/30 rounded-lg">
                Drop here to reorder
              </div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DragDropList
