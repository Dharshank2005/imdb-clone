import "./App.css"
import Navbar from "./components/Navbar.tsx"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home.tsx"
import ActorDetails from "./pages/Actordetails.tsx"
import MovieList from "./pages/MovieList.tsx"
import MovieDetails from "./pages/MovieDetails.tsx"
import TopRated from "./pages/Toprated.tsx"
import Profile from "./pages/Profile.tsx"
import ComingSoon from "./pages/ComingSoon.tsx"
import { SearchProvider } from "./contexts/SearchContext.tsx"
import Search from "./pages/Search.tsx"

function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MovieList />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/actor/:id" element={<ActorDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </BrowserRouter>
    </SearchProvider>
  )
}

export default App
