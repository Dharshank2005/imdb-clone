"use client"

import { SlidersHorizontal } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { MOVIES } from "../data/movies"
import MovieCard from "../components/MovieCard.tsx"

const MovieList = () => {
  const [searchParams] = useSearchParams()
  const search = searchParams.get("search")

  const filteredMovies = search
    ? MOVIES.filter(
        (movie) =>
          movie.title.toLowerCase().includes(search.toLowerCase()) ||
          movie.genre.some((g) => g.toLowerCase().includes(search.toLowerCase())),
      )
    : MOVIES

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{search ? `Search Results for "${search}"` : "Popular Movies"}</h1>
        <button className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-xl hover:bg-gray-900 transition-colors">
          <SlidersHorizontal /> Filters
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredMovies.map((movie) => (
          <Link key={movie.id} to={`/movie/${movie.id}`}>
            <MovieCard {...movie} />
          </Link>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No movies found</div>
          <p className="text-gray-500">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}

export default MovieList
