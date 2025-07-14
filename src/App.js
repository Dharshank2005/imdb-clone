import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar.tsx"
import Home from "./pages/Home.tsx"
import Search from "./pages/Search.tsx"
import MovieList from "./pages/MovieList.tsx"
import MovieDetails from "./pages/MovieDetails.tsx"
import TopRated from "./pages/Toprated.tsx"
import Profile from "./pages/Profile.tsx"
import ComingSoon from "./pages/ComingSoon.tsx"
import ActorDetails from "./pages/Actordetails.tsx"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App bg-gray-900 min-h-screen text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movies" element={<MovieList />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/top-rated" element={<TopRated />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/actor/:id" element={<ActorDetails />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
